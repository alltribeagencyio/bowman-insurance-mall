'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
import { Search, Plus, Edit, Trash2, Upload, Loader2, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAllPolicyTypes, createPolicyType, updatePolicyType, deletePolicyType, bulkUploadPolicyTypes,
  getAllInsuranceCompanies, createInsuranceCompany, updateInsuranceCompany,
  approvePolicy, cancelPolicy,
  type PolicyType, type InsuranceCompany
} from '@/lib/api/admin'
import { getErrorMessage } from '@/lib/api/errors'
import { apiClient } from '@/lib/api/client'

// Minimal UserPolicy type for admin view
interface UserPolicy {
  id: string
  policy_number: string
  policy_type: { name: string; category: string }
  user: { first_name: string; last_name: string; email: string }
  premium_amount: number
  status: string
  start_date: string
  end_date: string
}

const CATEGORIES = ['Motor', 'Medical', 'Life', 'Home', 'Travel', 'Business']

// ─── Policy Type Form Dialog ───────────────────────────────────────────────
interface PolicyTypeDialogProps {
  open: boolean
  initial?: PolicyType | null
  onClose: () => void
  onSaved: () => void
}

function PolicyTypeDialog({ open, initial, onClose, onSaved }: PolicyTypeDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    description: initial?.description ?? '',
    base_premium: initial?.base_premium ?? 0,
    is_active: initial?.is_active ?? true,
  })

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name ?? '',
        category: initial?.category ?? '',
        description: initial?.description ?? '',
        base_premium: initial?.base_premium ?? 0,
        is_active: initial?.is_active ?? true,
      })
    }
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.category) {
      toast.error('Name and category are required')
      return
    }
    setIsSaving(true)
    try {
      if (initial) {
        await updatePolicyType(initial.id, form)
        toast.success('Policy type updated')
      } else {
        await createPolicyType(form)
        toast.success('Policy type created')
      }
      onSaved()
      onClose()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save policy type'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Policy Type' : 'Add Policy Type'}</DialogTitle>
          <DialogDescription>Fill in the policy type details below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Motor - Comprehensive" required />
          </div>
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Brief description of coverage..." />
          </div>
          <div className="space-y-2">
            <Label>Base Premium (KES)</Label>
            <Input type="number" value={form.base_premium} onChange={e => setForm(f => ({ ...f, base_premium: Number(e.target.value) }))} min={0} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {initial ? 'Save Changes' : 'Create Policy Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Company Form Dialog ───────────────────────────────────────────────────
interface CompanyDialogProps {
  open: boolean
  initial?: InsuranceCompany | null
  onClose: () => void
  onSaved: () => void
}

function CompanyDialog({ open, initial, onClose, onSaved }: CompanyDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    code: initial?.code ?? '',
    commission_rate: initial?.commission_rate ?? 0,
    contact_email: initial?.contact_email ?? '',
    contact_phone: initial?.contact_phone ?? '',
    logo: initial?.logo ?? '',
    is_active: initial?.is_active ?? true,
  })

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name ?? '',
        code: initial?.code ?? '',
        commission_rate: initial?.commission_rate ?? 0,
        contact_email: initial?.contact_email ?? '',
        contact_phone: initial?.contact_phone ?? '',
        logo: initial?.logo ?? '',
        is_active: initial?.is_active ?? true,
      })
    }
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.code) {
      toast.error('Name and code are required')
      return
    }
    setIsSaving(true)
    try {
      if (initial) {
        await updateInsuranceCompany(initial.id, form)
        toast.success('Company updated')
      } else {
        await createInsuranceCompany(form)
        toast.success('Company created')
      }
      onSaved()
      onClose()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to save company'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Company' : 'Add Insurance Company'}</DialogTitle>
          <DialogDescription>Fill in the company details below</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Jubilee Insurance" required />
            </div>
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. JUB" maxLength={10} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Commission Rate (%)</Label>
            <Input type="number" value={form.commission_rate} onChange={e => setForm(f => ({ ...f, commission_rate: Number(e.target.value) }))} min={0} max={100} step={0.1} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} placeholder="+254..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {initial ? 'Save Changes' : 'Add Company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function PoliciesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Policy types state
  const [policyTypes, setPolicyTypes] = useState<PolicyType[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(true)
  const [showPolicyTypeDialog, setShowPolicyTypeDialog] = useState(false)
  const [editingPolicyType, setEditingPolicyType] = useState<PolicyType | null>(null)
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null)
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const bulkFileRef = useRef<HTMLInputElement>(null)

  // User policies state
  const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([])
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false)
  const [cancellingPolicyId, setCancellingPolicyId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  // Companies state
  const [companies, setCompanies] = useState<InsuranceCompany[]>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [showCompanyDialog, setShowCompanyDialog] = useState(false)
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null)

  useEffect(() => {
    loadPolicyTypes()
    loadCompanies()
  }, [])

  const loadPolicyTypes = async () => {
    setIsLoadingTypes(true)
    try {
      const data = await getAllPolicyTypes()
      setPolicyTypes(Array.isArray(data) ? data : [])
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to load policy types'))
    } finally {
      setIsLoadingTypes(false)
    }
  }

  const loadCompanies = async () => {
    setIsLoadingCompanies(true)
    try {
      const data = await getAllInsuranceCompanies()
      setCompanies(Array.isArray(data) ? data : [])
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to load companies'))
    } finally {
      setIsLoadingCompanies(false)
    }
  }

  const loadUserPolicies = async () => {
    setIsLoadingPolicies(true)
    try {
      const response = await apiClient.get('admin/policies/')
      setUserPolicies(response.data?.results || [])
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to load user policies'))
    } finally {
      setIsLoadingPolicies(false)
    }
  }

  const handleDeleteType = async () => {
    if (!deletingTypeId) return
    try {
      await deletePolicyType(deletingTypeId)
      toast.success('Policy type deleted')
      setDeletingTypeId(null)
      await loadPolicyTypes()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to delete policy type'))
    }
  }

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsBulkUploading(true)
    try {
      const result = await bulkUploadPolicyTypes(file)
      toast.success(`Uploaded ${result.success} policy types successfully`)
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} rows had errors`)
      }
      await loadPolicyTypes()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Bulk upload failed'))
    } finally {
      setIsBulkUploading(false)
      if (bulkFileRef.current) bulkFileRef.current.value = ''
    }
  }

  const handleApprovePolicy = async (policyId: string) => {
    try {
      await approvePolicy(policyId)
      toast.success('Policy approved')
      await loadUserPolicies()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to approve policy'))
    }
  }

  const handleCancelPolicy = async () => {
    if (!cancellingPolicyId) return
    try {
      await cancelPolicy(cancellingPolicyId, cancelReason)
      toast.success('Policy cancelled')
      setShowCancelDialog(false)
      setCancellingPolicyId(null)
      setCancelReason('')
      await loadUserPolicies()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to cancel policy'))
    }
  }

  const filteredTypes = policyTypes.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Policy Management</h1>
        <p className="text-muted-foreground mt-1">Manage policy types, user policies, and insurance companies</p>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList>
          <TabsTrigger value="types">Policy Types</TabsTrigger>
          <TabsTrigger value="user-policies" onClick={loadUserPolicies}>User Policies</TabsTrigger>
          <TabsTrigger value="companies">Insurance Companies</TabsTrigger>
        </TabsList>

        {/* ── Policy Types Tab ── */}
        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Policy Types</CardTitle>
                  <CardDescription>Manage available insurance policy types</CardDescription>
                </div>
                <div className="flex gap-2">
                  <input
                    ref={bulkFileRef}
                    type="file"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={handleBulkUpload}
                  />
                  <Button variant="outline" onClick={() => bulkFileRef.current?.click()} disabled={isBulkUploading}>
                    {isBulkUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Bulk Upload
                  </Button>
                  <Button onClick={() => { setEditingPolicyType(null); setShowPolicyTypeDialog(true) }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Policy Type
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policy types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {isLoadingTypes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTypes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No policy types found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Policy Name</th>
                        <th className="text-left p-4 font-medium">Category</th>
                        <th className="text-left p-4 font-medium">Base Premium</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTypes.map((type) => (
                        <tr key={type.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{type.name}</td>
                          <td className="p-4">{type.category}</td>
                          <td className="p-4">{formatCurrency(type.base_premium)}</td>
                          <td className="p-4">
                            <Badge variant={type.is_active ? 'default' : 'secondary'}>
                              {type.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setEditingPolicyType(type); setShowPolicyTypeDialog(true) }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingTypeId(type.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── User Policies Tab ── */}
        <TabsContent value="user-policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Policies</CardTitle>
              <CardDescription>All customer insurance policies</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPolicies ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : userPolicies.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No user policies found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Policy #</th>
                        <th className="text-left p-4 font-medium">Customer</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Premium</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPolicies.map((policy) => (
                        <tr key={policy.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-mono text-sm">{policy.policy_number}</td>
                          <td className="p-4">{policy.user.first_name} {policy.user.last_name}</td>
                          <td className="p-4">{policy.policy_type.name}</td>
                          <td className="p-4">{formatCurrency(policy.premium_amount)}</td>
                          <td className="p-4">
                            <Badge variant={policy.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {policy.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              {policy.status === 'pending' && (
                                <Button size="sm" variant="default" onClick={() => handleApprovePolicy(policy.id)}>
                                  Approve
                                </Button>
                              )}
                              {policy.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setCancellingPolicyId(policy.id)
                                    setCancelReason('')
                                    setShowCancelDialog(true)
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Companies Tab ── */}
        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Insurance Companies</CardTitle>
                  <CardDescription>Manage insurance company partners</CardDescription>
                </div>
                <Button onClick={() => { setEditingCompany(null); setShowCompanyDialog(true) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCompanies ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No insurance companies found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Company Name</th>
                        <th className="text-left p-4 font-medium">Code</th>
                        <th className="text-left p-4 font-medium">Commission %</th>
                        <th className="text-left p-4 font-medium">Contact</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => (
                        <tr key={company.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{company.name}</td>
                          <td className="p-4 font-mono text-sm">{company.code}</td>
                          <td className="p-4">{company.commission_rate}%</td>
                          <td className="p-4 text-sm text-muted-foreground">{company.contact_email}</td>
                          <td className="p-4">
                            <Badge variant={company.is_active ? 'default' : 'secondary'}>
                              {company.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => { setEditingCompany(company); setShowCompanyDialog(true) }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CRUD Dialogs */}
      <PolicyTypeDialog
        open={showPolicyTypeDialog}
        initial={editingPolicyType}
        onClose={() => setShowPolicyTypeDialog(false)}
        onSaved={loadPolicyTypes}
      />

      <CompanyDialog
        open={showCompanyDialog}
        initial={editingCompany}
        onClose={() => setShowCompanyDialog(false)}
        onSaved={loadCompanies}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deletingTypeId} onOpenChange={(o) => !o && setDeletingTypeId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Policy Type?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Existing customer policies of this type will not be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTypeId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteType}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel policy dialog */}
      <Dialog open={showCancelDialog} onOpenChange={(o) => !o && setShowCancelDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Policy</DialogTitle>
            <DialogDescription>Please provide a reason for cancellation</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Cancellation Reason *</Label>
            <Textarea
              placeholder="Enter reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleCancelPolicy} disabled={!cancelReason.trim()}>
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
