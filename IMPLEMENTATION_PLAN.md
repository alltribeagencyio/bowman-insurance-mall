# Bowman Insurance Platform - Implementation Plan

**Document Version:** 1.0
**Date:** January 27, 2026
**Project:** Digital Insurance Marketplace & Management Platform
**Status:** Planning Phase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Phase 1: Foundation & Setup](#phase-1-foundation--setup)
4. [Phase 2: Core Backend Architecture](#phase-2-core-backend-architecture)
5. [Phase 3: Frontend Foundation](#phase-3-frontend-foundation)
6. [Phase 4: Insurance Marketplace](#phase-4-insurance-marketplace)
7. [Phase 5: Payment Integration](#phase-5-payment-integration)
8. [Phase 6: Customer Dashboard](#phase-6-customer-dashboard)
9. [Phase 7: Claims Management](#phase-7-claims-management)
10. [Phase 8: Admin Panel](#phase-8-admin-panel)
11. [Phase 9: Workflow Engine](#phase-9-workflow-engine)
12. [Phase 10: Notifications & Communications](#phase-10-notifications--communications)
13. [Phase 11: Document Management](#phase-11-document-management)
14. [Phase 12: Testing & Optimization](#phase-12-testing--optimization)
15. [Phase 13: Deployment & Launch](#phase-13-deployment--launch)
16. [Critical Success Factors](#critical-success-factors)
17. [Key Technical Decisions](#key-technical-decisions)

---

## Project Overview

### Primary Objective
Build a scalable, secure, and user-friendly digital platform that serves as a one-stop solution for all insurance needs in Kenya.

### Key Deliverables
- Public-facing insurance marketplace (e-commerce style)
- Customer self-service dashboard
- Comprehensive admin panel for agency staff
- Automated policy lifecycle management (workflow engine)
- Multi-channel payment processing (M-Pesa, cards)
- End-to-end claims management system
- Real-time analytics and reporting
- Mobile-responsive web application

### Target Metrics (Year 1)
- Registered Customers: 10,000+
- Active Policies: 5,000+
- Premiums Processed: KES 100M+
- Customer Satisfaction: 80%+
- Digital Policy Issuance: 70%+ (vs manual)
- Avg Claim Processing Time: <48 hours

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 3.x
- **UI Components:** shadcn/ui
- **State Management:**
  - TanStack Query 5.x (server state)
  - Zustand (client state)
- **Features:** SSR, PWA capabilities, mobile-first design

### Backend
- **Language:** Python 3.11+
- **Framework:** Django 5.0
- **API:** Django REST Framework 3.14+
- **Task Queue:** Celery 5.x
- **Authentication:** JWT (access + refresh tokens)

### Database & Storage
- **Primary Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **File Storage:** AWS S3
- **CDN:** CloudFlare

### Payment Gateways
- **Mobile Money:** M-Pesa Daraja API
- **Card Payments:** Paystack

### Notifications
- **Email:** SendGrid / AWS SES
- **SMS & WhatsApp:** Africa's Talking

### Development Tools
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Containerization:** Docker + Docker Compose
- **Testing:** Jest, Pytest, Playwright
- **API Docs:** Swagger/OpenAPI
- **Monitoring:** Sentry
- **Analytics:** Google Analytics + Mixpanel

---

## Phase 1: Foundation & Setup

### Project Structure Setup

#### Backend Structure
```
backend/
├── manage.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── bowman_insurance/
│   ├── __init__.py
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   └── celery.py
├── apps/
│   ├── users/
│   ├── policies/
│   ├── payments/
│   ├── claims/
│   ├── documents/
│   ├── notifications/
│   ├── workflows/
│   └── analytics/
└── tests/
```

#### Frontend Structure
```
frontend/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── Dockerfile
├── .env.example
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   ├── (marketplace)/
│   │   ├── (dashboard)/
│   │   └── (admin)/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── forms/
│   │   └── shared/
│   ├── lib/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── constants/
│   ├── store/
│   └── types/
└── public/
```

### Infrastructure Configuration

#### Database Setup
- PostgreSQL 15+ installation (local development)
- Database creation and user permissions
- Connection pooling configuration (PgBouncer)
- Database migration setup
- Read replica configuration (production)

#### Redis Setup
- Redis 7+ installation
- Configuration for caching
- Configuration for Celery message broker
- Session storage setup
- Rate limiting counters

#### AWS S3 Bucket
- Bucket creation for document storage
- IAM user and permissions
- CORS configuration
- Versioning enabled
- Server-side encryption
- Lifecycle policies

#### Environment Configuration
- `.env` files for all environments (development, staging, production)
- Secret management strategy
- API keys and credentials storage
- Database connection strings
- Third-party service credentials

### Development Tools Setup

#### Code Quality Tools
- **Frontend:**
  - ESLint configuration
  - Prettier setup
  - TypeScript strict mode
  - Husky pre-commit hooks

- **Backend:**
  - Black (code formatter)
  - Flake8 (linting)
  - isort (import sorting)
  - Pre-commit hooks
  - mypy (type checking)

#### Testing Frameworks
- **Frontend:** Jest + React Testing Library
- **Backend:** Pytest + Coverage
- **E2E:** Playwright
- Test database setup
- Mock services configuration

#### CI/CD Pipeline
- GitHub Actions workflows
- Automated testing on PR
- Automated deployment to staging
- Production deployment approval workflow
- Build and push Docker images
- Database migration automation

---

## Phase 2: Core Backend Architecture

### Database Design & Models

#### User Model (`apps/users/models.py`)
```python
class User(AbstractBaseUser, PermissionsMixin):
    - id (UUID, primary key)
    - email (unique)
    - password_hash
    - first_name
    - last_name
    - phone
    - id_number (Kenya ID)
    - kra_pin
    - role (customer, staff, admin, assessor)
    - status (active, suspended, inactive)
    - is_verified
    - email_verified_at
    - phone_verified_at
    - created_at
    - updated_at
```

#### Policy Models (`apps/policies/models.py`)
```python
class InsuranceCompany:
    - id
    - name
    - logo
    - rating
    - description
    - contact_info
    - is_active
    - created_at

class PolicyCategory:
    - id
    - name (Motor, Medical, Life, Home, Travel, etc.)
    - slug
    - description
    - icon
    - display_order

class PolicyType:
    - id
    - category (FK to PolicyCategory)
    - insurance_company (FK to InsuranceCompany)
    - name
    - description
    - base_premium
    - coverage_details (JSON)
    - features (JSON)
    - exclusions (JSON)
    - is_active
    - created_at
    - updated_at

class Policy:
    - id
    - policy_number (unique)
    - user (FK to User)
    - policy_type (FK to PolicyType)
    - insurance_company (FK to InsuranceCompany)
    - status (pending, active, expired, cancelled)
    - start_date
    - end_date
    - premium_amount
    - payment_frequency (annual, semi-annual, quarterly, monthly)
    - policy_data (JSON - custom fields per policy type)
    - certificate_url
    - created_at
    - updated_at
```

#### Transaction Model (`apps/payments/models.py`)
```python
class Transaction:
    - id
    - transaction_number (unique)
    - user (FK to User)
    - policy (FK to Policy)
    - amount
    - payment_method (mpesa, card)
    - status (pending, completed, failed, refunded)
    - mpesa_receipt
    - paystack_reference
    - reference_number
    - payment_phone (for M-Pesa)
    - metadata (JSON)
    - created_at
    - completed_at
```

#### Claims Model (`apps/claims/models.py`)
```python
class Claim:
    - id
    - claim_number (unique)
    - policy (FK to Policy)
    - user (FK to User)
    - type (accident, theft, medical, etc.)
    - description
    - amount_claimed
    - amount_approved
    - status (submitted, under_review, approved, rejected, settled)
    - filed_date
    - assessment_date
    - settlement_date
    - assessor (FK to User)
    - assessor_notes
    - created_at
    - updated_at

class ClaimDocument:
    - id
    - claim (FK to Claim)
    - document_type
    - file_url
    - uploaded_at
```

#### Document Model (`apps/documents/models.py`)
```python
class Document:
    - id
    - user (FK to User)
    - policy (FK to Policy, nullable)
    - type (id_copy, kra_pin, certificate, receipt, claim_doc, etc.)
    - filename
    - s3_key
    - file_size
    - mime_type
    - uploaded_at
    - is_verified
```

#### Notification Model (`apps/notifications/models.py`)
```python
class Notification:
    - id
    - user (FK to User)
    - type (policy_issued, payment_due, claim_update, etc.)
    - title
    - message
    - read
    - action_url
    - created_at

class NotificationPreference:
    - id
    - user (FK to User)
    - email_enabled
    - sms_enabled
    - whatsapp_enabled
    - notification_types (JSON)
```

#### Workflow Model (`apps/workflows/models.py`)
```python
class WorkflowStage:
    - id
    - policy (FK to Policy)
    - stage_name (quote, underwriting, payment, issuance, active)
    - status (pending, in_progress, completed, failed)
    - assigned_to (FK to User)
    - started_at
    - completed_at
    - notes
    - metadata (JSON)
```

### Authentication System

#### JWT Implementation
- Access token (15 min expiry)
- Refresh token (7 days expiry)
- Token blacklisting on logout
- Secure token storage
- Token refresh mechanism

#### API Endpoints
```
POST /api/v1/auth/register/
POST /api/v1/auth/login/
POST /api/v1/auth/logout/
POST /api/v1/auth/refresh/
POST /api/v1/auth/password-reset/
POST /api/v1/auth/password-reset-confirm/
POST /api/v1/auth/verify-email/
POST /api/v1/auth/verify-phone/
```

#### Password Security
- PBKDF2 hashing algorithm
- Minimum 8 characters
- Must include numbers and special characters
- Password strength validation
- Password history (prevent reuse)

#### Role-Based Access Control (RBAC)
```python
Roles:
- customer: Can browse, purchase, manage own policies
- staff: Can manage policies, users, transactions
- assessor: Can process claims
- admin: Full system access

Permissions:
- view_policy
- add_policy
- change_policy
- delete_policy
- view_user
- manage_user
- process_claim
- view_reports
- manage_settings
```

### Base API Structure

#### Django REST Framework Configuration
- API versioning: `/api/v1/`
- Pagination: 20 items per page
- Throttling: 100 requests/hour for anonymous, 1000 for authenticated
- Authentication: JWT
- Permission classes per endpoint
- Custom exception handling
- CORS configuration

#### Serializers
- User serializer (public, private views)
- Policy serializers (list, detail)
- Transaction serializers
- Claims serializers
- Input validation
- Output formatting

#### Error Handling
```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "errors": {
    "email": ["This field is required."]
  }
}
```

---

## Phase 3: Frontend Foundation

### Next.js App Router Setup

#### Layout Structure
```typescript
app/
├── layout.tsx (Root layout)
├── page.tsx (Homepage)
├── (auth)/
│   ├── layout.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── password-reset/page.tsx
├── (marketplace)/
│   ├── layout.tsx
│   ├── policies/
│   │   ├── page.tsx (List)
│   │   ├── [id]/page.tsx (Detail)
│   │   └── compare/page.tsx
│   ├── cart/page.tsx
│   └── checkout/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── my-policies/page.tsx
│   ├── payments/page.tsx
│   ├── claims/page.tsx
│   ├── documents/page.tsx
│   └── profile/page.tsx
└── (admin)/
    ├── layout.tsx
    ├── admin/page.tsx
    ├── users/page.tsx
    ├── policies/page.tsx
    ├── transactions/page.tsx
    ├── claims/page.tsx
    └── reports/page.tsx
```

### Tailwind CSS Configuration

#### Custom Theme
```javascript
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...},
      accent: {...},
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    },
  }
}
```

#### Responsive Breakpoints
- Mobile: 0-640px
- Tablet: 641-1024px
- Desktop: 1025px+

### shadcn/ui Component Setup

#### Core Components to Install
- Button
- Card
- Input
- Label
- Select
- Dialog/Modal
- Dropdown Menu
- Table
- Tabs
- Toast/Alert
- Badge
- Avatar
- Skeleton (loading states)
- Form components

### State Management

#### TanStack Query Setup
```typescript
// API client configuration
// Query hooks for data fetching
// Mutation hooks for data updates
// Cache invalidation strategies
// Optimistic updates
```

#### Zustand Stores
```typescript
// Auth store (user, token, role)
// Cart store (selected policies)
// UI store (theme, sidebar state)
```

### Core UI Components

#### Navigation Component
```typescript
components/layout/Navbar.tsx
- Logo
- Navigation links
- User menu (when authenticated)
- Mobile menu toggle
- Shopping cart icon with count
```

#### Footer Component
```typescript
components/layout/Footer.tsx
- Company info
- Quick links
- Contact information
- Social media links
- Insurance licenses/certifications
```

#### Form Components
```typescript
components/forms/
├── LoginForm.tsx
├── RegisterForm.tsx
├── PolicySearchForm.tsx
├── CheckoutForm.tsx
└── ClaimForm.tsx
```

#### Reusable Components
```typescript
components/shared/
├── LoadingSpinner.tsx
├── ErrorBoundary.tsx
├── PolicyCard.tsx
├── PriceDisplay.tsx
├── StatusBadge.tsx
└── FileUpload.tsx
```

---

## Phase 4: Insurance Marketplace

### Backend APIs

#### Policy Listing API
```
GET /api/v1/policies/
Query params:
  - category (filter by category)
  - company (filter by insurance company)
  - min_price, max_price
  - search (text search)
  - sort (price_asc, price_desc, popular, rating)
  - page, page_size

Response:
{
  "count": 50,
  "next": "...",
  "previous": null,
  "results": [...]
}
```

#### Policy Detail API
```
GET /api/v1/policies/{id}/
Response:
{
  "id": "...",
  "name": "Comprehensive Motor Insurance",
  "category": {...},
  "insurance_company": {...},
  "base_premium": 25000,
  "coverage_details": {...},
  "features": [...],
  "exclusions": [...],
  "reviews": [...],
  "rating": 4.5
}
```

#### Quote Generation API
```
POST /api/v1/policies/{id}/quote/
Body:
{
  "policy_data": {
    "vehicle_value": 2000000,
    "vehicle_year": 2020,
    ...
  }
}

Response:
{
  "policy_id": "...",
  "premium": 45000,
  "breakdown": {...},
  "valid_until": "..."
}
```

#### Shopping Cart API
```
POST /api/v1/cart/add/
GET /api/v1/cart/
DELETE /api/v1/cart/{item_id}/
PATCH /api/v1/cart/{item_id}/
```

#### Checkout API
```
POST /api/v1/checkout/
Body:
{
  "cart_items": [...],
  "payment_method": "mpesa",
  "payment_phone": "254712345678"
}
```

### Frontend Pages

#### Homepage (`app/page.tsx`)
Components:
- Hero section with search bar
- Insurance category cards
- Featured policies slider
- Trust indicators (customer count, ratings)
- How it works section
- Customer testimonials
- CTA (Call to Action) sections

#### Policy Listing Page (`app/policies/page.tsx`)
Features:
- Filter sidebar (category, company, price range)
- Sort dropdown
- Policy cards grid
- Pagination
- Active filters display
- Results count
- "Add to cart" and "Compare" buttons

#### Policy Detail Page (`app/policies/[id]/page.tsx`)
Sections:
- Policy header (name, company, rating)
- Key features highlights
- Detailed coverage breakdown
- What's covered / not covered
- Pricing table
- Quote form
- Customer reviews
- Related policies
- FAQ section
- "Add to cart" button

#### Policy Comparison Page (`app/policies/compare/page.tsx`)
Features:
- Side-by-side comparison (max 3 policies)
- Feature comparison table
- Price comparison
- Coverage limits comparison
- Highlight differences
- Export to PDF
- Share comparison link

#### Shopping Cart Page (`app/cart/page.tsx`)
Components:
- Cart items list
- Edit policy options
- Remove items
- Bundle discount display
- Payment plan selector
- Price breakdown
- "Proceed to checkout" button

#### Checkout Page (`app/checkout/page.tsx`)
Multi-step wizard:
1. **Personal Information**
   - Verify/update user details
   - Upload required documents

2. **Payment Method**
   - M-Pesa option
   - Card payment option
   - Payment plan selection

3. **Review Order**
   - Order summary
   - Terms and conditions
   - Final price breakdown

4. **Payment & Confirmation**
   - Payment processing
   - Success/failure message
   - Download certificate
   - Email confirmation

---

## Phase 5: Payment Integration

### M-Pesa Integration

#### Daraja API Setup
- Consumer Key and Consumer Secret
- OAuth token generation
- Passkey configuration
- Callback URL setup

#### STK Push Implementation
```python
# apps/payments/mpesa.py

class MpesaService:
    def initiate_payment(amount, phone, reference):
        # Generate access token
        # Initiate STK Push
        # Return checkout request ID

    def check_payment_status(checkout_request_id):
        # Query transaction status

    def handle_callback(data):
        # Process M-Pesa callback
        # Update transaction status
        # Trigger policy issuance if successful
```

#### API Endpoints
```
POST /api/v1/payments/mpesa/initiate/
POST /api/v1/payments/mpesa/callback/
GET /api/v1/payments/mpesa/status/{transaction_id}/
```

#### Payment Flow
1. User selects M-Pesa payment
2. Backend initiates STK Push
3. User receives prompt on phone
4. User enters M-Pesa PIN
5. M-Pesa sends callback to backend
6. Backend updates transaction status
7. If successful, trigger policy issuance workflow

### Paystack Integration

#### Setup
- Public Key and Secret Key
- Webhook secret
- Payment callback URL

#### Card Payment Implementation
```python
# apps/payments/paystack.py

class PaystackService:
    def initialize_transaction(amount, email, reference):
        # Initialize payment
        # Return authorization URL

    def verify_transaction(reference):
        # Verify payment status

    def handle_webhook(data):
        # Process webhook event
        # Update transaction status
```

#### API Endpoints
```
POST /api/v1/payments/paystack/initialize/
POST /api/v1/payments/paystack/webhook/
GET /api/v1/payments/paystack/verify/{reference}/
```

### Transaction Management

#### Transaction Recording
- Create transaction record on payment initiation
- Update status on callback/webhook
- Store payment gateway response
- Generate receipt on successful payment
- Handle payment failures gracefully

#### Receipt Generation
```python
# Generate PDF receipt using ReportLab
# Include: transaction details, policy info, amount, date
# Store in S3
# Email to customer
```

#### Payment Reconciliation
- Daily reconciliation job (Celery task)
- Match transactions with gateway records
- Flag discrepancies for manual review
- Generate reconciliation reports

#### Refund Processing
```
POST /api/v1/payments/refunds/
Body:
{
  "transaction_id": "...",
  "amount": 5000,
  "reason": "Policy cancellation"
}
```

---

## Phase 6: Customer Dashboard

### Backend APIs

#### Dashboard Overview API
```
GET /api/v1/dashboard/overview/
Response:
{
  "stats": {
    "active_policies": 3,
    "pending_payments": 1,
    "active_claims": 0,
    "total_premium": 75000
  },
  "action_items": [...],
  "recent_activity": [...],
  "recommendations": [...]
}
```

#### User Policies API
```
GET /api/v1/policies/my-policies/
Query params:
  - status (active, pending, expired)
  - category
  - page, page_size

Response: List of user's policies with details
```

#### Policy Detail API
```
GET /api/v1/policies/my-policies/{id}/
Response:
{
  "policy": {...},
  "coverage": {...},
  "payment_history": [...],
  "documents": [...],
  "claims": [...]
}
```

#### Payment Management APIs
```
GET /api/v1/payments/pending/
GET /api/v1/payments/history/
POST /api/v1/payments/make-payment/
GET /api/v1/payments/receipts/{id}/
POST /api/v1/payments/autopay/setup/
```

#### Document APIs
```
GET /api/v1/documents/
POST /api/v1/documents/upload/
GET /api/v1/documents/{id}/download/
DELETE /api/v1/documents/{id}/
```

#### Profile APIs
```
GET /api/v1/users/profile/
PATCH /api/v1/users/profile/
POST /api/v1/users/change-password/
POST /api/v1/users/beneficiaries/
PATCH /api/v1/users/notification-preferences/
```

### Frontend Pages

#### Dashboard Overview (`app/dashboard/page.tsx`)
Sections:
- Welcome message with user name
- Quick stats cards (active policies, pending payments, claims)
- Action items requiring attention
- Active policies grid (top 3-5)
- Recent activity timeline
- Policy recommendations
- Quick action buttons

#### My Policies Page (`app/my-policies/page.tsx`)
Features:
- Policies list with filters
- Status badges (active, pending, expired)
- Quick actions per policy:
  - View details
  - Download certificate
  - File claim
  - Renew
  - Cancel
- Search and filter functionality
- Sort options

#### Policy Detail Modal/Page
Information:
- Policy overview
- Coverage details
- Premium and payment schedule
- Payment history table
- Related documents
- Claims history for this policy
- Renewal option
- Cancel policy button

#### Payment Management Page (`app/payments/page.tsx`)
Sections:
- Pending payments with due dates
- "Pay Now" buttons
- Payment history table with filters
- Download receipt links
- Saved payment methods
- Auto-pay configuration
- Installment tracker

#### Claims Page (`app/claims/page.tsx`)
Features:
- "File New Claim" button
- Active claims with status tracking
- Claims history
- Claim detail view with timeline
- Upload additional documents
- Chat with assessor (future)

#### Documents Hub (`app/documents/page.tsx`)
Organization:
- Documents by type (certificates, receipts, IDs, etc.)
- Search and filter
- Upload new documents
- Download individual or bulk (ZIP)
- Email documents to self
- Preview documents

#### Profile Settings (`app/profile/page.tsx`)
Tabs:
- Personal Information (edit form)
- Change Password
- Beneficiaries Management
- Dependents (for medical insurance)
- Notification Preferences
- Communication Preferences
- Two-Factor Authentication
- Delete Account

---

## Phase 7: Claims Management

### Backend Implementation

#### Claims Filing API
```
POST /api/v1/claims/
Body:
{
  "policy_id": "...",
  "type": "accident",
  "description": "...",
  "amount_claimed": 50000,
  "incident_date": "2026-01-20",
  "incident_location": "Nairobi"
}

Response:
{
  "claim_id": "...",
  "claim_number": "CLM-2026-00123",
  "status": "submitted",
  "filed_date": "..."
}
```

#### Document Upload for Claims
```
POST /api/v1/claims/{claim_id}/documents/
Body: multipart/form-data
{
  "document_type": "police_report",
  "file": <file>
}
```

#### Claims Tracking API
```
GET /api/v1/claims/{claim_id}/
Response:
{
  "claim": {...},
  "timeline": [
    {
      "stage": "submitted",
      "date": "2026-01-20 10:30",
      "note": "Claim submitted successfully"
    },
    {
      "stage": "under_review",
      "date": "2026-01-21 09:15",
      "note": "Assigned to assessor John Doe"
    }
  ],
  "documents": [...],
  "assessor": {...}
}
```

#### Claims List API
```
GET /api/v1/claims/
Query params:
  - status
  - policy_id
  - date_from, date_to
```

### Claims Workflow System

#### Workflow Stages
1. **Submitted** - Initial claim submission
2. **Under Review** - Assigned to assessor
3. **Documents Requested** - Additional docs needed
4. **Assessment Complete** - Assessor completed review
5. **Approved** - Claim approved for payment
6. **Rejected** - Claim rejected with reason
7. **Settled** - Payment completed

#### Status Transitions
```python
# apps/claims/workflows.py

class ClaimWorkflow:
    def assign_assessor(claim):
        # Auto-assign or manual assignment
        # Update status to "under_review"
        # Send notification to assessor

    def request_documents(claim, documents_needed):
        # Update status
        # Send notification to customer

    def approve_claim(claim, approved_amount):
        # Update status and amount
        # Trigger payment process

    def reject_claim(claim, reason):
        # Update status
        # Send notification with reason
```

#### Notifications
- Email + SMS on status change
- In-app notifications
- WhatsApp notifications (optional)

### Frontend Implementation

#### File Claim Wizard (`app/claims/file/page.tsx`)
Steps:
1. **Select Policy**
   - Display user's active policies
   - Select the policy for claim

2. **Claim Details**
   - Claim type (dropdown)
   - Incident date
   - Incident location
   - Description (textarea)
   - Amount claimed

3. **Upload Documents**
   - Police report (for theft/accident)
   - Photos of damage
   - Medical reports (for health claims)
   - Other supporting documents
   - Drag-and-drop file upload

4. **Review & Submit**
   - Summary of claim
   - Review uploaded documents
   - Terms acknowledgment
   - Submit button

#### Claims Tracking Page (`app/claims/[id]/page.tsx`)
Components:
- Claim header (claim number, status, amount)
- Progress timeline/stepper
- Claim details section
- Uploaded documents grid
- Assessor information (when assigned)
- Assessment notes (visible to customer)
- "Upload Additional Documents" button
- Chat/messages section (future)
- Settlement information (when settled)

#### Claims History Page
Features:
- Table of all claims
- Filter by status, policy, date range
- Quick view of claim details
- Download settlement letter
- Resubmit option (if rejected with issues)

---

## Phase 8: Admin Panel

### Backend APIs

#### Dashboard Analytics
```
GET /api/v1/admin/dashboard/
Response:
{
  "metrics": {
    "total_users": 1250,
    "active_policies": 850,
    "total_revenue": 12500000,
    "pending_claims": 23,
    "today_sales": 350000
  },
  "charts": {
    "revenue_trend": [...],
    "policy_breakdown": [...],
    "claims_ratio": [...]
  },
  "recent_activity": [...],
  "alerts": [...]
}
```

#### User Management APIs
```
GET /api/v1/admin/users/
POST /api/v1/admin/users/
GET /api/v1/admin/users/{id}/
PATCH /api/v1/admin/users/{id}/
DELETE /api/v1/admin/users/{id}/
POST /api/v1/admin/users/{id}/suspend/
POST /api/v1/admin/users/{id}/activate/
GET /api/v1/admin/users/{id}/activity-log/
```

#### Policy Management APIs
```
GET /api/v1/admin/policy-types/
POST /api/v1/admin/policy-types/
PATCH /api/v1/admin/policy-types/{id}/
DELETE /api/v1/admin/policy-types/{id}/
POST /api/v1/admin/policy-types/bulk-upload/
GET /api/v1/admin/policies/
PATCH /api/v1/admin/policies/{id}/approve/
PATCH /api/v1/admin/policies/{id}/cancel/
```

#### Transaction Management APIs
```
GET /api/v1/admin/transactions/
GET /api/v1/admin/transactions/{id}/
POST /api/v1/admin/transactions/{id}/refund/
POST /api/v1/admin/transactions/reconcile/
GET /api/v1/admin/transactions/failed/
POST /api/v1/admin/transactions/{id}/retry/
```

#### Claims Processing APIs
```
GET /api/v1/admin/claims/
PATCH /api/v1/admin/claims/{id}/assign/
PATCH /api/v1/admin/claims/{id}/approve/
PATCH /api/v1/admin/claims/{id}/reject/
POST /api/v1/admin/claims/{id}/request-documents/
POST /api/v1/admin/claims/{id}/settle/
```

#### Reports APIs
```
GET /api/v1/admin/reports/sales/
GET /api/v1/admin/reports/revenue/
GET /api/v1/admin/reports/claims/
GET /api/v1/admin/reports/user-growth/
POST /api/v1/admin/reports/custom/
GET /api/v1/admin/reports/export/{report_id}/
```

#### Settings APIs
```
GET /api/v1/admin/settings/
PATCH /api/v1/admin/settings/
GET /api/v1/admin/settings/payment-gateways/
PATCH /api/v1/admin/settings/payment-gateways/
GET /api/v1/admin/settings/notification-templates/
PATCH /api/v1/admin/settings/notification-templates/{id}/
GET /api/v1/admin/roles/
POST /api/v1/admin/roles/
PATCH /api/v1/admin/roles/{id}/
```

### Frontend Pages

#### Admin Dashboard (`app/admin/page.tsx`)
Widgets:
- Key metrics cards (animated numbers)
- Revenue chart (line/bar chart)
- Policy breakdown (pie/donut chart)
- Claims ratio chart
- Recent transactions table
- Recent user registrations
- Pending tasks/alerts
- Quick action buttons

#### User Management (`app/admin/users/page.tsx`)
Features:
- Users table with search and filters
- Role filter (customer, staff, admin)
- Status filter (active, suspended)
- User detail modal/drawer
- Add/Edit user form
- Suspend/Activate actions
- View user policies
- View user transactions
- Activity log
- Send notification to user
- Reset password

#### Policy Management (`app/admin/policies/page.tsx`)
Sections:
- **Policy Types Tab**
  - List of policy types
  - Add/Edit policy type
  - Configure pricing
  - Set coverage details
  - Bulk upload (CSV)
  - Activate/Deactivate

- **User Policies Tab**
  - All user policies
  - Filters (status, category, company)
  - Approve pending policies
  - Cancel policies
  - View policy details
  - Download certificate

- **Insurance Companies Tab**
  - List of companies
  - Add/Edit company
  - Set commission rates
  - Performance metrics

#### Transaction Management (`app/admin/transactions/page.tsx`)
Features:
- Transactions table
- Filter by status, payment method, date range
- Transaction detail view
- Payment reconciliation interface
- Failed payments section with retry option
- Refund processing
- Export transactions (CSV/Excel)
- Payment gateway status

#### Claims Processing (`app/admin/claims/page.tsx`)
Components:
- Claims queue (pending review)
- Assigned to me (for assessors)
- All claims table
- Claim detail view with:
  - Claim information
  - Policy details
  - Customer information
  - Uploaded documents viewer
  - Assessment form
  - Approval/Rejection form
  - Settlement amount input
  - Internal notes
- Assign to assessor dropdown
- Request additional documents
- Claims analytics dashboard

#### Reports & Analytics (`app/admin/reports/page.tsx`)
Report Types:
- **Sales Reports**
  - Daily, weekly, monthly views
  - By policy category
  - By insurance company
  - Sales by agent (future)

- **Revenue Reports**
  - Revenue trends
  - Revenue by product
  - Premium collection rate
  - Outstanding premiums

- **Claims Reports**
  - Claims ratio
  - Average settlement amount
  - Processing time metrics
  - Rejection rate and reasons

- **User Growth**
  - New registrations
  - Active users
  - User retention
  - User demographics

- **Custom Report Builder**
  - Select metrics
  - Choose date range
  - Apply filters
  - Generate and export

#### Settings (`app/admin/settings/page.tsx`)
Sections:
- **General Settings**
  - Company information
  - Contact details
  - Business hours
  - Terms and conditions

- **Payment Gateway Configuration**
  - M-Pesa settings (Consumer Key, Secret)
  - Paystack settings (Public/Secret keys)
  - Test/Live mode toggle

- **Email/SMS Configuration**
  - SMTP settings
  - SendGrid API key
  - Africa's Talking credentials
  - Default sender information

- **Notification Templates**
  - Email templates (HTML editor)
  - SMS templates
  - WhatsApp templates
  - Template variables

- **Role & Permission Management**
  - Define roles
  - Assign permissions
  - Role hierarchy

- **System Configuration**
  - Cache settings
  - Session timeout
  - File upload limits
  - Maintenance mode

- **Audit Logs**
  - View system logs
  - User actions log
  - Filter by user, action type, date

---

## Phase 9: Workflow Engine

### Custom Workflow System

#### Workflow Configuration
```python
# apps/workflows/models.py

class WorkflowTemplate:
    - id
    - name (e.g., "Motor Insurance Workflow")
    - policy_category (FK)
    - stages (JSON array of stage definitions)
    - is_active

class WorkflowInstance:
    - id
    - policy (FK)
    - template (FK)
    - current_stage
    - status (active, completed, failed)
    - started_at
    - completed_at

class WorkflowStageExecution:
    - id
    - workflow_instance (FK)
    - stage_name
    - status (pending, in_progress, completed, skipped, failed)
    - assigned_to (FK to User)
    - started_at
    - completed_at
    - notes
    - metadata (JSON)
```

#### Stage Definitions
```json
{
  "stages": [
    {
      "name": "Quote Generated",
      "type": "automatic",
      "actions": ["send_quote_email"],
      "next_stage": "Payment Pending"
    },
    {
      "name": "Payment Pending",
      "type": "waiting",
      "timeout": "24 hours",
      "timeout_action": "send_reminder",
      "next_stage": "Underwriting"
    },
    {
      "name": "Underwriting",
      "type": "manual",
      "assignable": true,
      "required_role": "underwriter",
      "next_stage": "Policy Issuance"
    },
    {
      "name": "Policy Issuance",
      "type": "automatic",
      "actions": ["generate_certificate", "send_certificate_email"],
      "next_stage": "Active"
    },
    {
      "name": "Active",
      "type": "terminal",
      "actions": ["activate_policy"]
    }
  ]
}
```

#### Workflow Engine
```python
# apps/workflows/engine.py

class WorkflowEngine:
    def start_workflow(policy, template):
        # Create workflow instance
        # Move to first stage
        # Execute stage actions

    def advance_stage(workflow_instance, notes=None):
        # Complete current stage
        # Move to next stage
        # Execute stage actions
        # Send notifications

    def assign_stage(workflow_stage, user):
        # Assign stage to user
        # Update status
        # Send notification

    def execute_stage_actions(stage, policy):
        # Run automated actions
        # Send emails/SMS
        # Generate documents
        # Update policy status
```

#### API Endpoints
```
GET /api/v1/workflows/templates/
POST /api/v1/workflows/templates/
GET /api/v1/workflows/instances/{policy_id}/
POST /api/v1/workflows/instances/{id}/advance/
POST /api/v1/workflows/stages/{id}/assign/
GET /api/v1/workflows/my-tasks/
```

### Background Jobs (Celery)

#### Celery Configuration
```python
# bowman_insurance/celery.py

app = Celery('bowman_insurance')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

#### Task Definitions

##### Email Tasks
```python
# apps/notifications/tasks.py

@shared_task
def send_email(to, subject, template, context):
    # Render email template
    # Send via SendGrid/SES
    # Log email sent

@shared_task
def send_bulk_email(user_ids, subject, template, context):
    # Send to multiple users
    # Batch processing
```

##### SMS Tasks
```python
@shared_task
def send_sms(phone, message):
    # Send via Africa's Talking
    # Log SMS sent

@shared_task
def send_bulk_sms(phone_list, message):
    # Bulk SMS sending
```

##### Certificate Generation
```python
# apps/documents/tasks.py

@shared_task
def generate_policy_certificate(policy_id):
    # Fetch policy data
    # Generate PDF using ReportLab
    # Upload to S3
    # Update policy with certificate URL
    # Send email with certificate
```

##### Receipt Generation
```python
@shared_task
def generate_receipt(transaction_id):
    # Fetch transaction data
    # Generate PDF receipt
    # Upload to S3
    # Email to customer
```

##### Report Generation
```python
@shared_task
def generate_report(report_type, filters, user_id):
    # Query data based on filters
    # Generate report (PDF/Excel)
    # Store in S3
    # Notify user when ready
```

##### Payment Reminders
```python
@shared_task
def send_payment_reminders():
    # Find policies with upcoming/overdue payments
    # Send reminder emails/SMS
    # Log reminders sent

# Scheduled to run daily
```

##### Data Cleanup
```python
@shared_task
def cleanup_expired_tokens():
    # Delete expired JWT tokens from blacklist

@shared_task
def cleanup_old_notifications():
    # Archive notifications older than 90 days

@shared_task
def cleanup_temp_files():
    # Remove temporary uploaded files
```

#### Celery Beat (Scheduled Tasks)
```python
# settings.py

CELERY_BEAT_SCHEDULE = {
    'send-payment-reminders': {
        'task': 'apps.payments.tasks.send_payment_reminders',
        'schedule': crontab(hour=9, minute=0),
    },
    'cleanup-expired-tokens': {
        'task': 'apps.users.tasks.cleanup_expired_tokens',
        'schedule': crontab(hour=2, minute=0),
    },
    'daily-backup-notification': {
        'task': 'apps.core.tasks.check_backup_status',
        'schedule': crontab(hour=8, minute=0),
    },
}
```

---

## Phase 10: Notifications & Communications

### Multi-Channel Notification System

#### Notification Types
```python
NOTIFICATION_TYPES = [
    ('policy_issued', 'Policy Issued'),
    ('payment_received', 'Payment Received'),
    ('payment_due', 'Payment Due'),
    ('payment_overdue', 'Payment Overdue'),
    ('claim_submitted', 'Claim Submitted'),
    ('claim_status_update', 'Claim Status Update'),
    ('claim_approved', 'Claim Approved'),
    ('claim_rejected', 'Claim Rejected'),
    ('claim_settled', 'Claim Settled'),
    ('policy_expiring_soon', 'Policy Expiring Soon'),
    ('policy_renewed', 'Policy Renewed'),
    ('document_uploaded', 'Document Uploaded'),
    ('document_verified', 'Document Verified'),
]
```

#### Notification Service
```python
# apps/notifications/services.py

class NotificationService:
    def send_notification(
        user,
        notification_type,
        context,
        channels=['email', 'sms', 'in_app']
    ):
        # Check user preferences
        # Send via enabled channels
        # Create in-app notification
        # Queue email/SMS tasks

    def send_email_notification(user, template, context):
        # Render template
        # Queue email task

    def send_sms_notification(user, message):
        # Queue SMS task

    def send_whatsapp_notification(user, message):
        # Queue WhatsApp task (via Africa's Talking)

    def create_in_app_notification(user, title, message, action_url):
        # Create notification record
        # Trigger real-time update (WebSocket - future)
```

### Email Integration

#### SendGrid/AWS SES Setup
```python
# settings.py

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = os.getenv('SENDGRID_API_KEY')
DEFAULT_FROM_EMAIL = 'noreply@bowmaninsurance.co.ke'
```

#### Email Templates
```
templates/emails/
├── base.html (base template with header/footer)
├── policy_issued.html
├── payment_received.html
├── payment_reminder.html
├── claim_submitted.html
├── claim_approved.html
└── welcome.html
```

#### Template Context
```python
# Example: Policy Issued Email
context = {
    'user_name': 'John Doe',
    'policy_number': 'POL-2026-00123',
    'policy_type': 'Comprehensive Motor Insurance',
    'premium': 45000,
    'start_date': '2026-02-01',
    'end_date': '2027-02-01',
    'certificate_url': 'https://...',
}
```

### SMS Integration (Africa's Talking)

#### Setup
```python
# apps/notifications/sms.py

import africastalking

class SMSService:
    def __init__(self):
        username = settings.AFRICASTALKING_USERNAME
        api_key = settings.AFRICASTALKING_API_KEY
        africastalking.initialize(username, api_key)
        self.sms = africastalking.SMS

    def send_sms(self, phone, message):
        try:
            response = self.sms.send(message, [phone])
            # Log response
            return response
        except Exception as e:
            # Log error
            raise
```

#### SMS Templates
```python
SMS_TEMPLATES = {
    'payment_received': 'Hi {name}, your payment of KES {amount} for policy {policy_number} has been received. Thank you!',
    'payment_due': 'Hi {name}, your payment of KES {amount} for policy {policy_number} is due on {due_date}.',
    'claim_approved': 'Hi {name}, your claim {claim_number} has been approved. KES {amount} will be settled within 3 business days.',
}
```

### WhatsApp Integration

#### Africa's Talking WhatsApp Setup
```python
# apps/notifications/whatsapp.py

class WhatsAppService:
    def send_message(self, phone, message):
        # Use Africa's Talking WhatsApp API
        # Queue message
        # Handle delivery status
        pass
```

### In-App Notifications

#### Real-Time Updates (Future Enhancement)
- WebSocket connection for live notifications
- Notification bell icon with count
- Dropdown notification list
- Mark as read functionality

#### Notification Preferences
```python
# User preferences model
class NotificationPreference:
    user = models.OneToOneField(User)

    # Email preferences
    email_policy_updates = models.BooleanField(default=True)
    email_payment_reminders = models.BooleanField(default=True)
    email_claim_updates = models.BooleanField(default=True)
    email_marketing = models.BooleanField(default=False)

    # SMS preferences
    sms_policy_updates = models.BooleanField(default=True)
    sms_payment_reminders = models.BooleanField(default=True)
    sms_claim_updates = models.BooleanField(default=True)

    # WhatsApp preferences
    whatsapp_enabled = models.BooleanField(default=False)

    # In-app preferences
    in_app_enabled = models.BooleanField(default=True)
```

### API Endpoints
```
GET /api/v1/notifications/
PATCH /api/v1/notifications/{id}/read/
POST /api/v1/notifications/mark-all-read/
GET /api/v1/notifications/unread-count/
GET /api/v1/notifications/preferences/
PATCH /api/v1/notifications/preferences/
```

---

## Phase 11: Document Management

### Document Generation

#### PDF Certificate Generation (ReportLab)
```python
# apps/documents/generators.py

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

class CertificateGenerator:
    def generate_policy_certificate(policy):
        # Create PDF
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)

        # Add company logo
        # Add certificate header
        # Add policy details
        # Add QR code for verification
        # Add terms footer

        p.showPage()
        p.save()

        # Upload to S3
        # Return S3 URL

class ReceiptGenerator:
    def generate_payment_receipt(transaction):
        # Create PDF receipt
        # Include: transaction details, policy info, amount
        # Upload to S3
        # Return S3 URL
```

#### Document Templates
- Policy Certificate Template
- Payment Receipt Template
- Claims Settlement Letter Template
- Policy Cancellation Letter Template

### Document Storage (AWS S3)

#### S3 Configuration
```python
# settings.py

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = 'bowman-insurance-documents'
AWS_S3_REGION_NAME = 'af-south-1'  # Cape Town region
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = 'private'
AWS_S3_ENCRYPTION = True
```

#### S3 Service
```python
# apps/documents/storage.py

import boto3
from django.conf import settings

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME

    def upload_file(self, file, key, content_type):
        # Upload to S3
        # Set metadata
        # Return S3 URL

    def download_file(self, key):
        # Generate presigned URL
        # Return temporary download link

    def delete_file(self, key):
        # Delete from S3

    def generate_presigned_url(self, key, expiration=3600):
        # Generate temporary access URL
        # Valid for specified duration
        return url
```

#### File Organization
```
S3 Bucket Structure:
├── certificates/
│   ├── {year}/
│   │   ├── {month}/
│   │   │   └── {policy_number}.pdf
├── receipts/
│   ├── {year}/
│   │   ├── {month}/
│   │   │   └── {transaction_id}.pdf
├── user_documents/
│   ├── {user_id}/
│   │   ├── id_documents/
│   │   ├── kra_pins/
│   │   └── other/
├── claim_documents/
│   ├── {claim_id}/
│   │   ├── photos/
│   │   ├── reports/
│   │   └── other/
└── reports/
    └── {report_id}.pdf
```

### Document Access Control

#### Presigned URLs
```python
def get_document_download_url(document_id, user):
    document = Document.objects.get(id=document_id)

    # Check permissions
    if not user.can_access_document(document):
        raise PermissionDenied

    # Generate presigned URL (valid for 1 hour)
    url = s3_service.generate_presigned_url(document.s3_key, expiration=3600)

    return url
```

#### Document Verification
```python
# Verify document authenticity via QR code
def verify_certificate(certificate_id, verification_code):
    # Check if certificate exists
    # Validate verification code
    # Return certificate details
    pass
```

### Medical Card for Digital Wallets

#### Apple Wallet Integration
```python
# Generate .pkpass file for medical insurance cards
from passbook import Pass

def generate_medical_card(policy):
    # Create pass
    # Add policy details
    # Add barcode/QR code
    # Return .pkpass file
```

#### Google Wallet Integration
```python
# Generate Google Wallet pass
def generate_google_wallet_card(policy):
    # Create JWT
    # Add card details
    # Return add-to-wallet URL
```

### API Endpoints
```
POST /api/v1/documents/upload/
GET /api/v1/documents/
GET /api/v1/documents/{id}/
GET /api/v1/documents/{id}/download/
DELETE /api/v1/documents/{id}/
POST /api/v1/documents/bulk-download/
GET /api/v1/documents/certificates/{policy_id}/
GET /api/v1/documents/receipts/{transaction_id}/
POST /api/v1/documents/medical-card/{policy_id}/apple-wallet/
POST /api/v1/documents/medical-card/{policy_id}/google-wallet/
```

---

## Phase 12: Testing & Optimization

### Testing Strategy

#### Unit Testing

##### Backend Tests (Pytest)
```python
# tests/test_users.py
def test_user_registration():
    # Test user creation
    # Test validation
    # Test duplicate email

# tests/test_policies.py
def test_policy_creation():
    # Test policy creation
    # Test premium calculation

# tests/test_payments.py
def test_mpesa_payment():
    # Test payment initiation
    # Test callback handling

# tests/test_claims.py
def test_claim_filing():
    # Test claim creation
    # Test workflow progression
```

**Target Coverage:** 80%+ code coverage

##### Frontend Tests (Jest + React Testing Library)
```typescript
// __tests__/components/PolicyCard.test.tsx
describe('PolicyCard', () => {
  test('renders policy information correctly', () => {
    // Test component rendering
  });

  test('handles add to cart click', () => {
    // Test user interaction
  });
});

// __tests__/hooks/useAuth.test.ts
describe('useAuth', () => {
  test('logs in user successfully', () => {
    // Test authentication hook
  });
});
```

#### Integration Testing

##### API Integration Tests
```python
# tests/integration/test_policy_purchase.py
def test_complete_policy_purchase_flow():
    # Register user
    # Browse policies
    # Add to cart
    # Checkout
    # Make payment
    # Verify policy issued
```

##### Payment Gateway Integration Tests
```python
# Test with sandbox/test credentials
def test_mpesa_integration():
    # Test STK push
    # Test callback

def test_paystack_integration():
    # Test card payment
    # Test webhook
```

#### End-to-End Testing (Playwright)

```typescript
// e2e/purchase-policy.spec.ts
test('complete policy purchase journey', async ({ page }) => {
  // Visit homepage
  await page.goto('/');

  // Browse policies
  await page.click('text=Motor Insurance');

  // Select policy
  await page.click('text=Comprehensive Cover');

  // Add to cart
  await page.click('button:has-text("Add to Cart")');

  // Checkout
  await page.click('text=Checkout');

  // Fill details and pay
  // ... assertions
});
```

**Test Scenarios:**
- User registration and login
- Policy browsing and filtering
- Policy purchase flow
- Payment processing
- Claim filing
- Admin operations

#### Performance Testing

##### Load Testing (Locust)
```python
# locustfile.py
from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def browse_policies(self):
        self.client.get("/api/v1/policies/")

    @task(1)
    def view_policy_detail(self):
        self.client.get("/api/v1/policies/123/")

    @task(2)
    def login(self):
        self.client.post("/api/v1/auth/login/", json={
            "email": "test@example.com",
            "password": "password123"
        })
```

**Performance Targets:**
- 10,000+ concurrent users
- API response time <200ms (95th percentile)
- Page load time <3s on 3G

##### Stress Testing
- Identify breaking point
- Test database connection limits
- Test payment gateway limits
- Recovery testing

#### Security Testing

##### Security Audit
- OWASP Top 10 vulnerability scan
- SQL injection testing
- XSS testing
- CSRF protection verification
- Authentication bypass attempts
- Authorization testing
- Rate limiting verification

##### Penetration Testing
- External security audit (recommended)
- Vulnerability assessment
- Security patches

### Optimization

#### Database Optimization

##### Indexing Strategy
```python
# Add indexes to frequently queried fields
class Policy(models.Model):
    policy_number = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    status = models.CharField(max_length=20, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['created_at', 'status']),
        ]
```

##### Query Optimization
- Use `select_related()` for foreign keys
- Use `prefetch_related()` for reverse foreign keys
- Avoid N+1 queries
- Use `only()` and `defer()` for large models
- Database query profiling with Django Debug Toolbar

##### Connection Pooling (PgBouncer)
```
# pgbouncer.ini
[databases]
bowman_insurance = host=localhost port=5432 dbname=bowman_insurance

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

#### Caching Strategy

##### Multi-Layer Caching
1. **Browser Cache** (HTTP headers)
2. **CDN Cache** (CloudFlare)
3. **Redis Cache** (API responses)
4. **Database Query Cache**

##### Redis Caching Implementation
```python
# Cache policy listings
@cache_page(60 * 5)  # 5 minutes
def list_policies(request):
    # ... view logic

# Cache policy detail
def get_policy_detail(policy_id):
    cache_key = f'policy_detail_{policy_id}'
    cached = cache.get(cache_key)

    if cached:
        return cached

    policy = Policy.objects.get(id=policy_id)
    cache.set(cache_key, policy, 60 * 10)  # 10 minutes
    return policy
```

##### Cache Invalidation
```python
# Invalidate cache when policy is updated
@receiver(post_save, sender=Policy)
def invalidate_policy_cache(sender, instance, **kwargs):
    cache_key = f'policy_detail_{instance.id}'
    cache.delete(cache_key)
```

**Target:** 80%+ cache hit rate

#### Frontend Optimization

##### Code Splitting (Next.js)
```typescript
// Dynamic imports for heavy components
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});
```

##### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/policy-image.jpg"
  width={300}
  height={200}
  alt="Policy"
  loading="lazy"
/>
```

##### Asset Optimization
- Minify JavaScript and CSS
- Compress images (WebP format)
- Use CDN for static assets
- Implement lazy loading
- Reduce bundle size

##### Performance Monitoring
```typescript
// Web Vitals tracking
export function reportWebVitals(metric) {
  // Send to analytics
  analytics.track(metric.name, metric.value);
}
```

**Targets:**
- Lighthouse Performance Score: >90
- First Contentful Paint: <1.8s
- Time to Interactive: <3.9s
- Cumulative Layout Shift: <0.1

#### API Optimization

##### Response Compression (gzip)
```python
MIDDLEWARE = [
    'django.middleware.gzip.GZipMiddleware',
    # ... other middleware
]
```

##### Pagination
```python
# Use cursor pagination for large datasets
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.CursorPagination',
    'PAGE_SIZE': 20
}
```

##### Rate Limiting
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}
```

#### CDN Configuration (CloudFlare)

- Enable auto minification (JS, CSS, HTML)
- Browser cache TTL: 4 hours
- Cache level: Standard
- Enable Brotli compression
- Image optimization
- Mobile optimization
- DDoS protection

---

## Phase 13: Deployment & Launch

### Deployment Infrastructure

#### Environment Setup

##### Development Environment
- Local development machines
- Docker Compose for services
- SQLite or PostgreSQL (local)
- Local Redis
- Mock payment gateways

##### Staging Environment
- Mirrors production setup
- Separate database (test data)
- Test payment gateway credentials
- Limited resources (cost optimization)
- Used for UAT and QA

##### Production Environment
- High availability setup
- Load balancer
- Multiple app instances
- Managed database (PostgreSQL)
- Managed Redis
- Production payment gateways
- Full monitoring and logging

#### Hosting Recommendations

##### Option 1: AWS (Recommended)
```
Frontend: Vercel (Next.js optimized)
Backend: AWS EC2 (2x t3.medium instances)
Database: AWS RDS PostgreSQL (db.t3.medium)
Cache: AWS ElastiCache Redis
Storage: AWS S3
CDN: CloudFlare
Load Balancer: AWS ALB
```

**Estimated Monthly Cost:** $200-300

##### Option 2: DigitalOcean
```
Frontend: Vercel
Backend: DigitalOcean Droplets (2x 4GB RAM)
Database: DigitalOcean Managed PostgreSQL
Cache: DigitalOcean Managed Redis
Storage: DigitalOcean Spaces
CDN: CloudFlare
Load Balancer: DigitalOcean Load Balancer
```

**Estimated Monthly Cost:** $150-250

##### Option 3: Railway/Render (Easiest)
```
Frontend: Vercel
Backend: Railway/Render
Database: Managed PostgreSQL
Cache: Managed Redis
Storage: AWS S3
CDN: CloudFlare
```

**Estimated Monthly Cost:** $100-150 (starter)

### CI/CD Pipeline (GitHub Actions)

#### Workflow Configuration
```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Run Backend Tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest

      - name: Run Frontend Tests
        run: |
          cd frontend
          npm install
          npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Images
        run: |
          docker build -t backend:latest ./backend
          docker build -t frontend:latest ./frontend

      - name: Push to Registry
        run: |
          docker push registry.example.com/backend:latest
          docker push registry.example.com/frontend:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # SSH to server
          # Pull latest images
          # Run migrations
          # Restart services
```

### Database Migration Strategy

#### Pre-Deployment
```bash
# Backup production database
pg_dump -h host -U user -d bowman_insurance > backup.sql

# Test migrations on staging
python manage.py migrate --plan
python manage.py migrate

# Verify data integrity
python manage.py check
```

#### Deployment
```bash
# Run migrations (zero downtime)
python manage.py migrate

# Collect static files
python manage.py collectstatic --noreply

# Clear cache
python manage.py clear_cache
```

#### Rollback Plan
```bash
# Revert migrations if needed
python manage.py migrate app_name previous_migration

# Restore database from backup
psql -h host -U user -d bowman_insurance < backup.sql
```

### SSL/HTTPS Configuration

#### Certificate Setup
- Let's Encrypt (free SSL)
- Auto-renewal with certbot
- Force HTTPS redirect
- HSTS headers

```python
# Django settings
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

### Monitoring & Logging

#### Error Tracking (Sentry)
```python
# settings.py
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    environment=os.getenv('ENVIRONMENT'),
    traces_sample_rate=0.1,
)
```

#### Application Monitoring
- Response time tracking
- Error rate monitoring
- Database query performance
- API endpoint metrics
- Celery task monitoring

#### Log Management
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'logs/django.log',
        },
        'sentry': {
            'class': 'sentry_sdk.integrations.logging.EventHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'sentry'],
            'level': 'INFO',
        },
    },
}
```

### Launch Preparation

#### Pre-Launch Checklist
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Database backups configured
- [ ] SSL certificates installed
- [ ] Monitoring and alerts set up
- [ ] Error tracking configured
- [ ] CDN configured and tested
- [ ] Payment gateways in production mode
- [ ] Email/SMS services configured
- [ ] Documentation completed
- [ ] Staff trained
- [ ] Support system ready

#### User Acceptance Testing (UAT)
- Internal team testing
- Selected customer beta testing
- Insurance company partners testing
- Collect feedback
- Fix critical issues
- Retest

#### Soft Launch
- Limited user access (invitation only)
- Monitor performance and errors
- Gather user feedback
- Make improvements
- Gradual rollout

#### Full Launch
- Public announcement
- Marketing campaign
- Press release
- Social media promotion
- Monitor traffic and performance
- 24/7 support availability

### Post-Launch

#### Monitoring
- Daily traffic reports
- Error rate monitoring
- Performance metrics
- User feedback collection
- Payment success rate
- Policy issuance rate

#### Support
- Customer support team ready
- Knowledge base articles
- FAQ documentation
- Issue tracking system
- Response time targets

#### Continuous Improvement
- Weekly performance reviews
- Monthly feature updates
- Quarterly major releases
- User feedback implementation
- A/B testing for optimizations

---

## Critical Success Factors

### 1. Security First
- Implement security measures from day one
- HTTPS/SSL for all communications
- Data encryption at rest and in transit
- Regular security audits
- Compliance with Kenya Data Protection Act
- PCI-DSS compliance for payments
- Regular penetration testing

### 2. Mobile-First Design
- 60%+ traffic expected from mobile
- Responsive design on all pages
- Touch-friendly interfaces
- Optimized for 3G networks
- Progressive Web App features
- Mobile payment optimization (M-Pesa)

### 3. Performance
- Page load time <3s on 3G
- API response time <200ms
- Database query optimization
- Effective caching strategy
- CDN for static assets
- Image optimization
- Code splitting and lazy loading

### 4. Payment Reliability
- Robust error handling
- Payment retry mechanisms
- Clear failure messages
- Multiple payment options
- Real-time status updates
- Automated reconciliation
- Refund processing

### 5. Data Integrity
- ACID compliance for transactions
- Database constraints and validations
- Automated backups (daily)
- Point-in-time recovery
- Data consistency checks
- Audit trails

### 6. Scalability
- Horizontal scaling capability
- Stateless application design
- Database connection pooling
- Caching strategy
- Async processing (Celery)
- Load balancing
- Auto-scaling (cloud)

### 7. User Experience
- Intuitive navigation
- Clear information hierarchy
- Fast page loads
- Helpful error messages
- Guided workflows
- Accessibility standards
- Multi-language support (future)

### 8. Regulatory Compliance
- Kenya Data Protection Act
- IRA (Insurance Regulatory Authority) regulations
- Data retention policies
- User consent management
- Privacy policy
- Terms of service
- Cookie policy

---

## Key Technical Decisions

### 1. Architecture Pattern
**Decision:** Three-tier architecture (Presentation, Application, Data)

**Rationale:**
- Clear separation of concerns
- Independent scaling of layers
- Easier maintenance and testing
- Industry standard for web applications

### 2. Monorepo vs Separate Repositories
**Decision:** Separate repositories for frontend and backend

**Rationale:**
- Independent deployment cycles
- Different tech stacks and teams
- Clear boundaries
- Easier CI/CD setup

### 3. Database Choice
**Decision:** PostgreSQL

**Rationale:**
- ACID compliance (critical for financial data)
- JSON field support (flexible policy data)
- Full-text search capabilities
- Proven scalability
- Excellent Django ORM support
- Active community

### 4. Caching Strategy
**Decision:** Multi-layer caching (Browser → CDN → Redis → Database)

**Rationale:**
- Maximize cache hit rate
- Reduce database load
- Improve response times
- Cost optimization

### 5. File Storage
**Decision:** AWS S3 with CloudFront CDN

**Rationale:**
- 99.999999999% durability
- Scalable and reliable
- Server-side encryption
- Versioning support
- Cost-effective
- Global CDN distribution

### 6. Background Job Processing
**Decision:** Celery with Redis broker

**Rationale:**
- Proven Python task queue
- Excellent Django integration
- Scheduled tasks support (Celery Beat)
- Retry mechanisms
- Monitoring capabilities

### 7. Authentication Method
**Decision:** JWT (JSON Web Tokens)

**Rationale:**
- Stateless authentication
- Horizontal scaling friendly
- Mobile-friendly
- Short-lived access tokens + refresh tokens
- Industry standard

### 8. API Design
**Decision:** RESTful API with Django REST Framework

**Rationale:**
- Industry standard
- Excellent documentation
- Built-in serialization
- Easy versioning
- Large ecosystem

### 9. Frontend Framework
**Decision:** Next.js 14 (React)

**Rationale:**
- Server-side rendering (SEO)
- File-based routing
- Image optimization
- Built-in performance optimizations
- Vercel deployment (easy)
- Large community and ecosystem

### 10. Payment Gateway Strategy
**Decision:** Multiple gateways (M-Pesa + Paystack)

**Rationale:**
- M-Pesa: Primary in Kenya (mobile money)
- Paystack: Card payments
- Redundancy and options
- Maximize payment success rate

### 11. Deployment Strategy
**Decision:** Vercel (frontend) + AWS/DigitalOcean (backend)

**Rationale:**
- Vercel: Optimized for Next.js, edge network, easy deployments
- AWS/DO: Flexible, scalable, managed services
- Separation allows independent scaling
- Cost-effective

### 12. Monitoring & Error Tracking
**Decision:** Sentry for error tracking, custom metrics for monitoring

**Rationale:**
- Real-time error reporting
- Performance monitoring
- User impact tracking
- Source map support
- Excellent integrations

---

## Next Steps

1. **Review and Approve Plan** - Stakeholder sign-off on implementation approach
2. **Set Up Development Environment** - Initialize repositories, configure tools
3. **Begin Phase 1** - Project foundation and infrastructure setup
4. **Establish Development Workflow** - Git flow, code review process, deployment pipeline
5. **Start Building** - Begin with backend architecture (Phase 2)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-27 | Development Team | Initial implementation plan |

---

**END OF IMPLEMENTATION PLAN**
