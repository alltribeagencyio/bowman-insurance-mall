# API Integration Guide - Phase 7

This guide shows how to integrate the newly created API clients and components into the Phase 7 dashboard pages.

---

## 📦 Available API Clients

All API clients are located in `frontend/src/lib/api/`:

- `policies.ts` - Policy management
- `documents.ts` - Document management
- `beneficiaries.ts` - Beneficiary management
- `dashboard.ts` - Dashboard data
- `profile.ts` - User profile & settings
- `payments.ts` - Payment operations (Phase 6)

---

## 🔧 Components Created

### Modals
- **BeneficiaryModal** - `components/dashboard/beneficiary-modal.tsx`
  - Add/edit beneficiaries with validation
  - Percentage allocation tracking
  - Primary beneficiary toggle

- **DocumentUploadModal** - `components/dashboard/document-upload-modal.tsx`
  - File upload with progress tracking
  - File type & size validation
  - Support for PDF, JPG, PNG, DOC

### UI Components
- **Dialog** - `components/ui/dialog.tsx`
- **Select** - `components/ui/select.tsx`
- **Progress** - `components/ui/progress.tsx`

---

## 📝 Integration Examples

### 1. My Policies Page - API Integration

**File:** `frontend/src/app/dashboard/my-policies/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getUserPolicies, getPolicyStats, type Policy } from '@/lib/api/policies'
import { toast } from 'sonner'

// Replace mock data with API calls
function MyPoliciesContent() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Fetch policies on mount
  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = async () => {
    setIsLoading(true)
    try {
      const [policiesData, statsData] = await Promise.all([
        getUserPolicies(),
        getPolicyStats()
      ])

      setPolicies(policiesData)
      setStats(statsData)
    } catch (error: any) {
      toast.error('Failed to load policies')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter policies based on search and status
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch =
      policy.policy_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.policy_type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.insurance_company.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading policies...</p>
      </div>
    </div>
  }

  // Rest of component...
}
```

---

### 2. Documents Page - With Upload Modal

**File:** `frontend/src/app/dashboard/documents/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getUserDocuments, deleteDocument, downloadDocument, type Document } from '@/lib/api/documents'
import { DocumentUploadModal } from '@/components/dashboard/document-upload-modal'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'

function DocumentsContent() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const data = await getUserDocuments()
      setDocuments(data)
    } catch (error: any) {
      toast.error('Failed to load documents')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await downloadDocument(doc.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Document downloaded')
    } catch (error) {
      toast.error('Failed to download document')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await deleteDocument(id)
      setDocuments(docs => docs.filter(d => d.id !== id))
      toast.success('Document deleted')
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  return (
    <div>
      {/* Header with Upload Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Documents grid... */}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={loadDocuments}
      />
    </div>
  )
}
```

---

### 3. Profile Page - With Beneficiary Modal

**File:** `frontend/src/app/dashboard/profile/page.tsx` (Beneficiaries Tab)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getBeneficiaries, deleteBeneficiary, type Beneficiary } from '@/lib/api/beneficiaries'
import { BeneficiaryModal } from '@/components/dashboard/beneficiary-modal'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

function BeneficiariesTab() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null)

  useEffect(() => {
    loadBeneficiaries()
  }, [])

  const loadBeneficiaries = async () => {
    setIsLoading(true)
    try {
      const data = await getBeneficiaries()
      setBeneficiaries(data)
    } catch (error) {
      toast.error('Failed to load beneficiaries')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary)
    setIsBeneficiaryModalOpen(true)
  }

  const handleAdd = () => {
    setEditingBeneficiary(null)
    setIsBeneficiaryModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this beneficiary?')) return

    try {
      await deleteBeneficiary(id)
      setBeneficiaries(bens => bens.filter(b => b.id !== id))
      toast.success('Beneficiary removed')
    } catch (error) {
      toast.error('Failed to remove beneficiary')
    }
  }

  const handleModalClose = () => {
    setIsBeneficiaryModalOpen(false)
    setEditingBeneficiary(null)
  }

  const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0)

  return (
    <div>
      {/* Add Beneficiary Button */}
      <Button onClick={handleAdd}>
        <Plus className="h-4 w-4 mr-2" />
        Add Beneficiary
      </Button>

      {/* Beneficiaries List */}
      {beneficiaries.map((beneficiary) => (
        <div key={beneficiary.id}>
          {/* Beneficiary card... */}
          <Button variant="outline" size="sm" onClick={() => handleEdit(beneficiary)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDelete(beneficiary.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Beneficiary Modal */}
      <BeneficiaryModal
        isOpen={isBeneficiaryModalOpen}
        onClose={handleModalClose}
        beneficiary={editingBeneficiary}
        onSuccess={loadBeneficiaries}
        existingPercentage={totalPercentage}
      />
    </div>
  )
}
```

---

### 4. Dashboard Page - Real Data

**File:** `frontend/src/app/dashboard/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getDashboardData, type DashboardData } from '@/lib/api/dashboard'
import { toast } from 'sonner'

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setIsLoading(true)
    try {
      const dashboardData = await getDashboardData()
      setData(dashboardData)
    } catch (error: any) {
      toast.error('Failed to load dashboard')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return <div>Failed to load dashboard</div>
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.policies.active}</div>
            <p>Active Policies</p>
          </CardContent>
        </Card>
        {/* More cards... */}
      </div>

      {/* Recent Activity */}
      <div>
        {data.recentActivity.map((activity) => (
          <div key={activity.id}>{activity.title}</div>
        ))}
      </div>

      {/* Recommendations */}
      <div>
        {data.recommendations.map((rec) => (
          <div key={rec.id}>{rec.title}</div>
        ))}
      </div>
    </div>
  )
}
```

---

### 5. Policy Detail Page - With API

**File:** `frontend/src/app/policies/details/[id]/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getPolicyById, cancelPolicy, type PolicyDetail } from '@/lib/api/policies'
import { toast } from 'sonner'

function PolicyDetailContent() {
  const params = useParams()
  const [policy, setPolicy] = useState<PolicyDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadPolicy(params.id as string)
    }
  }, [params.id])

  const loadPolicy = async (id: string) => {
    setIsLoading(true)
    try {
      const data = await getPolicyById(id)
      setPolicy(data)
    } catch (error) {
      toast.error('Failed to load policy')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelPolicy = async () => {
    if (!policy) return
    if (!confirm('Are you sure you want to cancel this policy?')) return

    try {
      await cancelPolicy(policy.id)
      toast.success('Policy cancelled successfully')
      // Reload policy to get updated status
      loadPolicy(policy.id)
    } catch (error) {
      toast.error('Failed to cancel policy')
    }
  }

  if (isLoading) {
    return <div>Loading policy...</div>
  }

  if (!policy) {
    return <div>Policy not found</div>
  }

  // Render policy details...
}
```

---

## 🔄 Profile Settings - API Integration

### Password Change

```typescript
import { changePassword } from '@/lib/api/profile'

const handlePasswordChange = async (data: { current_password: string, new_password: string }) => {
  try {
    await changePassword(data)
    toast.success('Password changed successfully')
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to change password')
  }
}
```

### Notification Preferences

```typescript
import { updateNotificationPreferences } from '@/lib/api/profile'

const handleSaveNotifications = async (preferences: any) => {
  try {
    await updateNotificationPreferences(preferences)
    toast.success('Notification preferences saved')
  } catch (error) {
    toast.error('Failed to save preferences')
  }
}
```

---

## 🚀 Best Practices

### 1. Loading States
Always show loading indicators while fetching data:
```typescript
if (isLoading) {
  return <LoadingSpinner />
}
```

### 2. Error Handling
Catch and display user-friendly error messages:
```typescript
try {
  await apiCall()
} catch (error: any) {
  const message = error.response?.data?.message || error.message || 'Operation failed'
  toast.error(message)
}
```

### 3. Optimistic Updates
Update UI immediately, then sync with server:
```typescript
// Update local state first
setData(newData)

// Then sync with server
try {
  await apiCall()
} catch (error) {
  // Revert on error
  setData(oldData)
  toast.error('Failed to update')
}
```

### 4. Data Refreshing
Reload data after successful operations:
```typescript
const handleSuccess = async () => {
  await loadData() // Refresh from server
  toast.success('Operation successful')
}
```

---

## 📋 Next Steps

1. **Replace mock data** in each page with API calls
2. **Add loading states** to all data fetching operations
3. **Implement error boundaries** for better error handling
4. **Add pagination** for lists with many items
5. **Implement caching** with React Query or SWR
6. **Add real-time updates** with WebSockets (optional)

---

## 🔗 API Endpoints Required (Backend)

Make sure these endpoints exist in your Django backend:

### Policies
- `GET /api/v1/policies/my-policies/` - List user policies
- `GET /api/v1/policies/my-policies/{id}/` - Get policy details
- `GET /api/v1/policies/my-policies/stats/` - Get policy stats
- `POST /api/v1/policies/{id}/cancel/` - Cancel policy
- `POST /api/v1/policies/{id}/renew/` - Renew policy
- `GET /api/v1/policies/{id}/certificate/` - Download certificate

### Documents
- `GET /api/v1/documents/` - List user documents
- `POST /api/v1/documents/upload/` - Upload document
- `GET /api/v1/documents/{id}/download/` - Download document
- `DELETE /api/v1/documents/{id}/` - Delete document
- `GET /api/v1/documents/stats/` - Get document stats

### Beneficiaries
- `GET /api/v1/users/beneficiaries/` - List beneficiaries
- `POST /api/v1/users/beneficiaries/` - Create beneficiary
- `PATCH /api/v1/users/beneficiaries/{id}/` - Update beneficiary
- `DELETE /api/v1/users/beneficiaries/{id}/` - Delete beneficiary

### Dashboard
- `GET /api/v1/dashboard/` - Get dashboard overview
- `GET /api/v1/dashboard/stats/` - Get dashboard stats
- `GET /api/v1/dashboard/activity/` - Get recent activity
- `GET /api/v1/dashboard/recommendations/` - Get recommendations

### Profile
- `PATCH /api/v1/users/profile/` - Update profile
- `POST /api/v1/users/change-password/` - Change password
- `GET /api/v1/users/notification-preferences/` - Get preferences
- `PATCH /api/v1/users/notification-preferences/` - Update preferences

---

## ✅ Implementation Checklist

- [x] API client functions created
- [x] Beneficiary modal component created
- [x] Document upload modal created
- [x] UI components (Dialog, Select, Progress) created
- [ ] Integrate APIs into My Policies page
- [ ] Integrate APIs into Documents page
- [ ] Integrate APIs into Pending Payments page
- [ ] Integrate APIs into Dashboard page
- [ ] Integrate APIs into Policy Detail page
- [ ] Integrate APIs into Profile page
- [ ] Add loading states everywhere
- [ ] Add error handling everywhere
- [ ] Test all API integrations
- [ ] Add pagination where needed

---

**Note:** This guide provides the foundation for API integration. Actual integration requires replacing mock data in each page component with the corresponding API calls shown in the examples above.
