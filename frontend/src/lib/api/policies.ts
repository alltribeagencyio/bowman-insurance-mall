import { apiClient } from './client'

export interface Policy {
  id: string
  policy_number: string
  policy_type: {
    id: string
    name: string
    category: string
  }
  insurance_company: {
    id: string
    name: string
    logo?: string
  }
  status: 'active' | 'pending' | 'expired' | 'cancelled'
  coverage_amount: number
  premium_amount: number
  premium_frequency: 'monthly' | 'quarterly' | 'annually'
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
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

// Get all user policies
export const getUserPolicies = async (): Promise<Policy[]> => {
  const response = await apiClient.get('/policies/my-policies/')
  return response.data
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
