# Bowman Insurance Platform — Claude Session Context

> **Purpose:** This file is automatically read by Claude Code at the start of every session.
> It keeps all sessions in sync so work can resume without duplication or confusion.
> **ALWAYS update this file after completing work in a session.**

---

## Project Overview

**Bowman Insurance Agency** — Digital insurance marketplace and policy management platform for Kenya.
- Customers browse, compare, purchase, and manage insurance policies
- Multiple insurance companies and categories (Motor, Medical, Life, Home, Travel, Business)
- Full admin panel for internal management
- Payments via M-Pesa and Paystack

**Working Directory:** `d:/Bowman/Web App 2.0 - Mall/`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS, shadcn/ui |
| State | Zustand (auth/global), TanStack Query (server state), useState (local) |
| Backend | Django 5.0, Django REST Framework, PostgreSQL 15+, Redis 7+, Celery |
| Auth | JWT — 15-min access token, 7-day refresh token |
| Payments | M-Pesa Daraja API (STK Push), Paystack (card payments) |
| Storage | AWS S3 |
| Notifications | SendGrid (email), Africa's Talking (SMS) |
| Deployment | Vercel (frontend), Railway (backend), Docker |

---

## Project Structure

```
Web App 2.0 - Mall/
├── frontend/src/
│   ├── app/                         # Next.js pages (App Router)
│   │   ├── (auth)/                  # login, register, forgot-password, reset-password
│   │   ├── admin/                   # Admin panel (7 pages - dashboard, users, claims, policies, transactions, reports, settings)
│   │   ├── dashboard/               # Customer dashboard + sub-pages:
│   │   │   ├── page.tsx             #   Main dashboard
│   │   │   ├── my-policies/         #   Policy list
│   │   │   ├── documents/           #   Document hub
│   │   │   ├── pending-payments/    #   Payment schedules
│   │   │   ├── payments/            #   Payment history
│   │   │   ├── claims/              #   Claims list
│   │   │   ├── claims/new/          #   New claim submission
│   │   │   └── profile/             #   Profile (5 tabs: Personal, Security, Beneficiaries, Notifications, Advanced)
│   │   ├── shop/                    # Insurance mall/marketplace with advanced filters
│   │   ├── policies/                # Browse policies, category pages, policy details [id], compare
│   │   ├── purchase/[id]/           # Policy purchase flow (multi-step)
│   │   ├── payment/                 # Payment pages:
│   │   │   ├── [policyId]/          #   Payment method selection
│   │   │   ├── mpesa/[txId]/        #   M-Pesa STK Push flow + polling
│   │   │   ├── card/[txId]/         #   Paystack card flow + redirect
│   │   │   └── success/[txId]/      #   Payment confirmation + receipt
│   │   └── companies/               # Insurance company listings
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives (Button, Card, Badge, Dialog, Select, Progress, Tabs, Switch, etc.)
│   │   ├── auth/                    # ProtectedRoute (requireAdmin prop for admin-only)
│   │   ├── dashboard/               # beneficiary-modal.tsx, document-upload-modal.tsx
│   │   ├── layout/                  # Navbar (mega menu), Footer, Sidebar
│   │   ├── shop/                    # Marketplace components
│   │   └── shared/                  # Loading spinners, modals, shared components
│   └── lib/
│       ├── api/                     # All API client modules (see list below)
│       ├── auth/                    # auth-context.tsx — JWT management, useAuth() hook
│       ├── cache/                   # Cache manager with TTL support
│       └── hooks/                   # Custom React hooks
│
└── backend/
    ├── apps/
    │   ├── users/          # Custom User model, JWT auth, profiles, beneficiaries
    │   ├── policies/       # Companies, categories, policy types, customer policies, reviews
    │   ├── payments/       # Transactions, schedules, M-Pesa service, Paystack service, refunds
    │   ├── claims/         # Claims workflow, assessors, ClaimStatusHistory, settlements
    │   ├── documents/      # S3 document storage & verification
    │   ├── notifications/  # In-app, email log, SMS log
    │   ├── workflows/      # Policy lifecycle stages (9 stages)
    │   ├── analytics/      # User activity tracking
    │   ├── dashboard/      # Customer dashboard aggregations (6 endpoints)
    │   └── admin_api/      # Admin panel API (dashboard, users, policies, reports, settings)
    └── bowman_insurance/
        ├── settings/       # base.py, development.py, production.py
        ├── urls.py         # Main URL router — all paths under /api/v1/
        └── celery.py       # Async task config
```

---

## API Services (frontend/src/lib/api/)

All services exist and are complete:

| File | Status | Purpose |
|------|--------|---------|
| `client.ts` | ✅ | Axios instance, JWT interceptors, auto token refresh on 401 |
| `auth.ts` | ✅ | register, login, logout, getProfile, passwordReset, verifyToken |
| `categories.ts` | ✅ | getCategories, getPolicyTypes, getFeaturedPolicies, getInsuranceCompanies, comparePolicies |
| `policies.ts` | ✅ | getUserPolicies, getPolicyById, cancelPolicy, renewPolicy, downloadCertificate |
| `purchase.ts` | ✅ | purchasePolicy, getQuote, calculatePremium |
| `payments.ts` | ✅ | initiatePayment, initiateMpesa, checkMpesaStatus, initializePaystack, verifyPaystack, getTransactions, getReceipt, requestRefund |
| `claims.ts` | ✅ | submitClaim, getUserClaims, getClaimById, uploadClaimDocument, getClaimHistory, getClaimStatistics |
| `documents.ts` | ✅ | getUserDocuments, uploadDocument, downloadDocument, deleteDocument, emailDocument |
| `dashboard.ts` | ✅ | getDashboardData, getDashboardStats, getRecentActivity, getRecommendations, getUpcomingPayments, getExpiringPolicies |
| `notifications.ts` | ✅ | getNotifications, getUnreadCount, markAsRead, markAllAsRead, pollNotifications |
| `profile.ts` | ✅ | updateUserProfile, changePassword, getNotificationPreferences, enable2FA |
| `beneficiaries.ts` | ✅ | getBeneficiaries, createBeneficiary, updateBeneficiary, deleteBeneficiary |
| `admin.ts` | ✅ | 40 functions — dashboard, users, claims, policies, transactions, reports, settings |

---

## Backend API Base URLs

```
/api/v1/auth/           → users app (register, login, profile, password reset)
/api/v1/policies/       → policies app (categories, types, my-policies, companies)
/api/v1/claims/         → claims app
/api/v1/documents/      → documents app
/api/v1/notifications/  → notifications app
/api/v1/payments/       → payments app (M-Pesa, Paystack, transactions)
/api/v1/workflows/      → workflows app
/api/v1/analytics/      → analytics app
/api/v1/dashboard/      → dashboard app (stats, activity, recommendations)
/api/v1/admin/          → admin_api app
```

Swagger docs (when backend running): `http://localhost:8000/api/docs/`
Admin panel: `http://localhost:8000/admin/`

---

## Phase Completion Status

> **Note:** Phase numbers drifted from original plan. Below are the ACTUAL completed phases.

| Phase | Description | Status | Completed |
|-------|-------------|--------|-----------|
| 1 | Foundation & Setup | ✅ Complete | Jan 2026 |
| 2 | Backend Core Architecture | ✅ Complete | Jan 2026 |
| 3 | Frontend UI Framework | ✅ Complete | Jan 2026 |
| 4 | Authentication Pages | ✅ Complete | Jan 27, 2026 |
| 5 | Insurance Marketplace | ✅ Complete | Jan 27, 2026 |
| 6 | Payment Integration (M-Pesa + Paystack) | ✅ Complete | Jan 27, 2026 |
| 7 | Customer Dashboard Enhancement | ✅ Complete | Jan 27, 2026 |
| 8 | Admin Panel | ✅ Complete | Jan 28, 2026 |
| — | Frontend-Backend Integration (MVP flows) | ✅ Complete | Feb 12, 2026 |
| — | Admin Users page → real API | ✅ Complete | Feb 24, 2026 |
| 9 | Admin pages full integration (remaining) | ✅ Complete | Feb 24, 2026 |
| 10 | Notifications system (email/SMS triggers) | ⏳ **NEXT** | |
| 11 | Document Management (S3 upload/download) | ⏳ Pending | |
| 12 | Testing & Optimization | ⏳ Pending | |
| 13 | Deployment & Launch | ⏳ Pending | |

**Overall: ~80% complete**

---

## Frontend Pages → Backend Connection Status

### ✅ Fully Connected to Real API (as of Feb 12-24, 2026)
- Homepage (categories + featured policies)
- Policy listing, policy details, compare
- Shop/Mall (browsing with filters)
- Purchase flow (`/purchase/[id]`)
- Payment flows — M-Pesa, Paystack, success page
- Customer dashboard (stats, activity, recommendations)
- My Policies (`/dashboard/my-policies`)
- Claims list (`/dashboard/claims`)
- New claim submission (`/dashboard/claims/new`)
- Documents page (`/dashboard/documents`)
- Payment history (`/dashboard/payments`)
- Admin → Users page

### ✅ Also Connected (Phase 9, Feb 24, 2026)
- `/admin/claims/page.tsx` — assignClaim, approveClaim, rejectClaim
- `/admin/transactions/page.tsx` — getAllTransactions, retryTransaction, exportReport
- `/admin/reports/page.tsx` — getSalesReport, getRevenueReport, getClaimsReport, getUserGrowthReport (lazy)
- `/admin/settings/page.tsx` — getSettings, updateSettings, getRoles
- `/admin/policies/page.tsx` — getAllPolicyTypes, createPolicyType, updatePolicyType, deletePolicyType, bulkUploadPolicyTypes, getAllInsuranceCompanies, createInsuranceCompany, updateInsuranceCompany
- `/dashboard/profile/page.tsx` — updateUserProfile, changePassword, enable2FA, disable2FA, requestAccountDeletion, BeneficiaryModal wired
- Notification bell in navbar — pollNotifications, getNotifications, markAllAsRead

### ⚠️ Still Using Mock Data
- `/dashboard/pending-payments/page.tsx` — Payment schedules (uses mock data)

---

## Known Issues & Outstanding Work

### Admin Pages (Priority)
- Most admin pages still use mock data — API functions exist in `admin.ts` but pages not connected
- Pattern to follow: see `admin/users/page.tsx` (commit `24d6c9e`) as reference for how to connect

### Payment Limitations
- Receipt PDF generation not implemented (uses JSON receipts only)
- Email receipts not sent automatically
- Payment endpoints rate-limited at 20/hour per user (✅ implemented Feb 24)
- Refund processing is manual (requires admin approval)

### Auth / Profile
- Email verification flow UI not implemented (backend has `email_verified_at` field)
- Phone OTP verification UI not implemented
- 2FA toggle exists in profile but not fully wired to backend
- Profile page tabs not connected to `profile.ts` API

### General
- Password reset requires SendGrid config (not yet set up)
- File uploads require AWS S3 credentials (not yet configured)
- No production backend deployed yet (local dev only)
- `backend/tests/` directory is empty — no tests written

---

## Payment Flows (Phase 6 — Complete)

### M-Pesa Flow
1. User selects M-Pesa → enters phone + amount
2. `POST /api/v1/payments/mpesa/initiate/` → STK Push sent to phone
3. Frontend polls `GET /api/v1/payments/mpesa/status/{id}/` every 5s
4. M-Pesa sends callback to `POST /api/v1/payments/mpesa/callback/`
5. On success → redirect to `/payment/success/[txId]`

### Paystack Flow
1. User selects card → `POST /api/v1/payments/paystack/initialize/` → get payment URL
2. Redirect to Paystack checkout page
3. On return → `GET /api/v1/payments/paystack/verify/{ref}/`
4. On success → redirect to `/payment/success/[txId]`

### Webhook URLs to Register
- M-Pesa callback: `https://yourdomain.com/api/v1/payments/mpesa/callback/`
- Paystack webhook: `https://yourdomain.com/api/v1/payments/paystack/webhook/`

---

## How to Run

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000 (or 3001 if port in use)
npm run build        # Production build check
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Configure DB credentials
python manage.py migrate
python manage.py populate_sample_data   # Seeds: admin user, 5 companies, 6 categories, 10 policy types
python manage.py runserver   # http://localhost:8000
```

Sample data credentials: `admin@bowman.co.ke` / `Admin123!`

### Docker (full stack)
```bash
cd backend
docker-compose up
```

### Environment Variables
- Frontend: `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- Backend: `backend/.env` → see `backend/.env.example` for all required vars (DB, Redis, M-Pesa, Paystack, SendGrid, S3, etc.)

---

## Key Conventions & Patterns

### Frontend
- **API calls:** Always through `frontend/src/lib/api/client.ts` (Axios with JWT interceptor)
- **Protected routes:** Wrap with `<ProtectedRoute>` — use `requireAdmin` prop for admin pages
- **Toast notifications:** Use `sonner` — `toast.success()` / `toast.error()`
- **Currency:** Always format as KES (Kenyan Shillings)
- **Forms:** React Hook Form + Zod validation
- **Loading states:** Always show loading spinner during async operations
- **Role checking:** Roles are `customer`, `staff`, `admin`, `assessor`

### Backend
- **IDs:** UUID primary keys throughout
- **API responses:** Paginated at 20 per page (default)
- **JWT:** Bearer token in `Authorization` header
- **Permissions:** Role-based — `IsAdmin` custom permission class for admin endpoints
- **Webhook endpoints:** CSRF-exempt

### Admin Panel Pattern (reference: `admin/users/page.tsx`)
```typescript
// 1. Import from admin.ts
import { getAllUsers, suspendUser } from '@/lib/api/admin'

// 2. Replace useState mock data with useEffect + API call
useEffect(() => { loadData() }, [])

const loadData = async () => {
  setIsLoading(true)
  try {
    const data = await getAllUsers()
    setUsers(data.results || data)
  } catch (error) {
    toast.error('Failed to load data')
  } finally {
    setIsLoading(false)
  }
}
```

---

## Next Priority (Remaining Admin Pages Integration)

Connect these admin pages to real API (all functions exist in `admin.ts`):

1. **`/admin/page.tsx`** → `getAdminDashboard()`
2. **`/admin/policies/page.tsx`** → `getAllPolicyTypes()`, `getAllInsuranceCompanies()`
3. **`/admin/transactions/page.tsx`** → `getAllTransactions()`, `getFailedTransactions()`
4. **`/admin/claims/page.tsx`** → `getAllClaims()`, `assignClaim()`, `approveClaim()`, `rejectClaim()`
5. **`/admin/reports/page.tsx`** → `getSalesReport()`, `getRevenueReport()`, `getClaimsReport()`, `getUserGrowthReport()`
6. **`/admin/settings/page.tsx`** → `getSettings()`, `updateSettings()`

---

## Document Index

| File | Purpose |
|------|---------|
| `CLAUDE.md` | **This file** — session continuity log |
| `README.md` | Project overview |
| `DEPLOYMENT_INSTRUCTIONS.md` | Step-by-step deployment guide |
| `VPS_COMPLETE_DEPLOYMENT_GUIDE.md` | Full VPS deployment guide |
| `QUICK_START.md` | Developer quick start |
| `FRONTEND_BACKEND_COMPLETE_AUDIT.md` | API audit (Feb 12, 2026) |
| `frontend/API_INTEGRATION_GUIDE.md` | API integration examples and patterns |
| `frontend/FRONTEND_PENDING_TASKS.md` | Outstanding frontend tasks (Feb 12, 2026) |
| `backend/API_ENDPOINTS_REFERENCE.md` | Complete API endpoint reference |
| `backend/RAILWAY_DEPLOYMENT.md` | Railway deployment config |

---

## Session Log

Update this section at the end of every Claude session to record what was done.

| Date | Work Done | Files Changed | Notes |
|------|-----------|---------------|-------|
| Jan 27, 2026 | Phases 1-7: Foundation through Customer Dashboard | All initial files | Payments backend+frontend complete |
| Jan 28, 2026 | Phase 8: Admin Panel (8 pages, 40 API functions) | admin/* pages, lib/api/admin.ts | All admin pages used mock data |
| Feb 12, 2026 | MVP integration: connected 12 pages to backend, created auth.ts, claims.ts, categories.ts, purchase.ts, notifications.ts | Multiple frontend pages and API files | Backend 100% verified. Admin pages still on mock data |
| Feb 12-16, 2026 | Dashboard/policies bug fixes, caching system, category rename Health→Medical | dashboard.ts, client.ts, cache/ | |
| Feb 24, 2026 | Admin users page → real API; asset management & purchase flow fixes | admin/users/page.tsx, purchase pages | Only admin users connected, rest still mock |
| Feb 24, 2026 | Code quality & security hardening (all 8 items): M-Pesa webhook secret verification, N+1 query fixes (dashboard + admin_api), payment rate limiting (20/hr), created errors.ts ApiError utility, fixed 65+ `error: any` → `unknown` across 20+ files, fixed icon map types, fixed `as any` casts, created ErrorBoundary component + applied to payment/purchase pages | backend/payments/mpesa.py, backend/payments/views.py, backend/dashboard/views.py, backend/admin_api/views.py, backend/settings/base.py, backend/.env.example, frontend/src/lib/api/errors.ts, frontend/src/components/shared/error-boundary.tsx, 20+ frontend pages | Build: 0 TS errors. Next: admin pages integration (Phase 9) |
| Feb 24, 2026 | Phase 9 complete — all admin pages + profile + notifications + deployment prep. A1(claims): removed mock data, wired assignClaim/approveClaim/rejectClaim. A2(transactions): full API integration, retry, CSV export. A3(reports): lazy tab loading, real stats cards, export buttons. A4(settings): getSettings/updateSettings/getRoles on mount. A5(policies): full CRUD dialogs for policy types + companies, bulk upload, user policies with approve/cancel. B1: fixed old_password field name (PasswordChangeInput in profile.ts). B2-B4: wired BeneficiaryModal (add/edit/set-primary), 2FA toggle calls enable2FA/disable2FA API, account deletion calls requestAccountDeletion. C: Notification bell — polling every 60s, dropdown with unread badge, marks all as read on open. D: Production Redis cache (django-redis), S3 presigned URLs for document download (with local dev fallback), Celery task stubs for email/SMS. Also added django-redis==5.4.0 to requirements.txt. Build: 0 TS errors. | frontend/src/app/admin/claims/page.tsx, admin/transactions/page.tsx, admin/reports/page.tsx, admin/settings/page.tsx, admin/policies/page.tsx, dashboard/profile/page.tsx, components/layout/navbar.tsx, lib/api/profile.ts, backend/apps/documents/views.py, backend/apps/notifications/tasks.py, backend/bowman_insurance/settings/production.py, backend/requirements.txt | Phase 9 complete. Next: Phase 10 (email/SMS triggers via SendGrid + Africa's Talking) |
| Feb 24, 2026 | Bug fixes: (1) Fixed instant logout after login — removed TEST_USERS bypass with fake tokens from auth-context.tsx, fixed token refresh URL /auth/refresh/ → /auth/token/refresh/ in client.ts. (2) Fixed admin dashboard crash — u.phone_number → u.phone. (3) Complete rewrite of admin_api/views.py: added ClaimsManagementViewSet, TransactionManagementViewSet, get_admin_policies, approve/cancel policy, user_growth report, export_report (CSV), admin_settings, get_roles; serialize helpers map field names (filed_date→submitted_at, amount_claimed→claim_amount, transaction_number→transaction_reference, submitted→pending). (4) Rewrote admin_api/urls.py to register all new ViewSets and routes. (5) Created frontend/.env.local. (6) Fixed frontend/.env.example URL to include /api/v1. | frontend/src/lib/auth/auth-context.tsx, frontend/src/lib/api/client.ts, backend/apps/admin_api/views.py, backend/apps/admin_api/urls.py, frontend/.env.example, frontend/.env.local | Commits: 2145117 (auth fix), fc2dce2 (admin API fix). Backend admin API now has all required endpoints. Next: test with live backend data |
| Feb 24, 2026 | Comprehensive cross-layer audit (backend models ↔ serializers ↔ frontend API services ↔ pages). Found and fixed: (1) admin.ts all URLs had /api/v1/admin/ prefix which Axios combineURLs doubled to /api/v1/api/v1/admin/ — fixed to relative admin/. (2) profile.ts all URLs had /users/ prefix — fixed to auth/. (3) beneficiaries.ts all URLs had /users/beneficiaries/ — fixed to auth/beneficiaries/. (4) auth.ts User type and RegisterInput had phone_number — fixed to phone (matches User model). (5) profile.ts NotificationPreferences type had invented field names (email_enabled, sms_enabled, push_enabled, etc.) — fixed to match actual NotificationPreference model (email_policy_updates, sms_policy_updates, etc.). (6) profile.ts changePassword was missing new_password2 — PasswordChangeSerializer requires it. (7) profile/page.tsx used profile.phone_number — fixed to profile.phone. (8) Profile page notification UI updated to use backend field names. (9) Backend: added 2FA stub endpoints (enable/disable/verify) and delete-account endpoint to users/views.py and urls.py. Build: 0 TS errors. | frontend/src/lib/api/admin.ts, profile.ts, beneficiaries.ts, auth.ts, frontend/src/app/dashboard/profile/page.tsx, backend/apps/users/views.py, backend/apps/users/urls.py | Commit 5bbfde5. All API URL paths now correct end-to-end |
| *(next session)* | *(fill in)* | *(fill in)* | *(fill in)* |
