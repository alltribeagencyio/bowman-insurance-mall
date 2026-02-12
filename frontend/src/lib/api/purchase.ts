import { apiClient } from './client'

export interface PolicyPurchaseInput {
  policy_type: string
  insurance_company: string
  start_date: string
  end_date: string
  premium_amount: string
  coverage_amount: string
  payment_frequency: 'monthly' | 'quarterly' | 'annually'
  policy_data?: any
  beneficiaries?: Array<{
    name: string
    relationship: string
    phone_number: string
    percentage: number
  }>
}

export interface PurchasedPolicy {
  id: string
  policy_number: string
  status: 'pending' | 'active' | 'expired' | 'cancelled'
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
  start_date: string
  end_date: string
  premium_amount: string
  coverage_amount: string
  payment_frequency: string
  created_at: string
}

export interface QuoteRequest {
  policy_type_id: string
  coverage_amount: string
  start_date: string
  additional_info?: any
}

export interface QuoteResponse {
  policy_type: {
    id: string
    name: string
  }
  coverage_amount: string
  base_premium: string
  taxes: string
  fees: string
  total_premium: string
  payment_options: Array<{
    frequency: string
    amount: string
    description: string
  }>
  valid_until: string
}

// Purchase a policy
export const purchasePolicy = async (data: PolicyPurchaseInput): Promise<PurchasedPolicy> => {
  const response = await apiClient.post('/policies/my-policies/', data)
  return response.data
}

// Get quote for a policy
export const getQuote = async (data: QuoteRequest): Promise<QuoteResponse> => {
  const response = await apiClient.post('/policies/quote/', data)
  return response.data
}

// Calculate premium (helper function)
export const calculatePremium = (
  basePremium: number,
  coverageAmount: number,
  frequency: 'monthly' | 'quarterly' | 'annually',
  additionalFactors?: {
    age?: number
    location?: string
    riskLevel?: string
  }
): {
  base: number
  taxes: number
  fees: number
  total: number
  perPayment: number
} => {
  const base = basePremium
  const taxes = base * 0.16 // 16% VAT in Kenya
  const fees = 500 // Processing fees
  const total = base + taxes + fees

  let perPayment = total
  if (frequency === 'monthly') {
    perPayment = total / 12
  } else if (frequency === 'quarterly') {
    perPayment = total / 4
  }

  return {
    base,
    taxes,
    fees,
    total,
    perPayment: Math.round(perPayment * 100) / 100
  }
}

// Validate policy dates
export const validatePolicyDates = (
  startDate: string,
  endDate: string
): { valid: boolean; error?: string } => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()

  if (start < today) {
    return { valid: false, error: 'Start date cannot be in the past' }
  }

  if (end <= start) {
    return { valid: false, error: 'End date must be after start date' }
  }

  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 30) {
    return { valid: false, error: 'Policy duration must be at least 30 days' }
  }

  if (diffDays > 730) {
    return { valid: false, error: 'Policy duration cannot exceed 2 years' }
  }

  return { valid: true }
}

// Generate policy end date based on frequency
export const generateEndDate = (
  startDate: string,
  frequency: 'monthly' | 'quarterly' | 'annually'
): string => {
  const start = new Date(startDate)

  if (frequency === 'annually') {
    start.setFullYear(start.getFullYear() + 1)
  } else if (frequency === 'quarterly') {
    start.setMonth(start.getMonth() + 3)
  } else {
    start.setMonth(start.getMonth() + 1)
  }

  return start.toISOString().split('T')[0]
}
