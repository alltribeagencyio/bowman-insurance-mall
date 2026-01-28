# Phase 7: Quick Reference Card

Quick access guide for developers working on Phase 7 integration.

---

## 🚀 Quick Start

### Import API Clients
```typescript
// Policies
import { getUserPolicies, getPolicyById } from '@/lib/api/policies'

// Documents
import { getUserDocuments, uploadDocument } from '@/lib/api/documents'

// Beneficiaries
import { getBeneficiaries, createBeneficiary } from '@/lib/api/beneficiaries'

// Dashboard
import { getDashboardData } from '@/lib/api/dashboard'

// Profile
import { updateUserProfile, changePassword } from '@/lib/api/profile'
```

### Import Modals
```typescript
import { BeneficiaryModal } from '@/components/dashboard/beneficiary-modal'
import { DocumentUploadModal } from '@/components/dashboard/document-upload-modal'
```

### Import UI Components
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
```

---

## 📝 Common Patterns

### Fetch Data on Mount
```typescript
const [data, setData] = useState([])
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  loadData()
}, [])

const loadData = async () => {
  setIsLoading(true)
  try {
    const result = await apiFunction()
    setData(result)
  } catch (error) {
    toast.error('Failed to load data')
  } finally {
    setIsLoading(false)
  }
}
```

### Show Loading State
```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
```

### Handle Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    await apiFunction(formData)
    toast.success('Success!')
    onSuccess() // Refresh data
  } catch (error: any) {
    const message = error.response?.data?.message || 'Operation failed'
    toast.error(message)
  } finally {
    setIsLoading(false)
  }
}
```

### Use Beneficiary Modal
```typescript
const [isModalOpen, setIsModalOpen] = useState(false)
const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null)

// Add new
const handleAdd = () => {
  setEditingBeneficiary(null)
  setIsModalOpen(true)
}

// Edit existing
const handleEdit = (beneficiary: Beneficiary) => {
  setEditingBeneficiary(beneficiary)
  setIsModalOpen(true)
}

// Render modal
<BeneficiaryModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  beneficiary={editingBeneficiary}
  onSuccess={loadBeneficiaries}
  existingPercentage={totalPercentage}
/>
```

### Use Document Upload Modal
```typescript
const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

<DocumentUploadModal
  isOpen={isUploadModalOpen}
  onClose={() => setIsUploadModalOpen(false)}
  onSuccess={loadDocuments}
  policyId={policyId} // Optional
/>
```

### Download File
```typescript
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
    toast.success('Download started')
  } catch (error) {
    toast.error('Download failed')
  }
}
```

### Delete with Confirmation
```typescript
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return

  try {
    await deleteFunction(id)
    setData(data.filter(item => item.id !== id))
    toast.success('Deleted successfully')
  } catch (error) {
    toast.error('Delete failed')
  }
}
```

---

## 🔗 API Endpoints

### Policies
- `GET /api/v1/policies/my-policies/` - List policies
- `GET /api/v1/policies/my-policies/{id}/` - Get details
- `POST /api/v1/policies/{id}/cancel/` - Cancel policy

### Documents
- `GET /api/v1/documents/` - List documents
- `POST /api/v1/documents/upload/` - Upload file
- `GET /api/v1/documents/{id}/download/` - Download file
- `DELETE /api/v1/documents/{id}/` - Delete file

### Beneficiaries
- `GET /api/v1/users/beneficiaries/` - List all
- `POST /api/v1/users/beneficiaries/` - Create new
- `PATCH /api/v1/users/beneficiaries/{id}/` - Update
- `DELETE /api/v1/users/beneficiaries/{id}/` - Delete

### Dashboard
- `GET /api/v1/dashboard/` - Get overview

### Profile
- `PATCH /api/v1/users/profile/` - Update profile
- `POST /api/v1/users/change-password/` - Change password

---

## 🎨 Component Props

### BeneficiaryModal
```typescript
interface BeneficiaryModalProps {
  isOpen: boolean                    // Modal visibility
  onClose: () => void                // Close handler
  beneficiary?: Beneficiary | null   // Edit mode if provided
  onSuccess: () => void              // Called after save
  existingPercentage: number         // Total of other beneficiaries
}
```

### DocumentUploadModal
```typescript
interface DocumentUploadModalProps {
  isOpen: boolean           // Modal visibility
  onClose: () => void       // Close handler
  onSuccess: () => void     // Called after upload
  policyId?: string         // Optional policy association
}
```

---

## 📦 TypeScript Interfaces

### Policy
```typescript
interface Policy {
  id: string
  policy_number: string
  policy_type: { id: string, name: string }
  insurance_company: { id: string, name: string }
  status: 'active' | 'pending' | 'expired' | 'cancelled'
  coverage_amount: number
  premium_amount: number
  premium_frequency: 'monthly' | 'quarterly' | 'annually'
  start_date: string
  end_date: string
}
```

### Document
```typescript
interface Document {
  id: string
  name: string
  type: 'certificate' | 'receipt' | 'id' | 'claim' | 'other'
  file_type: string
  size: number
  policy?: { id: string, policy_number: string }
  uploaded_at: string
  verified: boolean
  url: string
}
```

### Beneficiary
```typescript
interface Beneficiary {
  id: string
  name: string
  relationship: string
  percentage: number
  phone: string
  email: string
  is_primary: boolean
}
```

---

## 🛠️ Utility Functions

### Format Currency
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES'
  }).format(amount)
}
```

### Format Date
```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
```

### Calculate Days Remaining
```typescript
const getDaysRemaining = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
```

### Get Time Ago
```typescript
const getTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}
```

---

## 🐛 Common Issues

### Issue: CORS Error
**Solution:** Ensure backend allows frontend origin in CORS settings

### Issue: 401 Unauthorized
**Solution:** Check if access token is valid and not expired

### Issue: TypeScript Error
**Solution:** Import type definitions from API client files

### Issue: Modal Not Closing
**Solution:** Ensure onClose callback is connected to state setter

### Issue: File Upload Fails
**Solution:** Check file size (<10MB) and type (PDF, JPG, PNG, DOC)

---

## 📚 Resources

- **Full Guide:** `API_INTEGRATION_GUIDE.md`
- **Progress:** `PHASE_7_PROGRESS.md`
- **Summary:** `PHASE_7_COMPLETION_SUMMARY.md`
- **Radix UI:** https://www.radix-ui.com/
- **Axios Docs:** https://axios-http.com/

---

**Last Updated:** January 27, 2026
**Phase:** 7 - Customer Dashboard Enhancement
**Status:** ✅ Complete
