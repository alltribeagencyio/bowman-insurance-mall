// Payment Types and Interfaces

export interface Transaction {
  id: string
  transaction_number: string
  user: string
  user_email: string
  user_name: string
  policy: string | null
  policy_number: string | null
  amount: number
  amount_display: string
  currency: string
  payment_method: 'mpesa' | 'card'
  payment_method_display: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  status_display: string
  reference_number: string
  gateway_reference: string
  phone_number?: string
  description: string
  metadata: Record<string, any>
  failure_reason?: string
  processed_at?: string
  created_at: string
  updated_at: string
}

export interface PaymentInitData {
  policy_id: string
  amount: number
  payment_method: 'mpesa' | 'card'
  phone_number?: string
  description?: string
  metadata?: Record<string, any>
}

export interface PaymentInitResponse {
  transaction_id: string
  transaction_number: string
  status: string
  message: string
}

export interface MpesaInitData {
  transaction_id: string
  phone_number: string
  amount: number
  account_reference?: string
  description?: string
}

export interface MpesaResponse {
  success: boolean
  transaction_id: string
  checkout_request_id: string
  message: string
}

export interface MpesaStatusResponse {
  transaction_id: string
  status: string
  result: {
    success: boolean
    result_code: number
    result_desc: string
    data: any
  }
}

export interface PaystackInitData {
  transaction_id: string
  email: string
  amount: number
  callback_url?: string
  metadata?: Record<string, any>
}

export interface PaystackResponse {
  success: boolean
  transaction_id: string
  authorization_url: string
  access_code: string
  reference: string
}

export interface PaystackVerifyResponse {
  success: boolean
  transaction_id: string
  status: string
  message: string
}

export interface PaymentSchedule {
  id: string
  policy: string
  policy_number: string
  user_name: string
  amount: number
  amount_display: string
  due_date: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  status_display: string
  is_overdue: boolean
  transaction?: string
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export interface Refund {
  id: string
  transaction: string
  transaction_number: string
  user_name: string
  amount: number
  amount_display: string
  reason: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  status_display: string
  processed_at?: string
  processed_by?: string
  notes: string
  created_at: string
  updated_at: string
}

export interface RefundRequest {
  transaction_id: string
  amount?: number
  reason: string
  notes?: string
}

export interface PaymentSummary {
  total_transactions: number
  successful_payments: number
  failed_payments: number
  pending_payments: number
  total_amount: number
  successful_amount: number
  refunded_amount: number
  currency: string
}

export interface Receipt {
  transaction_number: string
  policy_number: string
  customer_name: string
  customer_email: string
  amount: number
  currency: string
  payment_method: string
  reference_number: string
  payment_date: string
  description: string
  company_name: string
  company_address?: string
  company_phone?: string
  company_email?: string
}

export interface TransactionFilters {
  status?: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method?: 'mpesa' | 'card'
  from_date?: string
  to_date?: string
  search?: string
  page?: number
  page_size?: number
}

export interface PaginatedTransactions {
  count: number
  next: string | null
  previous: string | null
  results: Transaction[]
}
