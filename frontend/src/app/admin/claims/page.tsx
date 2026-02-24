'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  getAllClaims, assignClaim, approveClaim, rejectClaim,
  type Claim
} from '@/lib/api/admin'
import { getErrorMessage } from '@/lib/api/errors'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  UserCheck,
  Loader2,
} from 'lucide-react'

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActioning, setIsActioning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | 'assign' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [settlementAmount, setSettlementAmount] = useState('')
  const [assessorId, setAssessorId] = useState('')

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    setIsLoading(true)
    try {
      const response = await getAllClaims()
      setClaims(response.results || [])
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to load claims'))
    } finally {
      setIsLoading(false)
    }
  }

  const filterClaims = (status?: string) => {
    let filtered = claims

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(claim =>
        claim.claim_number.toLowerCase().includes(q) ||
        claim.user.name.toLowerCase().includes(q) ||
        claim.policy.policy_number.toLowerCase().includes(q)
      )
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(claim => claim.status === status)
    }

    return filtered
  }

  const pendingClaims = filterClaims('pending')
  const underReviewClaims = filterClaims('under_review')
  const allClaims = filterClaims()

  const handleOpenAction = (claim: Claim, actionType: 'approve' | 'reject' | 'assign') => {
    setSelectedClaim(claim)
    setAction(actionType)
    setActionReason('')
    setSettlementAmount(String(claim.claim_amount))
    setAssessorId('')
    setIsActionModalOpen(true)
  }

  const handleExecuteAction = async () => {
    if (!selectedClaim || !action) return

    if (action === 'reject' && !actionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    if (action === 'assign' && !assessorId.trim()) {
      toast.error('Please select an assessor')
      return
    }

    setIsActioning(true)
    try {
      if (action === 'approve') {
        await approveClaim(selectedClaim.id, Number(settlementAmount) || selectedClaim.claim_amount)
        toast.success(`Claim ${selectedClaim.claim_number} approved`)
      } else if (action === 'reject') {
        await rejectClaim(selectedClaim.id, actionReason)
        toast.success(`Claim ${selectedClaim.claim_number} rejected`)
      } else if (action === 'assign') {
        await assignClaim(selectedClaim.id, assessorId)
        toast.success('Claim assigned successfully')
      }
      setIsActionModalOpen(false)
      setSelectedClaim(null)
      setAction(null)
      await loadClaims()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Action failed. Please try again.'))
    } finally {
      setIsActioning(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / 3600000)
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffHours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3" />, label: 'Pending' },
      under_review: { variant: 'default', icon: <AlertCircle className="h-3 w-3" />, label: 'Under Review' },
      approved: { variant: 'default', icon: <CheckCircle className="h-3 w-3" />, label: 'Approved' },
      rejected: { variant: 'destructive', icon: <XCircle className="h-3 w-3" />, label: 'Rejected' },
      settled: { variant: 'outline', icon: <CheckCircle className="h-3 w-3" />, label: 'Settled' },
    }
    const config = configs[status] || configs.pending
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    }
    return (
      <span className={`text-xs px-2 py-1 rounded ${colors[priority] || colors.low}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  const ClaimCard = ({ claim }: { claim: Claim }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{claim.claim_number}</h3>
                {getPriorityBadge(claim.priority)}
              </div>
              <p className="text-sm text-muted-foreground">{claim.user.name}</p>
            </div>
            {getStatusBadge(claim.status)}
          </div>

          <div className="text-sm">
            <p className="text-muted-foreground">Policy: {claim.policy.policy_number}</p>
            <p className="font-medium">{claim.policy.policy_type}</p>
          </div>

          <p className="text-sm line-clamp-2">{claim.description}</p>

          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-lg">{formatCurrency(claim.claim_amount)}</span>
            <span className="text-muted-foreground">{formatDate(claim.submitted_at)}</span>
          </div>

          {claim.assigned_to && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              <span>Assigned to {claim.assigned_to.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{claim.documents_count} documents</span>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {claim.status === 'pending' && (
              <Button size="sm" className="flex-1" onClick={() => handleOpenAction(claim, 'assign')}>
                <UserCheck className="h-4 w-4 mr-2" />
                Assign
              </Button>
            )}
            {claim.status === 'under_review' && (
              <>
                <Button size="sm" variant="default" onClick={() => handleOpenAction(claim, 'approve')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleOpenAction(claim, 'reject')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const EmptyState = ({ message }: { message: string }) => (
    <Card>
      <CardContent className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Claims Processing</h1>
        <p className="text-muted-foreground mt-1">Review and process insurance claims</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by claim number, policy, or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingClaims.length})</TabsTrigger>
            <TabsTrigger value="under_review">Under Review ({underReviewClaims.length})</TabsTrigger>
            <TabsTrigger value="all">All Claims ({allClaims.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingClaims.length === 0 ? (
              <EmptyState message="No pending claims" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingClaims.map(claim => <ClaimCard key={claim.id} claim={claim} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="under_review" className="space-y-4">
            {underReviewClaims.length === 0 ? (
              <EmptyState message="No claims under review" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {underReviewClaims.map(claim => <ClaimCard key={claim.id} claim={claim} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {allClaims.length === 0 ? (
              <EmptyState message="No claims found" />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allClaims.map(claim => <ClaimCard key={claim.id} claim={claim} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Action modal */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' && 'Approve Claim'}
              {action === 'reject' && 'Reject Claim'}
              {action === 'assign' && 'Assign Claim'}
            </DialogTitle>
            <DialogDescription>
              {selectedClaim && `Claim: ${selectedClaim.claim_number}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {action === 'assign' && (
              <div className="space-y-2">
                <Label>Assign to Assessor</Label>
                <Select value={assessorId} onValueChange={setAssessorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assessor-1">Sarah Williams</SelectItem>
                    <SelectItem value="assessor-2">John Smith</SelectItem>
                    <SelectItem value="assessor-3">Mike Johnson</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Contact admin to manage assessor accounts</p>
              </div>
            )}

            {action === 'approve' && (
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Claim amount: {selectedClaim && formatCurrency(selectedClaim.claim_amount)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settlement">Settlement Amount (KES)</Label>
                  <Input
                    id="settlement"
                    type="number"
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                  />
                </div>
              </div>
            )}

            {action === 'reject' && (
              <div className="space-y-2">
                <Label>Reason for Rejection *</Label>
                <Textarea
                  placeholder="Provide a reason for rejecting this claim..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)} disabled={isActioning}>
              Cancel
            </Button>
            <Button onClick={handleExecuteAction} disabled={isActioning}>
              {isActioning && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {action === 'approve' && 'Approve Claim'}
              {action === 'reject' && 'Reject Claim'}
              {action === 'assign' && 'Assign Claim'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
