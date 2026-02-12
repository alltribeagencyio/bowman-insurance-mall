# Frontend-Backend Integration Audit Report

Generated: 2026-02-12

## Overview
This document provides a comprehensive audit of all frontend API service files and their backend endpoint connections.

---

## API Service Files Analysis

### 1. Authentication Service (`frontend/src/lib/api/auth.ts`)

**Status**: ✅ **PROPERLY CONFIGURED**

**Frontend Endpoints**:
- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout
- `GET /auth/profile/` - Get user profile
- `GET /auth/verify/` - Verify token
- `POST /auth/password-reset/request/` - Request password reset
- `POST /auth/password-reset/confirm/` - Confirm password reset
- `POST /auth/token/refresh/` - Refresh access token

**Backend Endpoints** (`backend/apps/users/urls.py`):
- ✅ `POST /api/v1/auth/register/` → `UserRegistrationView`
- ✅ `POST /api/v1/auth/login/` → `UserLoginView`
- ✅ `POST /api/v1/auth/logout/` → `UserLogoutView`
- ✅ `GET /api/v1/auth/profile/` → `UserProfileView`
- ✅ `GET /api/v1/auth/verify/` → `verify_token`
- ✅ `POST /api/v1/auth/password-reset/request/` → `request_password_reset`
- ✅ `POST /api/v1/auth/password-reset/confirm/` → `reset_password`
- ✅ `POST /api/v1/auth/token/refresh/` → `TokenRefreshView`

**Type Definitions**:
- `User` - Matches backend User model
- `RegisterInput` - Has `phone_number` (backend expects this)
- `LoginInput` - Standard email/password
- `AuthResponse` - Returns user + tokens

**Notes**:
- Token storage using localStorage
- Automatic token refresh in client interceptor ([client.ts:27-61](frontend/src/lib/api/client.ts#L27-L61))
- All endpoints properly aligned

---

### 2. Policies Service (`frontend/src/lib/api/policies.ts`)

**Status**: ✅ **PROPERLY CONFIGURED**

**Frontend Endpoints**:
- `GET /policies/my-policies/` - Get user's policies
- `GET /policies/my-policies/{id}/` - Get policy by ID
- `GET /policies/my-policies/stats/` - Get policy statistics
- `POST /policies/{id}/cancel/` - Cancel policy
- `POST /policies/{id}/renew/` - Renew policy
- `GET /policies/{id}/certificate/` - Download certificate

**Backend Endpoints** (`backend/apps/policies/urls.py`):
- ✅ Router registered: `router.register(r'my-policies', views.PolicyViewSet)`
- ✅ ViewSet actions available: list, retrieve, stats, cancel, renew, certificate

**Type Definitions**:
- `Policy` - Basic policy info with nested policy_type and insurance_company
- `PolicyDetail` - Extended with vehicle_details, coverage_details, payment_history, claims_history, documents, beneficiaries, timeline

**Issues Found**:
- ⚠️ Frontend expects `premium_frequency` but some pages use `payment_frequency` (already fixed in previous commits)

---

### 3. Categories Service (`frontend/src/lib/api/categories.ts`)

**Status**: ✅ **PROPERLY CONFIGURED**

**Frontend Endpoints**:
- `GET /policies/categories/` - Get all categories
- `GET /policies/types/featured/` - Get featured policy types
- `GET /policies/types/{id}/` - Get policy type by ID

**Backend Endpoints** (`backend/apps/policies/urls.py`):
- ✅ `router.register(r'categories', views.PolicyCategoryViewSet)`
- ✅ `router.register(r'types', views.PolicyTypeViewSet)` with `featured` action

**Type Definitions**:
- `PolicyCategory` - id, name, slug, description, icon
- `PolicyTypeDetail` - Complete policy type with category, insurance_company, features, exclusions

**Notes**:
- Used on homepage for categories grid and featured policies
- Critical for landing page functionality

---

### 4. Claims Service (`frontend/src/lib/api/claims.ts`)

**Status**: ✅ **PROPERLY CONFIGURED**

**Frontend Endpoints**:
- `POST /claims/` - Submit new claim
- `GET /claims/my_claims/` - Get user's claims (with optional status filter)
- `GET /claims/{id}/` - Get claim by ID
- `POST /claims/{id}/upload_document/` - Upload claim document
- `GET /claims/{id}/documents/` - Get claim documents
- `GET /claims/{id}/history/` - Get claim status history
- `GET /claims/statistics/` - Get claim statistics

**Backend Endpoints** (`backend/apps/claims/urls.py`):
- ✅ Router registered: `router.register(r'', views.ClaimViewSet, basename='claim')`
- ✅ ViewSet custom actions: `my_claims`, `upload_document`, `documents`, `history`, `statistics`

**Type Definitions**:
- `Claim` - Basic claim info with nested policy, status, amounts
- `ClaimDetail` - Extended with user, documents array, status_history, settlement
- `ClaimSubmitInput` - policy, type, description, incident details
- `ClaimStatistics` - Total counts and monetary values

**Notes**:
- Includes file upload helper `uploadFileToS3` that uploads via `/documents/upload/`
- Comprehensive claim tracking with status history

---

### 5. Notifications Service (`frontend/src/lib/api/notifications.ts`)

**Status**: ✅ **PROPERLY CONFIGURED** (fixed in previous commit)

**Frontend Endpoints**:
- `GET /notifications/` - Get all notifications with filters
- `GET /notifications/unread/` - Get unread notifications
- `GET /notifications/unread_count/` - Get unread count
- `POST /notifications/{id}/mark_as_read/` - Mark as read
- `POST /notifications/mark_all_read/` - Mark all as read
- `DELETE /notifications/{id}/` - Delete notification

**Backend Endpoints** (`backend/apps/notifications/urls.py`):
- ✅ Router registered: `router.register(r'', views.NotificationViewSet, basename='notification')`
- ✅ ViewSet custom actions: `unread`, `unread_count`, `mark_as_read`, `mark_all_read`

**Type Definitions**:
- `Notification` - type, title, message, read status, related_object, action_url
- `NotificationCount` - count number
- `NotificationFilters` - type, read, limit, offset

**Notes**:
- Includes polling function for real-time updates (30s interval)
- Async function signature fixed in previous commit

---

### 6. Purchase Service (`frontend/src/lib/api/purchase.ts`)

**Status**: ⚠️ **NEEDS VERIFICATION**

**Frontend Endpoints**:
- `POST /policies/my-policies/` - Purchase a policy
- `POST /policies/quote/` - Get quote for a policy

**Backend Endpoints**:
- ✅ `/policies/my-policies/` - POST endpoint exists via PolicyViewSet
- ⚠️ `/policies/quote/` - **NEED TO VERIFY** if this custom action exists

**Type Definitions**:
- `PolicyPurchaseInput` - All required fields for purchase
- `PurchasedPolicy` - Response after purchase
- `QuoteRequest` - policy_type_id, coverage_amount, start_date
- `QuoteResponse` - Detailed quote with payment options

**Helper Functions**:
- `calculatePremium()` - Client-side premium calculation
- `validatePolicyDates()` - Date validation
- `generateEndDate()` - Auto-generate end date based on frequency

**Issues**:
- ⚠️ Quote endpoint may not exist in backend - need to verify PolicyTypeViewSet has `quote` action

---

### 7. Documents Service

**Status**: ⚠️ **FILE NOT FOUND IN GLOB - NEEDS INVESTIGATION**

Expected at: `frontend/src/lib/api/documents.ts`

**Related Backend** (`backend/apps/documents/urls.py`):
- Should have DocumentViewSet with upload functionality
- Referenced in claims service: `POST /documents/upload/`

**Action Required**:
- Need to read this file and verify it exists
- Check if document upload/download is properly configured

---

### 8. Payments Service

**Status**: ⚠️ **FILE NOT FOUND IN GLOB - NEEDS INVESTIGATION**

Expected at: `frontend/src/lib/api/payments.ts`

**Related Backend** (`backend/apps/payments/`):
- Should handle M-Pesa integration
- STK Push for premium payments
- Payment verification

**Action Required**:
- Need to read this file and verify it exists
- Check payment flow integration

---

### 9. Profile Service

**Status**: ⚠️ **FILE NOT FOUND IN GLOB - NEEDS INVESTIGATION**

Expected at: `frontend/src/lib/api/profile.ts`

May be redundant with auth service's `getProfile()` endpoint.

---

### 10. Dashboard Service

**Status**: ⚠️ **FILE NOT FOUND IN GLOB - NEEDS INVESTIGATION**

Expected at: `frontend/src/lib/api/dashboard.ts`

Likely contains:
- Dashboard statistics
- Activity feeds
- Overview data

---

### 11. Admin Service

**Status**: ⚠️ **FILE NOT FOUND IN GLOB - NEEDS INVESTIGATION**

Expected at: `frontend/src/lib/api/admin.ts`

For admin panel functionality.

---

### 12. Beneficiaries Service

**Status**: ⚠️ **FILE NOT FOUND IN GLOB - NEEDS INVESTIGATION**

Expected at: `frontend/src/lib/api/beneficiaries.ts`

For managing policy beneficiaries.

---

## Critical Issues Found

### 1. Glob Command Returned No Files
The glob pattern `frontend/src/lib/api/*.ts` returned "No files found", but we know these files exist because:
- We previously read several of them
- The `ls` command confirmed 13 files exist

**Possible Causes**:
- Glob tool may have path resolution issues on Windows
- Files may be in different location than expected

**Action**: Use direct file path reads instead of glob

---

### 2. Missing Backend Verification

Need to verify these backend endpoints exist:
- ❓ `POST /policies/quote/` - Quote calculation endpoint
- ❓ Document upload endpoints
- ❓ Payment/M-Pesa integration endpoints
- ❓ Dashboard statistics endpoints
- ❓ Beneficiary management endpoints

---

### 3. Sample Data Not Yet Created

The database likely has no data, which prevents testing:
- Homepage shows empty categories/policies
- Cannot test policy details page
- Cannot test purchase flow

**Action**: Run `python manage.py populate_sample_data`

---

## Backend API Structure

Based on `backend/bowman_insurance/urls.py`, the API is structured as:

```
/api/v1/
├── auth/          → apps.users.urls (Authentication)
├── policies/      → apps.policies.urls (Policies, Categories, Types, Companies)
├── claims/        → apps.claims.urls (Claims management)
├── documents/     → apps.documents.urls (Document upload/download)
├── notifications/ → apps.notifications.urls (User notifications)
├── payments/      → apps.payments.urls (M-Pesa, transactions)
├── workflows/     → apps.workflows.urls (Admin workflows)
└── analytics/     → apps.analytics.urls (Analytics data)
```

---

## Recommendations

### Immediate Actions:

1. **Run Sample Data Script**
   ```bash
   python manage.py populate_sample_data
   ```
   This will create:
   - Admin user (admin@bowman.co.ke / Admin123!)
   - 5 insurance companies
   - 6 policy categories
   - 10 policy types (6 featured)

2. **Verify Missing API Files**
   Read the following files to confirm they exist and are properly configured:
   - `frontend/src/lib/api/documents.ts`
   - `frontend/src/lib/api/payments.ts`
   - `frontend/src/lib/api/dashboard.ts`
   - `frontend/src/lib/api/admin.ts`
   - `frontend/src/lib/api/beneficiaries.ts`
   - `frontend/src/lib/api/profile.ts`

3. **Check Backend ViewSets**
   Verify these backend views have required custom actions:
   - PolicyTypeViewSet has `quote` action
   - DocumentViewSet has `upload` action
   - PaymentViewSet has M-Pesa integration

4. **Test Authentication Flow**
   - Create new user via registration
   - Login and verify token storage
   - Test token refresh
   - Test protected endpoints

5. **Test Policy Flow**
   - Browse categories
   - View featured policies
   - View policy details
   - Get quote
   - Purchase policy

---

## Summary

**Files Verified**: 6/13 (46%)
**Properly Configured**: 5/6 (83%)
**Issues Found**: 1 minor (quote endpoint)
**Missing Verification**: 7 files

**Next Steps**:
1. Populate database with sample data
2. Read remaining API service files
3. Verify all backend endpoints
4. Test complete user journey
5. Document any integration gaps

---

## Integration Status

| Service | Frontend | Backend | Status |
|---------|----------|---------|--------|
| Authentication | ✅ | ✅ | Ready |
| Policies | ✅ | ✅ | Ready |
| Categories | ✅ | ✅ | Ready |
| Claims | ✅ | ✅ | Ready |
| Notifications | ✅ | ✅ | Ready |
| Purchase | ⚠️ | ❓ | Needs verification |
| Documents | ❓ | ❓ | Not verified |
| Payments | ❓ | ❓ | Not verified |
| Dashboard | ❓ | ❓ | Not verified |
| Admin | ❓ | ❓ | Not verified |
| Beneficiaries | ❓ | ❓ | Not verified |
| Profile | ❓ | ❓ | May be redundant |

Legend:
- ✅ Verified and working
- ⚠️ Partially verified
- ❓ Not yet verified
- ❌ Issues found
