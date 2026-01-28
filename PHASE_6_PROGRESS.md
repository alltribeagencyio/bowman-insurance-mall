# Phase 6: Payment Integration - IN PROGRESS

**Date Started:** January 27, 2026
**Status:** Backend Complete, Frontend Pending

---

## Overview

Phase 6 implements comprehensive payment integration with M-Pesa (mobile money) and Paystack (card payments), enabling users to pay for insurance premiums directly through the platform.

---

## ✅ Backend Implementation (100% Complete)

### 1. M-Pesa Integration Service
**File:** [backend/apps/payments/mpesa.py](backend/apps/payments/mpesa.py)

**Features:**
- ✅ OAuth token generation for Daraja API
- ✅ STK Push initiation (send payment prompt to phone)
- ✅ Password generation for API requests
- ✅ Phone number formatting (multiple formats supported)
- ✅ Transaction status checking
- ✅ Callback processing
- ✅ Transaction validation
- ✅ Comprehensive error handling
- ✅ Logging for debugging

**Key Methods:**
- `initiate_stk_push()` - Send payment prompt to customer's phone
- `query_transaction_status()` - Check payment status
- `process_callback()` - Handle M-Pesa payment callbacks
- `_generate_access_token()` - Authenticate with Dar

aja API
- `_format_phone_number()` - Support various phone formats

**API Configuration Required:**
```python
# In settings.py
MPESA_CONSUMER_KEY = 'your_consumer_key'
MPESA_CONSUMER_SECRET = 'your_consumer_secret'
MPESA_SHORTCODE = 'your_business_shortcode'
MPESA_PASSKEY = 'your_passkey'
MPESA_CALLBACK_URL = 'https://yoursite.com/api/v1/payments/mpesa/callback/'
MPESA_API_URL = 'https://sandbox.safaricom.co.ke'  # or production URL
```

---

### 2. Paystack Integration Service
**File:** [backend/apps/payments/paystack.py](backend/apps/payments/paystack.py)

**Features:**
- ✅ Transaction initialization (get payment URL)
- ✅ Transaction verification
- ✅ Webhook signature verification
- ✅ Webhook event processing
- ✅ Saved card charging
- ✅ Refund processing
- ✅ Transaction listing with filters
- ✅ Amount conversion (KES to kobo)
- ✅ Comprehensive error handling

**Key Methods:**
- `initialize_transaction()` - Start card payment flow
- `verify_transaction()` - Verify payment completion
- `process_webhook()` - Handle Paystack webhooks
- `verify_webhook_signature()` - Validate webhook authenticity
- `charge_authorization()` - Charge saved cards
- `create_refund()` - Process refunds
- `list_transactions()` - Get transaction history

**API Configuration Required:**
```python
# In settings.py
PAYSTACK_SECRET_KEY = 'your_secret_key'
PAYSTACK_PUBLIC_KEY = 'your_public_key'
PAYSTACK_WEBHOOK_SECRET = 'your_webhook_secret'
```

---

### 3. Payment Serializers
**File:** [backend/apps/payments/serializers.py](backend/apps/payments/serializers.py)

**Implemented Serializers:**
- ✅ `TransactionSerializer` - Full transaction data
- ✅ `TransactionCreateSerializer` - Create new transactions
- ✅ `MpesaInitiateSerializer` - Start M-Pesa payment
- ✅ `PaystackInitializeSerializer` - Start card payment
- ✅ `TransactionStatusSerializer` - Payment status
- ✅ `PaymentScheduleSerializer` - Installment schedules
- ✅ `RefundSerializer` - Refund data
- ✅ `RefundCreateSerializer` - Request refunds
- ✅ `PaymentSummarySerializer` - Statistics
- ✅ `ReceiptSerializer` - Payment receipts

**Validation:**
- ✅ Amount validation (must be positive)
- ✅ Phone number format validation
- ✅ M-Pesa requires phone number
- ✅ Cross-field validation

---

### 4. Payment Views & API Endpoints
**File:** [backend/apps/payments/views.py](backend/apps/payments/views.py)

**API Endpoints:**

#### Transaction Management
- ✅ `POST /api/v1/payments/initiate/` - Create transaction
- ✅ `GET /api/v1/payments/transactions/` - List transactions
- ✅ `GET /api/v1/payments/transactions/{id}/` - Get transaction
- ✅ `GET /api/v1/payments/transactions/summary/` - Payment statistics
- ✅ `GET /api/v1/payments/transactions/{id}/receipt/` - Get receipt

#### M-Pesa Endpoints
- ✅ `POST /api/v1/payments/mpesa/initiate/` - Start STK Push
- ✅ `POST /api/v1/payments/mpesa/callback/` - Handle callbacks
- ✅ `GET /api/v1/payments/mpesa/status/{id}/` - Check status

#### Paystack Endpoints
- ✅ `POST /api/v1/payments/paystack/initialize/` - Get payment URL
- ✅ `GET /api/v1/payments/paystack/verify/{ref}/` - Verify payment
- ✅ `POST /api/v1/payments/paystack/webhook/` - Handle webhooks

#### Payment Schedules
- ✅ `GET /api/v1/payments/schedules/` - List schedules
- ✅ `GET /api/v1/payments/schedules/pending/` - Pending payments
- ✅ `GET /api/v1/payments/schedules/overdue/` - Overdue payments

#### Refunds
- ✅ `POST /api/v1/payments/refunds/` - Request refund
- ✅ `GET /api/v1/payments/refunds/` - List refunds
- ✅ `GET /api/v1/payments/refunds/{id}/` - Get refund details

**Security Features:**
- ✅ User authentication required
- ✅ Permission checks (users can only access their own transactions)
- ✅ Admin/staff can view all transactions
- ✅ Webhook signature verification
- ✅ CSRF exemption for webhooks
- ✅ Comprehensive logging

---

### 5. URL Configuration
**File:** [backend/apps/payments/urls.py](backend/apps/payments/urls.py)

- ✅ ViewSet routes for transactions, schedules, refunds
- ✅ Payment initiation endpoint
- ✅ M-Pesa endpoints
- ✅ Paystack endpoints
- ✅ All routes properly namespaced

---

## ⏳ Frontend Implementation (Pending)

### Remaining Tasks

#### 1. Payment Selection Page
**Location:** `frontend/src/app/payment/[transactionId]/page.tsx`

**Features to Build:**
- Payment method selector (M-Pesa vs Card)
- Amount display
- Policy information
- Terms acceptance
- "Proceed to Payment" button

#### 2. M-Pesa Payment Flow
**Location:** `frontend/src/app/payment/mpesa/page.tsx`

**Features to Build:**
- Phone number input
- "Send Payment Prompt" button
- Waiting screen with instructions
- Status polling
- Success/failure messages
- Receipt download option

#### 3. Card Payment Flow (Paystack)
**Location:** `frontend/src/app/payment/card/page.tsx`

**Features to Build:**
- Redirect to Paystack payment page
- Payment verification on return
- Success confirmation
- Failure handling
- Receipt download

#### 4. Payment History Page
**Location:** `frontend/src/app/dashboard/payments/page.tsx`

**Features to Build:**
- Transaction list with filters
- Status badges
- Search functionality
- Date range filter
- Download receipts
- Payment method icons
- Amount sorting

#### 5. Payment Confirmation Screen
**Location:** `frontend/src/app/payment/success/page.tsx`

**Features to Build:**
- Success animation
- Transaction details
- Receipt preview
- Download button
- "Back to Dashboard" button
- Share receipt option

#### 6. Payment API Client
**Location:** `frontend/src/lib/api/payments.ts`

**Functions to Build:**
```typescript
export const paymentsApi = {
  initiatePayment(data: PaymentInitData): Promise<Transaction>
  initiateMpesa(data: MpesaInitData): Promise<MpesaResponse>
  checkMpesaStatus(transactionId: string): Promise<TransactionStatus>
  initializePaystack(data: PaystackInitData): Promise<PaystackResponse>
  verifyPaystack(reference: string): Promise<VerificationResult>
  getTransactions(filters?: TransactionFilters): Promise<Transaction[]>
  getTransaction(id: string): Promise<Transaction>
  getReceipt(id: string): Promise<Receipt>
  getSummary(): Promise<PaymentSummary>
  requestRefund(data: RefundRequest): Promise<Refund>
}
```

#### 7. Payment Types
**Location:** `frontend/src/types/payment.ts`

**Types to Define:**
```typescript
interface Transaction {
  id: string
  transaction_number: string
  user: User
  policy: Policy
  amount: number
  currency: string
  payment_method: 'mpesa' | 'card'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  reference_number: string
  gateway_reference: string
  phone_number?: string
  description: string
  processed_at?: string
  created_at: string
}

interface PaymentInitData {
  policy_id: string
  amount: number
  payment_method: 'mpesa' | 'card'
  phone_number?: string
  description?: string
}

interface MpesaInitData {
  transaction_id: string
  phone_number: string
  amount: number
}

interface PaystackInitData {
  transaction_id: string
  email: string
  amount: number
  callback_url?: string
}

// ... more types
```

#### 8. Payment Context/Hooks
**Location:** `frontend/src/lib/payments/use-payment.ts`

**Hook to Build:**
```typescript
export function usePayment() {
  const initiatePayment = async (data: PaymentInitData) => { }
  const processMpesa = async (data: MpesaInitData) => { }
  const processCard = async (data: PaystackInitData) => { }
  const checkStatus = async (transactionId: string) => { }
  const getReceipt = async (transactionId: string) => { }

  return {
    initiatePayment,
    processMpesa,
    processCard,
    checkStatus,
    getReceipt,
    isLoading,
    error
  }
}
```

---

## 🔧 Additional Components Needed

### UI Components
- ✅ Payment method selector card
- ✅ Phone number input with validation
- ✅ Payment status indicator
- ✅ Transaction card
- ✅ Receipt component
- ✅ Payment summary card

### Utilities
- ✅ Phone number formatter
- ✅ Amount formatter (KES)
- ✅ Payment status badge helper
- ✅ Payment method icon selector

---

## 📋 Testing Checklist

### Backend Tests (Pending)
- [ ] M-Pesa service unit tests
- [ ] Paystack service unit tests
- [ ] Payment view tests
- [ ] Serializer validation tests
- [ ] Webhook handling tests
- [ ] Permission tests

### Frontend Tests (Pending)
- [ ] Payment initiation flow
- [ ] M-Pesa payment flow
- [ ] Card payment flow
- [ ] Payment history page
- [ ] Receipt generation
- [ ] Error handling

### Integration Tests (Pending)
- [ ] End-to-end payment with M-Pesa sandbox
- [ ] End-to-end payment with Paystack test mode
- [ ] Webhook processing
- [ ] Payment status updates
- [ ] Receipt generation

---

## 🚀 Deployment Requirements

### Environment Variables
Add to production environment:
```bash
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_production_key
MPESA_CONSUMER_SECRET=your_production_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback/
MPESA_API_URL=https://api.safaricom.co.ke

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_production_secret_key
PAYSTACK_PUBLIC_KEY=your_production_public_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
```

### Webhook URLs to Register
- **M-Pesa Callback:** `https://yourdomain.com/api/v1/payments/mpesa/callback/`
- **Paystack Webhook:** `https://yourdomain.com/api/v1/payments/paystack/webhook/`

### SSL/HTTPS Required
- Both M-Pesa and Paystack require HTTPS for callbacks/webhooks
- Ensure SSL certificate is properly configured

---

## 📊 Progress Summary

**Backend:** 100% Complete ✅
- M-Pesa Service ✅
- Paystack Service ✅
- Serializers ✅
- Views & APIs ✅
- URL Configuration ✅

**Frontend:** 0% Complete ⏳
- Payment Pages (0%)
- API Client (0%)
- Types (0%)
- Components (0%)
- Tests (0%)

**Overall Phase 6 Progress:** 50% Complete

---

## 🎯 Next Steps

1. **Build Frontend Payment Pages** (Priority: High)
   - Payment selection page
   - M-Pesa flow
   - Card payment flow
   - Payment history

2. **Create Payment API Client** (Priority: High)
   - TypeScript client for all payment endpoints
   - Error handling
   - Type safety

3. **Build UI Components** (Priority: Medium)
   - Payment cards
   - Status indicators
   - Receipt components

4. **Testing** (Priority: Medium)
   - Backend unit tests
   - Frontend integration tests
   - E2E payment flows

5. **Documentation** (Priority: Low)
   - Payment flow diagrams
   - API documentation
   - User guides

---

## 💡 Notes

### M-Pesa Sandbox vs Production
- Sandbox URL: `https://sandbox.safaricom.co.ke`
- Production URL: `https://api.safaricom.co.ke`
- Use sandbox for testing, production for live transactions

### Paystack Test Mode
- Paystack automatically uses test mode with test keys
- Test card numbers available in Paystack docs
- No real money charged in test mode

### Security Considerations
- ✅ Webhook signature verification implemented
- ✅ User authentication required
- ✅ Permission checks in place
- ✅ CSRF protection (except webhooks)
- ⏳ Rate limiting (to be added)
- ⏳ Payment amount limits (to be configured)

---

**Status:** Ready for frontend implementation
**Last Updated:** January 27, 2026
