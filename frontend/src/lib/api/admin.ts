import { apiClient } from './client'

// ==================== Types ====================

export interface AdminDashboardData {
  metrics: {
    total_users: number
    users_growth: number
    active_policies: number
    policies_growth: number
    total_revenue: number
    revenue_growth: number
    pending_claims: number
    claims_change: number
  }
  recent_transactions: Transaction[]
  recent_users: User[]
  pending_tasks: Task[]
}

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: 'customer' | 'staff' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  created_at: string
  policies_count: number
  total_spent: number
}

export interface Transaction {
  id: string
  transaction_reference: string
  user: {
    id: string
    name: string
  }
  amount: number
  payment_method: 'mpesa' | 'card'
  status: 'completed' | 'pending' | 'failed'
  created_at: string
  policy?: {
    id: string
    policy_number: string
  }
}

export interface Claim {
  id: string
  claim_number: string
  user: {
    id: string
    name: string
    email: string
  }
  policy: {
    id: string
    policy_number: string
    policy_type: string
  }
  claim_amount: number
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'settled'
  priority: 'low' | 'medium' | 'high'
  description: string
  documents_count: number
  assigned_to?: {
    id: string
    name: string
  }
  submitted_at: string
  updated_at: string
}

export interface PolicyType {
  id: string
  name: string
  category: string
  description: string
  base_premium: number
  is_active: boolean
  created_at: string
}

export interface InsuranceCompany {
  id: string
  name: string
  code: string
  commission_rate: number
  is_active: boolean
  logo?: string
  contact_email: string
  contact_phone: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

export interface ReportData {
  sales?: {
    total_sales: number
    growth: number
    by_category: Array<{ category: string; count: number; amount: number }>
  }
  revenue?: {
    total_revenue: number
    growth: number
    by_period: Array<{ period: string; amount: number }>
  }
  claims?: {
    total_claims: number
    claims_ratio: number
    avg_settlement: number
    by_status: Array<{ status: string; count: number }>
  }
  users?: {
    total_users: number
    new_users: number
    retention_rate: number
    by_role: Array<{ role: string; count: number }>
  }
}

// ==================== Caching ====================

let adminDashboardCache: { data: AdminDashboardData; timestamp: number } | null = null
let usersCache: { data: { results: User[]; count: number }; timestamp: number; params: string } | null = null
let claimsCache: { data: { results: Claim[]; count: number }; timestamp: number; params: string } | null = null
let transactionsCache: { data: { results: Transaction[]; count: number }; timestamp: number; params: string } | null = null
const CACHE_DURATION = 60000 // 1 minute

export const clearAdminCaches = () => {
  adminDashboardCache = null
  usersCache = null
  claimsCache = null
  transactionsCache = null
}

// ==================== Dashboard ====================

export const getAdminDashboard = async (forceRefresh = false): Promise<AdminDashboardData> => {
  // Check cache first
  if (!forceRefresh && adminDashboardCache) {
    const now = Date.now()
    if (now - adminDashboardCache.timestamp < CACHE_DURATION) {
      return adminDashboardCache.data
    }
  }

  const response = await apiClient.get('/api/v1/admin/dashboard/')
  const data = response.data

  // Update cache
  adminDashboardCache = {
    data,
    timestamp: Date.now()
  }

  return data
}

// ==================== User Management ====================

export const getAllUsers = async (params?: {
  search?: string
  role?: string
  status?: string
  page?: number
}, forceRefresh = false): Promise<{ results: User[]; count: number }> => {
  const paramsKey = JSON.stringify(params || {})

  // Check cache first
  if (!forceRefresh && usersCache && usersCache.params === paramsKey) {
    const now = Date.now()
    if (now - usersCache.timestamp < CACHE_DURATION) {
      return usersCache.data
    }
  }

  const response = await apiClient.get('/api/v1/admin/users/', { params })
  const data = response.data

  // Update cache
  usersCache = {
    data,
    timestamp: Date.now(),
    params: paramsKey
  }

  return data
}

export const getUserById = async (userId: string): Promise<User> => {
  const response = await apiClient.get(`/api/v1/admin/users/${userId}/`)
  return response.data
}

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await apiClient.post('/api/v1/admin/users/', userData)
  return response.data
}

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
  const response = await apiClient.patch(`/api/v1/admin/users/${userId}/`, userData)
  return response.data
}

export const deleteUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/users/${userId}/`)
}

export const suspendUser = async (userId: string): Promise<User> => {
  const response = await apiClient.post(`/api/v1/admin/users/${userId}/suspend/`)
  return response.data
}

export const activateUser = async (userId: string): Promise<User> => {
  const response = await apiClient.post(`/api/v1/admin/users/${userId}/activate/`)
  return response.data
}

export const getUserActivityLog = async (userId: string): Promise<any[]> => {
  const response = await apiClient.get(`/api/v1/admin/users/${userId}/activity-log/`)
  return response.data
}

// ==================== Claims Processing ====================

export const getAllClaims = async (params?: {
  status?: string
  priority?: string
  assigned_to?: string
  page?: number
}, forceRefresh = false): Promise<{ results: Claim[]; count: number }> => {
  const paramsKey = JSON.stringify(params || {})

  // Check cache first
  if (!forceRefresh && claimsCache && claimsCache.params === paramsKey) {
    const now = Date.now()
    if (now - claimsCache.timestamp < CACHE_DURATION) {
      return claimsCache.data
    }
  }

  const response = await apiClient.get('/api/v1/admin/claims/', { params })
  const data = response.data

  // Update cache
  claimsCache = {
    data,
    timestamp: Date.now(),
    params: paramsKey
  }

  return data
}

export const getClaimById = async (claimId: string): Promise<Claim> => {
  const response = await apiClient.get(`/api/v1/admin/claims/${claimId}/`)
  return response.data
}

export const assignClaim = async (claimId: string, assessorId: string): Promise<Claim> => {
  const response = await apiClient.patch(`/api/v1/admin/claims/${claimId}/assign/`, {
    assessor_id: assessorId
  })
  return response.data
}

export const approveClaim = async (claimId: string, settlementAmount: number): Promise<Claim> => {
  const response = await apiClient.patch(`/api/v1/admin/claims/${claimId}/approve/`, {
    settlement_amount: settlementAmount
  })
  return response.data
}

export const rejectClaim = async (claimId: string, reason: string): Promise<Claim> => {
  const response = await apiClient.patch(`/api/v1/admin/claims/${claimId}/reject/`, {
    rejection_reason: reason
  })
  return response.data
}

export const requestClaimDocuments = async (claimId: string, message: string): Promise<void> => {
  await apiClient.post(`/api/v1/admin/claims/${claimId}/request-documents/`, {
    message
  })
}

export const settleClaim = async (claimId: string): Promise<Claim> => {
  const response = await apiClient.post(`/api/v1/admin/claims/${claimId}/settle/`)
  return response.data
}

// ==================== Policy Management ====================

export const getAllPolicyTypes = async (): Promise<PolicyType[]> => {
  const response = await apiClient.get('/api/v1/admin/policy-types/')
  return response.data
}

export const createPolicyType = async (policyTypeData: Partial<PolicyType>): Promise<PolicyType> => {
  const response = await apiClient.post('/api/v1/admin/policy-types/', policyTypeData)
  return response.data
}

export const updatePolicyType = async (policyTypeId: string, policyTypeData: Partial<PolicyType>): Promise<PolicyType> => {
  const response = await apiClient.patch(`/api/v1/admin/policy-types/${policyTypeId}/`, policyTypeData)
  return response.data
}

export const deletePolicyType = async (policyTypeId: string): Promise<void> => {
  await apiClient.delete(`/api/v1/admin/policy-types/${policyTypeId}/`)
}

export const bulkUploadPolicyTypes = async (file: File): Promise<{ success: number; errors: any[] }> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post('/api/v1/admin/policy-types/bulk-upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const getAllInsuranceCompanies = async (): Promise<InsuranceCompany[]> => {
  const response = await apiClient.get('/api/v1/admin/insurance-companies/')
  return response.data
}

export const createInsuranceCompany = async (companyData: Partial<InsuranceCompany>): Promise<InsuranceCompany> => {
  const response = await apiClient.post('/api/v1/admin/insurance-companies/', companyData)
  return response.data
}

export const updateInsuranceCompany = async (companyId: string, companyData: Partial<InsuranceCompany>): Promise<InsuranceCompany> => {
  const response = await apiClient.patch(`/api/v1/admin/insurance-companies/${companyId}/`, companyData)
  return response.data
}

export const approvePolicy = async (policyId: string): Promise<any> => {
  const response = await apiClient.patch(`/api/v1/admin/policies/${policyId}/approve/`)
  return response.data
}

export const cancelPolicy = async (policyId: string, reason: string): Promise<any> => {
  const response = await apiClient.patch(`/api/v1/admin/policies/${policyId}/cancel/`, {
    cancellation_reason: reason
  })
  return response.data
}

// ==================== Transaction Management ====================

export const getAllTransactions = async (params?: {
  status?: string
  payment_method?: string
  search?: string
  date_from?: string
  date_to?: string
  page?: number
}, forceRefresh = false): Promise<{ results: Transaction[]; count: number }> => {
  const paramsKey = JSON.stringify(params || {})

  // Check cache first
  if (!forceRefresh && transactionsCache && transactionsCache.params === paramsKey) {
    const now = Date.now()
    if (now - transactionsCache.timestamp < CACHE_DURATION) {
      return transactionsCache.data
    }
  }

  const response = await apiClient.get('/api/v1/admin/transactions/', { params })
  const data = response.data

  // Update cache
  transactionsCache = {
    data,
    timestamp: Date.now(),
    params: paramsKey
  }

  return data
}

export const getTransactionById = async (transactionId: string): Promise<Transaction> => {
  const response = await apiClient.get(`/api/v1/admin/transactions/${transactionId}/`)
  return response.data
}

export const processRefund = async (transactionId: string, reason: string): Promise<Transaction> => {
  const response = await apiClient.post(`/api/v1/admin/transactions/${transactionId}/refund/`, {
    reason
  })
  return response.data
}

export const reconcilePayments = async (date: string): Promise<{ reconciled: number; errors: any[] }> => {
  const response = await apiClient.post('/api/v1/admin/transactions/reconcile/', {
    date
  })
  return response.data
}

export const getFailedTransactions = async (): Promise<Transaction[]> => {
  const response = await apiClient.get('/api/v1/admin/transactions/failed/')
  return response.data
}

export const retryTransaction = async (transactionId: string): Promise<Transaction> => {
  const response = await apiClient.post(`/api/v1/admin/transactions/${transactionId}/retry/`)
  return response.data
}

// ==================== Reports ====================

export const getSalesReport = async (params?: {
  date_from?: string
  date_to?: string
  category?: string
}): Promise<ReportData> => {
  const response = await apiClient.get('/api/v1/admin/reports/sales/', { params })
  return response.data
}

export const getRevenueReport = async (params?: {
  date_from?: string
  date_to?: string
  period?: 'daily' | 'weekly' | 'monthly'
}): Promise<ReportData> => {
  const response = await apiClient.get('/api/v1/admin/reports/revenue/', { params })
  return response.data
}

export const getClaimsReport = async (params?: {
  date_from?: string
  date_to?: string
}): Promise<ReportData> => {
  const response = await apiClient.get('/api/v1/admin/reports/claims/', { params })
  return response.data
}

export const getUserGrowthReport = async (params?: {
  date_from?: string
  date_to?: string
}): Promise<ReportData> => {
  const response = await apiClient.get('/api/v1/admin/reports/user-growth/', { params })
  return response.data
}

export const generateCustomReport = async (reportConfig: any): Promise<any> => {
  const response = await apiClient.post('/api/v1/admin/reports/custom/', reportConfig)
  return response.data
}

export const exportReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> => {
  const response = await apiClient.get(`/api/v1/admin/reports/export/${reportId}/`, {
    params: { format },
    responseType: 'blob'
  })
  return response.data
}

// ==================== Settings ====================

export const getSettings = async (): Promise<any> => {
  const response = await apiClient.get('/api/v1/admin/settings/')
  return response.data
}

export const updateSettings = async (settings: any): Promise<any> => {
  const response = await apiClient.patch('/api/v1/admin/settings/', settings)
  return response.data
}

export const getRoles = async (): Promise<any[]> => {
  const response = await apiClient.get('/api/v1/admin/roles/')
  return response.data
}

export const createRole = async (roleData: any): Promise<any> => {
  const response = await apiClient.post('/api/v1/admin/roles/', roleData)
  return response.data
}

export const updateRole = async (roleId: string, roleData: any): Promise<any> => {
  const response = await apiClient.patch(`/api/v1/admin/roles/${roleId}/`, roleData)
  return response.data
}
