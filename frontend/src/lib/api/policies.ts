import { apiClient } from './client'

export interface Policy {
  id: string
  policy_number: string
  user?: string
  user_name?: string
  user_email?: string
  policy_type: string
  policy_type_name: string
  insurance_company: string
  company_name: string
  company_logo?: string
  category_name: string
  status: 'active' | 'pending' | 'expired' | 'cancelled'
  coverage_amount: number
  premium_amount: number
  premium_frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annually'
  start_date: string
  end_date: string
  policy_data?: any
  certificate_url?: string
  policy_document_url?: string
  beneficiaries?: any
  days_to_expiry?: number
  is_active?: boolean
  created_at: string
  updated_at: string
  activated_at?: string
  cancelled_at?: string
}

export interface PolicyDetail extends Policy {
  vehicle_details?: {
    make: string
    model: string
    year: number
    registration: string
    value: number
  }
  coverage_details: {
    third_party_limit?: number
    comprehensive_value?: number
    windscreen_cover?: number
    passenger_liability?: number
    medical_expenses?: number
  }
  payment_history: Array<{
    id: string
    transaction_id: string
    amount: number
    date: string
    status: 'completed' | 'pending' | 'failed'
    method: string
  }>
  claims_history: Array<{
    id: string
    claim_number: string
    date: string
    type: string
    amount: number
    status: 'pending' | 'approved' | 'rejected' | 'processing'
  }>
  documents: Array<{
    id: string
    name: string
    type: string
    size: number
    uploaded_at: string
    url: string
  }>
  beneficiaries: Array<{
    id: string
    name: string
    relationship: string
    percentage: number
  }>
  timeline: Array<{
    id: string
    type: 'payment' | 'claim' | 'policy'
    event: string
    description: string
    date: string
  }>
}

// Simple cache for policies
let policiesCache: { data: Policy[]; timestamp: number } | null = null
const CACHE_DURATION = 60000 // 1 minute

// Get all user policies
export const getUserPolicies = async (forceRefresh = false): Promise<Policy[]> => {
  // Check cache first
  if (!forceRefresh && policiesCache) {
    const now = Date.now()
    if (now - policiesCache.timestamp < CACHE_DURATION) {
      return policiesCache.data
    }
  }

  const response = await apiClient.get('/policies/my-policies/')
  const data = response.data

  // Update cache
  policiesCache = {
    data,
    timestamp: Date.now()
  }

  return data
}

// Clear policies cache (call after creating/updating a policy)
export const clearPoliciesCache = () => {
  policiesCache = null
}

// Get policy by ID
export const getPolicyById = async (id: string): Promise<PolicyDetail> => {
  const response = await apiClient.get(`/policies/my-policies/${id}/`)
  return response.data
}

// Get policy statistics
export const getPolicyStats = async () => {
  const response = await apiClient.get('/policies/my-policies/stats/')
  return response.data
}

// Cancel policy
export const cancelPolicy = async (id: string, reason?: string) => {
  const response = await apiClient.post(`/policies/${id}/cancel/`, { reason })
  return response.data
}

// Renew policy
export const renewPolicy = async (id: string) => {
  const response = await apiClient.post(`/policies/${id}/renew/`)
  return response.data
}

// Download policy certificate
export const downloadPolicyCertificate = async (id: string) => {
  const response = await apiClient.get(`/policies/${id}/certificate/`, {
    responseType: 'blob',
  })
  return response.data
}
