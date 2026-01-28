// User types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
  role: 'customer' | 'staff' | 'admin' | 'assessor'
  is_staff?: boolean
  is_verified: boolean
  created_at: string
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

// Policy types
export interface Policy {
  id: string
  policy_number: string
  policy_type: PolicyType
  insurance_company: InsuranceCompany
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  start_date: string
  end_date: string
  premium_amount: number
  payment_frequency: 'annual' | 'semi-annual' | 'quarterly' | 'monthly'
  created_at: string
}

export interface PolicyType {
  id: string
  category: PolicyCategory
  insurance_company: InsuranceCompany
  name: string
  description: string
  base_premium: number
  coverage_details: Record<string, any>
  features: string[]
  is_active: boolean
}

export interface PolicyCategory {
  id: string
  name: string
  slug: string
  description: string
  icon: string
}

export interface InsuranceCompany {
  id: string
  name: string
  logo: string
  rating: number
  description: string
  is_active: boolean
}

// Payment types
export interface Transaction {
  id: string
  transaction_number: string
  amount: number
  payment_method: 'mpesa' | 'card'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  reference_number: string
  created_at: string
}

// Claim types
export interface Claim {
  id: string
  claim_number: string
  policy: Policy
  type: string
  description: string
  amount_claimed: number
  amount_approved?: number
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'settled'
  filed_date: string
  settlement_date?: string
}

// Notification types
export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  action_url?: string
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
