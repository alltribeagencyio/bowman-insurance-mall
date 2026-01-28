/**
 * Payment API Client
 * Handles all payment-related API calls
 */

import { apiClient } from './client'
import type {
  Transaction,
  PaymentInitData,
  PaymentInitResponse,
  MpesaInitData,
  MpesaResponse,
  MpesaStatusResponse,
  PaystackInitData,
  PaystackResponse,
  PaystackVerifyResponse,
  PaymentSchedule,
  Refund,
  RefundRequest,
  PaymentSummary,
  Receipt,
  TransactionFilters,
  PaginatedTransactions
} from '@/types/payment'

export const paymentsApi = {
  /**
   * Initiate a new payment transaction
   */
  async initiatePayment(data: PaymentInitData): Promise<PaymentInitResponse> {
    const response = await apiClient.post('/payments/initiate/', data)
    return response.data
  },

  /**
   * Get all transactions for the current user
   */
  async getTransactions(filters?: TransactionFilters): Promise<PaginatedTransactions> {
    const response = await apiClient.get('/payments/transactions/', {
      params: filters
    })
    return response.data
  },

  /**
   * Get a single transaction by ID
   */
  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.get(`/payments/transactions/${id}/`)
    return response.data
  },

  /**
   * Get payment summary/statistics
   */
  async getSummary(): Promise<PaymentSummary> {
    const response = await apiClient.get('/payments/transactions/summary/')
    return response.data
  },

  /**
   * Get payment receipt for a transaction
   */
  async getReceipt(transactionId: string): Promise<Receipt> {
    const response = await apiClient.get(`/payments/transactions/${transactionId}/receipt/`)
    return response.data
  },

  /**
   * M-Pesa: Initiate STK Push
   */
  async initiateMpesa(data: MpesaInitData): Promise<MpesaResponse> {
    const response = await apiClient.post('/payments/mpesa/initiate/', data)
    return response.data
  },

  /**
   * M-Pesa: Check transaction status
   */
  async checkMpesaStatus(transactionId: string): Promise<MpesaStatusResponse> {
    const response = await apiClient.get(`/payments/mpesa/status/${transactionId}/`)
    return response.data
  },

  /**
   * Paystack: Initialize card payment
   */
  async initializePaystack(data: PaystackInitData): Promise<PaystackResponse> {
    const response = await apiClient.post('/payments/paystack/initialize/', data)
    return response.data
  },

  /**
   * Paystack: Verify payment
   */
  async verifyPaystack(reference: string): Promise<PaystackVerifyResponse> {
    const response = await apiClient.get(`/payments/paystack/verify/${reference}/`)
    return response.data
  },

  /**
   * Get all payment schedules
   */
  async getPaymentSchedules(): Promise<PaymentSchedule[]> {
    const response = await apiClient.get('/payments/schedules/')
    return response.data
  },

  /**
   * Get pending payment schedules
   */
  async getPendingPayments(): Promise<PaymentSchedule[]> {
    const response = await apiClient.get('/payments/schedules/pending/')
    return response.data
  },

  /**
   * Get overdue payment schedules
   */
  async getOverduePayments(): Promise<PaymentSchedule[]> {
    const response = await apiClient.get('/payments/schedules/overdue/')
    return response.data
  },

  /**
   * Request a refund
   */
  async requestRefund(data: RefundRequest): Promise<Refund> {
    const response = await apiClient.post('/payments/refunds/', data)
    return response.data
  },

  /**
   * Get all refunds
   */
  async getRefunds(): Promise<Refund[]> {
    const response = await apiClient.get('/payments/refunds/')
    return response.data
  },

  /**
   * Get a single refund by ID
   */
  async getRefund(id: string): Promise<Refund> {
    const response = await apiClient.get(`/payments/refunds/${id}/`)
    return response.data
  }
}
