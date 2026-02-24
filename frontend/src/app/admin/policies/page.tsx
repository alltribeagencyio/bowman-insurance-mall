'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
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
import { Search, Plus, Edit, Trash2, Upload, Loader2, Building2, ChevronDown, ChevronRight, CheckCircle2, XCircle, Star } from 'lucide-react'
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
  companies: InsuranceCompany[]
  onClose: () => void
  onSaved: () => void
}

function PolicyTypeDialog({ open, initial, companies, onClose, onSaved }: PolicyTypeDialogProps) {
  const [isSaving, setIsSaving] = useState(false)

  const blankForm = () => ({
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    insurance_company: initial?.insurance_company ?? '',
    description: initial?.description ?? '',
    base_premium: Number(initial?.base_premium ?? 0),
    min_coverage_amount: Number(initial?.min_coverage_amount ?? 0),
    max_coverage_amount: Number(initial?.max_coverage_amount ?? 0),
    features: initial?.features?.length ? [...initial.features] : [''],
    exclusions: initial?.exclusions?.length ? [...initial.exclusions] : [''],
    status: (initial?.status ?? 'published') as 'draft' | 'published' | 'delisted',
    is_active: initial?.is_active ?? true,
    is_featured: initial?.is_featured ?? false,
  })

  const [form, setForm] = useState(blankForm)

  useEffect(() => {
    if (open) setForm(blankForm())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial])

  const setList = (key: 'features' | 'exclusions', idx: number, val: string) =>
    setForm(f => { const arr = [...f[key]]; arr[idx] = val; return { ...f, [key]: arr } })

  const addListItem = (key: 'features' | 'exclusions') =>
    setForm(f => ({ ...f, [key]: [...f[key], ''] }))

  const removeListItem = (key: 'features' | 'exclusions', idx: number) =>
    setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.category || !form.insurance_company) {
      toast.error('Name, category, and insurance company are required')
      return
    }
    const payload = {
      ...form,
      features: form.features.filter(f => f.trim()),
      exclusions: form.exclusions.filter(e => e.trim()),
    }
    setIsSaving(true)
    try {
      if (initial) {
        await updatePolicyType(initial.id, payload)
        toast.success('Policy type updated')
      } else {
        await createPolicyType(payload)
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Policy Type' : 'Add Policy Type'}</DialogTitle>
          <DialogDescription>Fill in all policy details — these appear on the customer-facing product page</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Basic Info ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Policy Name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Comprehensive Motor Insurance" required />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Insurance Company *</Label>
              <Select value={form.insurance_company} onValueChange={v => setForm(f => ({ ...f, insurance_company: v }))}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe what this policy covers, who it's for, and key benefits..." required />
          </div>

          {/* ── Pricing & Coverage ── */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Base Premium (KES)</Label>
              <Input type="number" value={form.base_premium} onChange={e => setForm(f => ({ ...f, base_premium: Number(e.target.value) }))} min={0} placeholder="e.g. 15000" />
            </div>
            <div className="space-y-2">
              <Label>Min Coverage (KES)</Label>
              <Input type="number" value={form.min_coverage_amount} onChange={e => setForm(f => ({ ...f, min_coverage_amount: Number(e.target.value) }))} min={0} placeholder="e.g. 500000" />
            </div>
            <div className="space-y-2">
              <Label>Max Coverage (KES)</Label>
              <Input type="number" value={form.max_coverage_amount} onChange={e => setForm(f => ({ ...f, max_coverage_amount: Number(e.target.value) }))} min={0} placeholder="e.g. 10000000" />
            </div>
          </div>

          {/* ── Features (What's Covered) ── */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              What&apos;s Covered (Features)
            </Label>
            <div className="space-y-2 rounded-md border p-3 bg-green-50/50 dark:bg-green-950/20">
              {form.features.map((feat, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={feat}
                    onChange={e => setList('features', i, e.target.value)}
                    placeholder="e.g. Accident damage cover up to vehicle value"
                    className="text-sm"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeListItem('features', i)} className="shrink-0">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addListItem('features')} className="mt-1">
                <Plus className="h-3 w-3 mr-1" /> Add Feature
              </Button>
            </div>
          </div>

          {/* ── Exclusions (What's Not Covered) ── */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              What&apos;s Not Covered (Exclusions)
            </Label>
            <div className="space-y-2 rounded-md border p-3 bg-red-50/50 dark:bg-red-950/20">
              {form.exclusions.map((excl, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={excl}
                    onChange={e => setList('exclusions', i, e.target.value)}
                    placeholder="e.g. Wear and tear"
                    className="text-sm"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeListItem('exclusions', i)} className="shrink-0">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addListItem('exclusions')} className="mt-1">
                <Plus className="h-3 w-3 mr-1" /> Add Exclusion
              </Button>
            </div>
          </div>

          {/* ── Status & Visibility ── */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as 'draft' | 'published' | 'delisted' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published (visible to customers)</SelectItem>
                  <SelectItem value="draft">Draft (hidden)</SelectItem>
                  <SelectItem value="delisted">Delisted (removed from sale)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center justify-between p-3 rounded-md border">
                <Label className="cursor-pointer">Active</Label>
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              </div>
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center justify-between p-3 rounded-md border">
                <Label className="cursor-pointer flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" /> Featured
                </Label>
                <Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
              </div>
            </div>
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
    description: initial?.description ?? '',
    contact_email: initial?.contact_email ?? '',
    contact_phone: initial?.contact_phone ?? '',
    logo: initial?.logo ?? '',
    website: initial?.website ?? '',
    rating: initial?.rating ?? 0,
    is_active: initial?.is_active ?? true,
  })

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        contact_email: initial?.contact_email ?? '',
        contact_phone: initial?.contact_phone ?? '',
        logo: initial?.logo ?? '',
        website: initial?.website ?? '',
        rating: initial?.rating ?? 0,
        is_active: initial?.is_active ?? true,
      })
    }
  }, [open, initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Company name is required')
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
          <div className="space-y-2">
            <Label>Company Name *</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Jubilee Insurance" required />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description..." />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Rating (0–5)</Label>
              <Input type="number" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))} min={0} max={5} step={0.1} />
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
  const [expandedTypeId, setExpandedTypeId] = useState<string | null>(null)
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
                        <th className="w-10 p-4"></th>
                        <th className="text-left p-4 font-medium">Policy Name</th>
                        <th className="text-left p-4 font-medium">Category</th>
                        <th className="text-left p-4 font-medium">Base Premium</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTypes.map((type) => {
                        const hasDetails = (type.features?.length ?? 0) > 0 || (type.exclusions?.length ?? 0) > 0
                        const isExpanded = expandedTypeId === type.id
                        return (
                          <Fragment key={type.id}>
                            <tr className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  disabled={!hasDetails}
                                  onClick={() => setExpandedTypeId(isExpanded ? null : type.id)}
                                  title={hasDetails ? 'View features / exclusions' : 'No features added yet'}
                                >
                                  {isExpanded
                                    ? <ChevronDown className="h-4 w-4" />
                                    : <ChevronRight className={`h-4 w-4 ${!hasDetails ? 'text-muted-foreground/30' : ''}`} />
                                  }
                                </Button>
                              </td>
                              <td className="p-4 font-medium">
                                <div className="flex items-center gap-2">
                                  {type.name}
                                  {type.is_featured && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                                </div>
                              </td>
                              <td className="p-4">{type.category}</td>
                              <td className="p-4">{formatCurrency(type.base_premium)}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Badge variant={type.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                                    {type.status}
                                  </Badge>
                                  {!type.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                                </div>
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
                            {isExpanded && hasDetails && (
                              <tr className="bg-muted/20 border-b">
                                <td />
                                <td colSpan={5} className="px-4 pb-4 pt-2">
                                  <div className="grid grid-cols-2 gap-6">
                                    {(type.features?.length ?? 0) > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-2">
                                          <CheckCircle2 className="h-3 w-3" /> What&apos;s Covered
                                        </p>
                                        <ul className="space-y-1">
                                          {type.features.map((feat, i) => (
                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                              <span className="text-green-600 shrink-0 mt-0.5">✓</span>
                                              {feat}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {(type.exclusions?.length ?? 0) > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1 mb-2">
                                          <XCircle className="h-3 w-3" /> What&apos;s Not Covered
                                        </p>
                                        <ul className="space-y-1">
                                          {type.exclusions.map((excl, i) => (
                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                              <span className="text-red-500 shrink-0 mt-0.5">✗</span>
                                              {excl}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
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
                        <th className="text-left p-4 font-medium">Rating</th>
                        <th className="text-left p-4 font-medium">Contact</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => (
                        <tr key={company.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 font-medium">{company.name}</td>
                          <td className="p-4 text-sm">{company.rating ? `${company.rating}/5` : '—'}</td>
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
        companies={companies}
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
