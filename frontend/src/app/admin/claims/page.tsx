'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { getAllClaims } from '@/lib/api/admin'
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
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  UserCheck,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

interface Claim {
  id: string
  claim_number: string
  user: {
    name: string
    email: string
  }
  policy: {
    number: string
    type: string
  }
  amount: number
  description: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'settled'
  priority: 'high' | 'medium' | 'low'
  submitted_date: string
  assessor?: string
  documents_count: number
}

const mockClaims: Claim[] = [
  {
    id: '1',
    claim_number: 'CLM-2026-001',
    user: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    policy: {
      number: 'POL-2026-001',
      type: 'Motor - Comprehensive'
    },
    amount: 150000,
    description: 'Vehicle accident on Mombasa Road, front bumper damaged',
    status: 'pending',
    priority: 'high',
    submitted_date: '2026-01-27T08:00:00Z',
    documents_count: 3
  },
  {
    id: '2',
    claim_number: 'CLM-2026-002',
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    policy: {
      number: 'POL-2026-045',
      type: 'Home Insurance'
    },
    amount: 80000,
    description: 'Water damage from burst pipe in kitchen',
    status: 'under_review',
    priority: 'medium',
    submitted_date: '2026-01-26T14:30:00Z',
    assessor: 'Sarah Williams',
    documents_count: 5
  },
  {
    id: '3',
    claim_number: 'CLM-2026-003',
    user: {
      name: 'Mike Johnson',
      email: 'mike@example.com'
    },
    policy: {
      number: 'POL-2026-089',
      type: 'Motor - Third Party'
    },
    amount: 45000,
    description: 'Minor collision at parking lot',
    status: 'approved',
    priority: 'low',
    submitted_date: '2026-01-25T10:15:00Z',
    assessor: 'Sarah Williams',
    documents_count: 2
  },
  {
    id: '4',
    claim_number: 'CLM-2026-004',
    user: {
      name: 'Emily Brown',
      email: 'emily@example.com'
    },
    policy: {
      number: 'POL-2026-034',
      type: 'Travel Insurance'
    },
    amount: 25000,
    description: 'Flight cancellation due to medical emergency',
    status: 'rejected',
    priority: 'medium',
    submitted_date: '2026-01-24T16:00:00Z',
    assessor: 'Sarah Williams',
    documents_count: 1
  },
  {
    id: '5',
    claim_number: 'CLM-2026-005',
    user: {
      name: 'David Wilson',
      email: 'david@example.com'
    },
    policy: {
      number: 'POL-2026-012',
      type: 'Motor - Comprehensive'
    },
    amount: 200000,
    description: 'Total loss from fire incident',
    status: 'settled',
    priority: 'high',
    submitted_date: '2026-01-20T09:00:00Z',
    assessor: 'Sarah Williams',
    documents_count: 8
  }
]

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | 'assign' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [assessorName, setAssessorName] = useState('')

  // Load claims from API on mount
  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    setIsLoading(true)
    try {
      const response = await getAllClaims()
      setClaims(response.results)
    } catch (error: any) {
      console.error('Failed to load claims:', error)
      toast.error('Failed to load claims')
      // Fallback to mock data on error
      setClaims(mockClaims)
    } finally {
      setIsLoading(false)
    }
  }

  const filterClaims = (status?: string) => {
    let filtered = claims

    if (searchQuery) {
      filtered = filtered.filter(claim =>
        claim.claim_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.policy.number.toLowerCase().includes(searchQuery.toLowerCase())
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
    setAssessorName(claim.assessor || '')
    setIsActionModalOpen(true)
  }

  const handleExecuteAction = async () => {
    if (!selectedClaim || !action) return

    try {
      let newStatus = selectedClaim.status

      if (action === 'approve') {
        newStatus = 'approved'
        toast.success(`Claim ${selectedClaim.claim_number} approved`)
      } else if (action === 'reject') {
        if (!actionReason.trim()) {
          toast.error('Please provide a reason for rejection')
          return
        }
        newStatus = 'rejected'
        toast.success(`Claim ${selectedClaim.claim_number} rejected`)
      } else if (action === 'assign') {
        if (!assessorName.trim()) {
          toast.error('Please select an assessor')
          return
        }
        newStatus = 'under_review'
        toast.success(`Claim assigned to ${assessorName}`)
      }

      // Update claim status
      setClaims(claims.map(c =>
        c.id === selectedClaim.id
          ? { ...c, status: newStatus, assessor: assessorName || c.assessor }
          : c
      ))

      setIsActionModalOpen(false)
      setSelectedClaim(null)
      setAction(null)
    } catch (error) {
      toast.error('Action failed')
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
    const configs: Record<string, { variant: any, icon: any, label: string }> = {
      pending: {
        variant: 'secondary',
        icon: <Clock className="h-3 w-3" />,
        label: 'Pending'
      },
      under_review: {
        variant: 'default',
        icon: <AlertCircle className="h-3 w-3" />,
        label: 'Under Review'
      },
      approved: {
        variant: 'default',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Approved'
      },
      rejected: {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
        label: 'Rejected'
      },
      settled: {
        variant: 'outline',
        icon: <CheckCircle className="h-3 w-3" />,
        label: 'Settled'
      }
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
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }

    return (
      <span className={`text-xs px-2 py-1 rounded ${colors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    )
  }

  const ClaimCard = ({ claim }: { claim: Claim }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
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

          {/* Policy info */}
          <div className="text-sm">
            <p className="text-muted-foreground">Policy: {claim.policy.number}</p>
            <p className="font-medium">{claim.policy.type}</p>
          </div>

          {/* Description */}
          <p className="text-sm line-clamp-2">{claim.description}</p>

          {/* Amount & Date */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-lg">{formatCurrency(claim.amount)}</span>
            <span className="text-muted-foreground">{formatDate(claim.submitted_date)}</span>
          </div>

          {/* Assessor */}
          {claim.assessor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              <span>Assigned to {claim.assessor}</span>
            </div>
          )}

          {/* Documents */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{claim.documents_count} documents</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {claim.status === 'pending' && (
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleOpenAction(claim, 'assign')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Assign
              </Button>
            )}
            {claim.status === 'under_review' && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleOpenAction(claim, 'approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleOpenAction(claim, 'reject')}
                >
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

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Claims Processing</h1>
        <p className="text-muted-foreground mt-1">
          Review and process insurance claims
        </p>
      </div>

      {/* Search */}
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

      {/* Claims tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingClaims.length})
          </TabsTrigger>
          <TabsTrigger value="under_review">
            Under Review ({underReviewClaims.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Claims ({allClaims.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingClaims.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No pending claims</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingClaims.map(claim => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="under_review" className="space-y-4">
          {underReviewClaims.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No claims under review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {underReviewClaims.map(claim => (
                <ClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allClaims.map(claim => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
                <Select value={assessorName} onValueChange={setAssessorName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Williams">Sarah Williams</SelectItem>
                    <SelectItem value="John Smith">John Smith</SelectItem>
                    <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                  </SelectContent>
                </Select>
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

            {action === 'approve' && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Are you sure you want to approve this claim for {selectedClaim && formatCurrency(selectedClaim.amount)}?
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExecuteAction}>
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
