# Bowman Insurance Backend - MVP Ready for Deployment

## ✅ COMPLETED IMPLEMENTATION

All critical backend APIs have been fully implemented and are ready for deployment:

### 1. **Policies API** ✅
**Location:** `apps/policies/`
- ✅ Complete CRUD for policies
- ✅ Policy types browsing/filtering
- ✅ Insurance companies management
- ✅ Policy categories
- ✅ Policy renewal
- ✅ Policy cancellation
- ✅ Policy reviews
- ✅ Featured policies endpoint

**Endpoints:**
```
GET    /api/v1/policies/                    # List user policies
POST   /api/v1/policies/                    # Purchase policy
GET    /api/v1/policies/:id/                # Get policy details
PUT    /api/v1/policies/:id/                # Update policy
DELETE /api/v1/policies/:id/                # Cancel policy
GET    /api/v1/policies/my_policies/        # User's policies
GET    /api/v1/policies/active/             # Active policies
GET    /api/v1/policies/expiring_soon/      # Expiring soon
POST   /api/v1/policies/:id/renew/          # Renew policy
POST   /api/v1/policies/:id/cancel/         # Cancel policy
POST   /api/v1/policies/:id/activate/       # Activate (admin)
GET    /api/v1/policies/statistics/         # User statistics

GET    /api/v1/policies/companies/          # List insurance companies
GET    /api/v1/policies/categories/         # List categories
GET    /api/v1/policies/types/              # Browse policy types
GET    /api/v1/policies/types/featured/     # Featured policies
GET    /api/v1/policies/reviews/            # Policy reviews
POST   /api/v1/policies/reviews/            # Submit review
```

### 2. **Claims API** ✅
**Location:** `apps/claims/`
- ✅ Claim submission
- ✅ Claim status management
- ✅ Document upload for claims
- ✅ Claim assignment to assessors
- ✅ Claim approval/rejection
- ✅ Claim settlement
- ✅ Status history tracking

**Endpoints:**
```
GET    /api/v1/claims/                      # List claims
POST   /api/v1/claims/                      # Submit claim
GET    /api/v1/claims/:id/                  # Claim details
PUT    /api/v1/claims/:id/                  # Update claim (admin)
GET    /api/v1/claims/my_claims/            # User's claims
GET    /api/v1/claims/pending/              # Pending (admin)
POST   /api/v1/claims/:id/assign/           # Assign assessor (admin)
POST   /api/v1/claims/:id/approve/          # Approve claim (admin)
POST   /api/v1/claims/:id/reject/           # Reject claim (admin)
POST   /api/v1/claims/:id/settle/           # Settle claim (admin)
POST   /api/v1/claims/:id/upload_document/  # Upload document
GET    /api/v1/claims/:id/documents/        # Get documents
GET    /api/v1/claims/:id/history/          # Status history
GET    /api/v1/claims/statistics/           # Statistics
```

### 3. **Documents API** ✅
**Location:** `apps/documents/`
- ✅ Document upload
- ✅ Document download
- ✅ Document verification (admin)
- ✅ Filter by policy

**Endpoints:**
```
GET    /api/v1/documents/                   # List documents
POST   /api/v1/documents/                   # Upload document
GET    /api/v1/documents/:id/               # Document details
DELETE /api/v1/documents/:id/               # Delete document
POST   /api/v1/documents/:id/verify/        # Verify (admin)
GET    /api/v1/documents/:id/download/      # Download
GET    /api/v1/documents/by_policy/         # Filter by policy
```

### 4. **Notifications API** ✅
**Location:** `apps/notifications/`
- ✅ List notifications
- ✅ Unread count
- ✅ Mark as read
- ✅ Mark all as read
- ✅ Delete notifications

**Endpoints:**
```
GET    /api/v1/notifications/               # List notifications
GET    /api/v1/notifications/unread/        # Unread only
GET    /api/v1/notifications/unread_count/  # Unread count
POST   /api/v1/notifications/:id/mark_as_read/ # Mark as read
POST   /api/v1/notifications/mark_all_read/ # Mark all read
DELETE /api/v1/notifications/:id/           # Delete
```

### 5. **Analytics API** ✅
**Location:** `apps/analytics/`
- ✅ Dashboard statistics
- ✅ Revenue analytics
- ✅ Claims analytics
- ✅ User growth analytics
- ✅ Policy analytics

**Endpoints:**
```
GET    /api/v1/analytics/dashboard/         # Dashboard stats (admin)
GET    /api/v1/analytics/revenue/           # Revenue data (admin)
GET    /api/v1/analytics/claims/            # Claims data (admin)
GET    /api/v1/analytics/users/             # User growth (admin)
GET    /api/v1/analytics/policies/          # Policy data (admin)
```

### 6. **Users/Authentication API** ✅
**Location:** `apps/users/`
- ✅ User registration
- ✅ Login (JWT)
- ✅ Profile management
- ✅ Password change
- ✅ **Password reset (NOW COMPLETE)**
- ✅ Notification preferences

**Endpoints:**
```
POST   /api/v1/auth/register/               # Register user
POST   /api/v1/auth/login/                  # Login
POST   /api/v1/auth/logout/                 # Logout
GET    /api/v1/auth/profile/                # Get profile
PUT    /api/v1/auth/profile/                # Update profile
POST   /api/v1/auth/change-password/        # Change password
POST   /api/v1/auth/password-reset/request/ # Request reset
POST   /api/v1/auth/password-reset/confirm/ # Confirm reset
GET    /api/v1/auth/verify/                 # Verify token
POST   /api/v1/auth/token/refresh/          # Refresh token
```

### 7. **Payments API** ✅
**Location:** `apps/payments/`
- ✅ M-Pesa integration
- ✅ Paystack integration
- ✅ Transaction management
- ✅ Payment verification
- ✅ Refunds
- ✅ Payment schedules

## 📋 VPS DEPLOYMENT STEPS

### Prerequisites on VPS:
1. Ubuntu 20.04+ or similar Linux distribution
2. Python 3.11+
3. PostgreSQL 15+
4. Redis 7+
5. Nginx
6. Supervisor (for process management)

### Step 1: Install System Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.11 python3.11-venv python3.11-dev -y
sudo apt install postgresql postgresql-contrib -y
sudo apt install redis-server -y
sudo apt install nginx -y
sudo apt install supervisor -y
sudo apt install git -y
sudo apt install build-essential libpq-dev -y
```

### Step 2: Setup PostgreSQL Database
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE bowman_insurance;
CREATE USER bowman_user WITH PASSWORD 'your_secure_password';
ALTER ROLE bowman_user SET client_encoding TO 'utf8';
ALTER ROLE bowman_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE bowman_user SET timezone TO 'Africa/Nairobi';
GRANT ALL PRIVILEGES ON DATABASE bowman_insurance TO bowman_user;
\q
```

### Step 3: Clone and Setup Backend
```bash
# Navigate to web directory
cd /var/www/

# Clone repository (or upload files)
git clone <your-repo-url> bowman
cd bowman/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
```bash
# Create .env file
nano .env
```

Paste this configuration (update values):
```env
# Django Settings
SECRET_KEY=your-very-secure-secret-key-change-this
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-vps-ip
DJANGO_SETTINGS_MODULE=bowman_insurance.settings.production

# Database
DATABASE_URL=postgresql://bowman_user:your_secure_password@localhost:5432/bowman_insurance

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1

# CORS
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# M-Pesa (Safaricom)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/v1/payments/mpesa/callback/
MPESA_ENVIRONMENT=production  # or sandbox for testing

# Paystack
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_CALLBACK_URL=https://your-domain.com/api/v1/payments/paystack/callback/

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
DEFAULT_FROM_EMAIL=noreply@your-domain.com

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=bowman-insurance-files
AWS_S3_REGION_NAME=us-east-1

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Step 5: Run Migrations
```bash
# Activate virtual environment
source venv/bin/activate

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --no-input

# Load initial data (if you have fixtures)
# python manage.py loaddata initial_data.json
```

### Step 6: Setup Gunicorn
```bash
# Create gunicorn config
nano /var/www/bowman/backend/gunicorn_config.py
```

Paste:
```python
bind = "127.0.0.1:8000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5
errorlog = "/var/log/gunicorn/error.log"
accesslog = "/var/log/gunicorn/access.log"
loglevel = "info"
```

```bash
# Create log directory
sudo mkdir -p /var/log/gunicorn
sudo chown -R www-data:www-data /var/log/gunicorn
```

### Step 7: Setup Supervisor
```bash
# Create supervisor config
sudo nano /etc/supervisor/conf.d/bowman.conf
```

Paste:
```ini
[program:bowman-gunicorn]
directory=/var/www/bowman/backend
command=/var/www/bowman/backend/venv/bin/gunicorn bowman_insurance.wsgi:application -c gunicorn_config.py
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/gunicorn/out.log
stderr_logfile=/var/log/gunicorn/error.log

[program:bowman-celery]
directory=/var/www/bowman/backend
command=/var/www/bowman/backend/venv/bin/celery -A bowman_insurance worker -l info
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/celery/worker.log
stderr_logfile=/var/log/celery/worker_error.log
```

```bash
# Create celery log directory
sudo mkdir -p /var/log/celery
sudo chown -R www-data:www-data /var/log/celery

# Update supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

### Step 8: Setup Nginx
```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/bowman
```

Paste:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 20M;

    location /static/ {
        alias /var/www/bowman/backend/static/;
    }

    location /media/ {
        alias /var/www/bowman/backend/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bowman /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 9: Setup SSL with Let's Encrypt
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
```

### Step 10: Final Checks
```bash
# Check supervisor status
sudo supervisorctl status

# Check nginx status
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql

# Check Redis
sudo systemctl status redis-server

# Check logs
sudo tail -f /var/log/gunicorn/error.log
```

## 🧪 TESTING THE API

Once deployed, test these critical endpoints:

```bash
# Health check
curl https://your-domain.com/api/v1/auth/login/

# Register user
curl -X POST https://your-domain.com/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User",
    "phone_number": "+254712345678"
  }'

# Login
curl -X POST https://your-domain.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Get policy types (public)
curl https://your-domain.com/api/v1/policies/types/

# Get categories
curl https://your-domain.com/api/v1/policies/categories/
```

## 📊 DATABASE SEEDING

To populate with sample data:

```bash
# Activate venv
source /var/www/bowman/backend/venv/bin/activate

# Create sample data script
python manage.py shell

# In shell:
from apps.policies.models import InsuranceCompany, PolicyCategory, PolicyType
from decimal import Decimal

# Create insurance companies
jubilee = InsuranceCompany.objects.create(
    name="Jubilee Insurance",
    rating=Decimal('4.5'),
    contact_email="info@jubilee.co.ke",
    contact_phone="+254709123456"
)

# Create categories
motor = PolicyCategory.objects.create(
    name="Motor Insurance",
    slug="motor",
    description="Vehicle insurance coverage",
    icon="Car",
    display_order=1
)

# Create policy types
PolicyType.objects.create(
    category=motor,
    insurance_company=jubilee,
    name="Comprehensive Motor Cover",
    description="Full vehicle protection",
    base_premium=Decimal('15000'),
    min_coverage_amount=Decimal('500000'),
    max_coverage_amount=Decimal('10000000'),
    features=["Accident cover", "Theft protection", "Third party"],
    exclusions=["Wear and tear", "Racing"],
    is_featured=True
)
```

## ✅ DEPLOYMENT CHECKLIST

- [ ] Python 3.11+ installed
- [ ] PostgreSQL database created and configured
- [ ] Redis installed and running
- [ ] Environment variables configured
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Migrations run (`python manage.py migrate`)
- [ ] Superuser created
- [ ] Static files collected
- [ ] Gunicorn configured and running
- [ ] Celery configured and running (for background tasks)
- [ ] Nginx configured and running
- [ ] SSL certificate installed
- [ ] Firewall configured (allow ports 80, 443)
- [ ] Domain DNS pointed to VPS IP
- [ ] M-Pesa credentials configured
- [ ] Paystack credentials configured
- [ ] Sample data seeded
- [ ] API endpoints tested

## 🚀 YOU'RE READY!

Your Bowman Insurance backend MVP is **100% complete** and ready for deployment. All critical APIs that the frontend depends on are fully implemented and functional.

Next step: Deploy frontend and integrate with this backend API.
