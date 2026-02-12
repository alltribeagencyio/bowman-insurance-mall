# Bowman Insurance API Endpoints Reference

Base URL: `https://your-domain.com/api/v1/`

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register/
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+254712345678"
}

Response: 201 Created
{
  "user": {...},
  "tokens": {
    "refresh": "...",
    "access": "..."
  }
}
```

### Login
```
POST /auth/login/
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "user": {...},
  "tokens": {
    "refresh": "...",
    "access": "..."
  }
}
```

### Password Reset Request
```
POST /auth/password-reset/request/
Content-Type: application/json

Body:
{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "Password reset link generated",
  "uid": "...",
  "token": "..."
}
```

### Password Reset Confirm
```
POST /auth/password-reset/confirm/
Content-Type: application/json

Body:
{
  "uid": "...",
  "token": "...",
  "new_password": "NewSecurePass123!"
}

Response: 200 OK
{
  "message": "Password reset successfully"
}
```

---

## 🏢 Policy Endpoints

### Browse Policy Types (Public)
```
GET /policies/types/
GET /policies/types/?category=motor
GET /policies/types/?featured=true
GET /policies/types/?min_price=5000&max_price=20000

Response: 200 OK
[
  {
    "id": "...",
    "name": "Comprehensive Motor Cover",
    "category_name": "Motor Insurance",
    "company_name": "Jubilee Insurance",
    "base_premium": "15000.00",
    "features": [...],
    ...
  }
]
```

### Get Policy Categories
```
GET /policies/categories/

Response: 200 OK
[
  {
    "id": "...",
    "name": "Motor Insurance",
    "slug": "motor",
    "icon": "Car",
    "policy_count": 15
  }
]
```

### Purchase Policy
```
POST /policies/my-policies/
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "policy_type": "policy-type-uuid",
  "insurance_company": "company-uuid",
  "start_date": "2026-03-01",
  "end_date": "2027-02-28",
  "premium_amount": "15000.00",
  "coverage_amount": "2000000.00",
  "payment_frequency": "monthly",
  "policy_data": {
    "vehicle_make": "Toyota",
    "vehicle_model": "Land Cruiser",
    "registration": "KCE 123A"
  },
  "beneficiaries": []
}

Response: 201 Created
{
  "id": "...",
  "policy_number": "POL-2026-123456",
  "status": "pending",
  ...
}
```

### Get My Policies
```
GET /policies/my-policies/
GET /policies/my-policies/?status=active
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "policy_number": "POL-2026-123456",
    "status": "active",
    "days_to_expiry": 320,
    ...
  }
]
```

### Renew Policy
```
POST /policies/my-policies/{id}/renew/
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "start_date": "2027-03-01",
  "end_date": "2028-02-29",
  "premium_amount": "16000.00"  // optional
}

Response: 201 Created
{
  "id": "new-policy-uuid",
  "policy_number": "POL-2027-654321",
  ...
}
```

---

## 📋 Claims Endpoints

### Submit Claim
```
POST /claims/
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "policy": "policy-uuid",
  "type": "accident",
  "description": "Rear-end collision on Thika Road",
  "incident_date": "2026-02-10",
  "incident_location": "Thika Road, Nairobi",
  "amount_claimed": "450000.00"
}

Response: 201 Created
{
  "id": "...",
  "claim_number": "CLM-2026-123456",
  "status": "submitted",
  ...
}
```

### Get My Claims
```
GET /claims/my_claims/
GET /claims/my_claims/?status=approved
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "claim_number": "CLM-2026-123456",
    "status": "submitted",
    "amount_claimed": "450000.00",
    ...
  }
]
```

### Upload Claim Document
```
POST /claims/{id}/upload_document/
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "document_type": "photos",
  "title": "Accident Scene Photos",
  "file_url": "https://s3.../photo.jpg",
  "file_size": 245600,
  "mime_type": "image/jpeg"
}

Response: 201 Created
```

### Approve Claim (Admin)
```
POST /claims/{id}/approve/
Authorization: Bearer {admin_access_token}
Content-Type: application/json

Body:
{
  "amount_approved": "400000.00",
  "notes": "Approved after assessment"
}

Response: 200 OK
{
  "message": "Claim approved successfully"
}
```

---

## 📄 Document Endpoints

### Upload Document
```
POST /documents/
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "policy": "policy-uuid",  // optional
  "type": "logbook",
  "title": "Vehicle Logbook",
  "filename": "logbook.pdf",
  "s3_key": "documents/user-id/logbook-123.pdf",
  "file_size": 189000,
  "mime_type": "application/pdf"
}

Response: 201 Created
```

### Get My Documents
```
GET /documents/
GET /documents/?policy_id=policy-uuid
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "type": "logbook",
    "title": "Vehicle Logbook",
    "is_verified": true,
    "file_url": "/api/v1/documents/.../download/",
    ...
  }
]
```

---

## 🔔 Notification Endpoints

### Get Notifications
```
GET /notifications/
GET /notifications/unread/
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "...",
    "type": "claim_approved",
    "title": "Claim Approved",
    "message": "Your claim CLM-2026-123456 has been approved",
    "read": false,
    "created_at": "2026-02-12T10:30:00Z"
  }
]
```

### Get Unread Count
```
GET /notifications/unread_count/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "count": 5
}
```

### Mark as Read
```
POST /notifications/{id}/mark_as_read/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "message": "Notification marked as read"
}
```

---

## 💳 Payment Endpoints

### Initiate M-Pesa Payment
```
POST /payments/mpesa/initiate/
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "policy": "policy-uuid",
  "amount": "15000.00",
  "phone_number": "+254712345678"
}

Response: 200 OK
{
  "transaction_id": "...",
  "checkout_request_id": "...",
  "message": "Payment initiated. Check your phone for M-Pesa prompt"
}
```

### Initialize Paystack Payment
```
POST /payments/paystack/initialize/
Authorization: Bearer {access_token}
Content-Type: application/json

Body:
{
  "policy": "policy-uuid",
  "amount": "15000.00"
}

Response: 200 OK
{
  "transaction_id": "...",
  "authorization_url": "https://checkout.paystack.com/...",
  "reference": "..."
}
```

---

## 📊 Analytics Endpoints (Admin Only)

### Dashboard Statistics
```
GET /analytics/dashboard/
Authorization: Bearer {admin_access_token}

Response: 200 OK
{
  "users": {
    "total": 1250,
    "new_this_month": 85
  },
  "policies": {
    "total": 3420,
    "active": 2890,
    "pending": 45,
    "new_this_month": 125
  },
  "claims": {
    "total": 456,
    "pending": 23,
    "approved": 120,
    "settled": 310
  },
  "revenue": {
    "total": 45678900.00,
    "this_month": 3450000.00,
    "total_claims_paid": 12340000.00
  }
}
```

### Revenue Analytics
```
GET /analytics/revenue/
Authorization: Bearer {admin_access_token}

Response: 200 OK
{
  "months": [
    {
      "month": "Feb 2025",
      "revenue": 2500000.00
    },
    ...
  ]
}
```

---

## 🔑 Authentication Headers

All authenticated endpoints require:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## 🚫 Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "field_name": ["Error details"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Notes

1. **Date Format:** All dates in `YYYY-MM-DD` format
2. **Decimal Fields:** All amounts as strings with 2 decimal places
3. **UUIDs:** All IDs are UUIDs (36 characters)
4. **Pagination:** Use `?page=1&page_size=10` for paginated endpoints
5. **Filtering:** Use query parameters for filtering (e.g., `?status=active`)
6. **Ordering:** Use `?ordering=-created_at` for sorting

---

For complete API documentation, visit: `https://your-domain.com/api/docs/`
