# 🚀 Bowman Insurance - Server Deployment Instructions

**Commit**: `6802864` - Complete backend API implementation
**Status**: ✅ Ready for Production Deployment
**Date**: 2026-02-12

---

## ✅ What Was Pushed to GitHub

All backend features are now complete and pushed to: `https://github.com/alltribeagencyio/bowman-insurance-mall.git`

### New Features (3,208 lines added)
- ✅ Dashboard API (6 endpoints)
- ✅ Admin API (9 endpoints)
- ✅ Beneficiaries Management (6 endpoints + model)
- ✅ Quote Generation (1 endpoint)
- ✅ Sample Data Population Script
- ✅ Complete Documentation

---

## 📋 Pre-Deployment Checklist

Before deploying to your server, ensure you have:

- [ ] Server with Python 3.10+ installed
- [ ] PostgreSQL database created
- [ ] Redis installed (for Celery/caching)
- [ ] Domain name configured
- [ ] SSL certificate ready
- [ ] M-Pesa API credentials (for payments)
- [ ] AWS S3 bucket (for file storage)
- [ ] Email SMTP credentials

---

## 🔧 Server Setup (Step-by-Step)

### Step 1: Pull Latest Code

```bash
# SSH into your server
ssh user@your-server-ip

# Navigate to deployment directory
cd /var/www/

# Clone repository (or pull if exists)
git clone https://github.com/alltribeagencyio/bowman-insurance-mall.git
cd bowman-insurance-mall

# OR if already cloned
git pull origin master
```

---

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install production server
pip install gunicorn
```

---

### Step 3: Environment Variables

Create `.env` file in `backend/` directory:

```bash
nano .env
```

Add these variables:

```env
# Django Settings
SECRET_KEY=your-super-secret-key-here-change-this
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your-server-ip

# Database (PostgreSQL)
DATABASE_URL=postgresql://db_user:db_password@localhost:5432/bowman_insurance

# Security
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# M-Pesa Daraja API
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback/
MPESA_ENVIRONMENT=production  # or 'sandbox' for testing

# Paystack (Card Payments)
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key

# AWS S3 (File Storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=bowman-insurance-files
AWS_S3_REGION_NAME=us-east-1
USE_S3=True

# Email Settings (Gmail example)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=notifications@yourdomain.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=Bowman Insurance <notifications@yourdomain.com>

# Celery (Background Tasks)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Admin
ADMIN_URL=secure-admin-path  # Change from 'admin' for security
```

**Important**: Generate a new SECRET_KEY:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

### Step 4: Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE bowman_insurance;
CREATE USER bowman_user WITH PASSWORD 'secure_password';
ALTER ROLE bowman_user SET client_encoding TO 'utf8';
ALTER ROLE bowman_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE bowman_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bowman_insurance TO bowman_user;
\q

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Email: admin@bowman.co.ke
# Password: [create secure password]

# Populate sample data
python manage.py populate_sample_data

# Collect static files
python manage.py collectstatic --noinput
```

---

### Step 5: Test Backend

```bash
# Test server runs
python manage.py runserver 0.0.0.0:8000

# Test in browser
curl http://your-server-ip:8000/api/v1/policies/categories/
```

Should return JSON with categories.

---

### Step 6: Setup Gunicorn

Create systemd service file:

```bash
sudo nano /etc/systemd/system/bowman-backend.service
```

Add:

```ini
[Unit]
Description=Bowman Insurance Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/bowman-insurance-mall/backend
Environment="PATH=/var/www/bowman-insurance-mall/backend/venv/bin"
ExecStart=/var/www/bowman-insurance-mall/backend/venv/bin/gunicorn \
    --workers 4 \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile /var/log/bowman/access.log \
    --error-logfile /var/log/bowman/error.log \
    bowman_insurance.wsgi:application

[Install]
WantedBy=multi-user.target
```

Create log directory:
```bash
sudo mkdir -p /var/log/bowman
sudo chown www-data:www-data /var/log/bowman
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl start bowman-backend
sudo systemctl enable bowman-backend
sudo systemctl status bowman-backend
```

---

### Step 7: Setup Celery Workers

Create Celery service:

```bash
sudo nano /etc/systemd/system/bowman-celery.service
```

Add:

```ini
[Unit]
Description=Bowman Insurance Celery Worker
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/bowman-insurance-mall/backend
Environment="PATH=/var/www/bowman-insurance-mall/backend/venv/bin"
ExecStart=/var/www/bowman-insurance-mall/backend/venv/bin/celery -A bowman_insurance worker -l info

[Install]
WantedBy=multi-user.target
```

Start Celery:
```bash
sudo systemctl daemon-reload
sudo systemctl start bowman-celery
sudo systemctl enable bowman-celery
```

---

### Step 8: Setup Nginx

```bash
sudo nano /etc/nginx/sites-available/bowman
```

Add:

```nginx
upstream backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 100M;

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static/ {
        alias /var/www/bowman-insurance-mall/backend/staticfiles/;
        expires 30d;
    }

    # Media files
    location /media/ {
        alias /var/www/bowman-insurance-mall/backend/media/;
        expires 30d;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/bowman /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 9: Frontend Deployment

```bash
cd /var/www/bowman-insurance-mall/frontend

# Install dependencies
npm install

# Create .env.local
nano .env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
```

Build and run:

```bash
# Build for production
npm run build

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start npm --name "bowman-frontend" -- start
pm2 save
pm2 startup
```

---

### Step 10: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow prompts to complete SSL setup.

---

## 🧪 Post-Deployment Testing

### 1. Test API Endpoints

```bash
# Categories
curl https://yourdomain.com/api/v1/policies/categories/

# Featured policies
curl https://yourdomain.com/api/v1/policies/types/featured/

# Login
curl -X POST https://yourdomain.com/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bowman.co.ke","password":"your_password"}'

# Dashboard (with token)
curl https://yourdomain.com/api/v1/dashboard/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Test Frontend

Visit: `https://yourdomain.com`

**Check**:
- [ ] Homepage loads with categories and featured policies
- [ ] Login works
- [ ] Dashboard displays statistics
- [ ] Policy details page loads
- [ ] Quote generation works
- [ ] Beneficiaries can be added
- [ ] Admin panel accessible

---

### 3. Test M-Pesa Integration

1. Try purchasing a policy
2. Select M-Pesa payment
3. Check STK push is sent to phone
4. Verify payment callback received
5. Check transaction recorded

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Backend logs
sudo journalctl -u bowman-backend -f

# Celery logs
sudo journalctl -u bowman-celery -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
sudo tail -f /var/log/bowman/access.log
sudo tail -f /var/log/bowman/error.log
```

---

### Health Checks

```bash
# Backend health
curl https://yourdomain.com/api/v1/policies/categories/

# Database
sudo -u postgres psql bowman_insurance -c "SELECT COUNT(*) FROM policies_policytype;"

# Redis
redis-cli ping

# PM2 status
pm2 status
```

---

## 🔄 Updating Production

When you push new changes:

```bash
# Pull latest code
cd /var/www/bowman-insurance-mall
git pull origin master

# Backend updates
cd backend
source venv/bin/activate
pip install -r requirements.txt  # If dependencies changed
python manage.py migrate  # If models changed
python manage.py collectstatic --noinput
sudo systemctl restart bowman-backend

# Frontend updates
cd ../frontend
npm install  # If dependencies changed
npm run build
pm2 restart bowman-frontend
```

---

## 🔐 Security Checklist

- [ ] DEBUG=False in production
- [ ] Strong SECRET_KEY generated
- [ ] ALLOWED_HOSTS configured correctly
- [ ] CSRF_TRUSTED_ORIGINS set
- [ ] CORS_ALLOWED_ORIGINS set
- [ ] SSL certificate installed
- [ ] Database password is strong
- [ ] Admin URL changed from default
- [ ] Firewall configured (UFW or iptables)
- [ ] Only ports 80, 443, 22 open
- [ ] Regular backups configured
- [ ] Sentry or error tracking setup

---

## 📞 Important URLs

**Production**:
- Frontend: https://yourdomain.com
- API: https://yourdomain.com/api/v1/
- Admin: https://yourdomain.com/admin/
- API Docs: https://yourdomain.com/api/docs/

**Credentials**:
- Admin: admin@bowman.co.ke / [your password]
- Database: bowman_user / [your db password]

---

## 🆘 Troubleshooting

### Backend not starting
```bash
sudo systemctl status bowman-backend
sudo journalctl -u bowman-backend -n 50
```

### Database connection errors
- Check DATABASE_URL in .env
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Test connection: `psql -U bowman_user -d bowman_insurance`

### Frontend 502 Bad Gateway
- Check PM2: `pm2 status`
- Restart: `pm2 restart bowman-frontend`
- Check logs: `pm2 logs bowman-frontend`

### M-Pesa not working
- Verify credentials in .env
- Check callback URL is accessible
- Review Celery logs for webhook processing

---

## ✅ Deployment Complete!

Your Bowman Insurance application is now live at: **https://yourdomain.com**

**What's Working**:
- ✅ Full backend API (80+ endpoints)
- ✅ User authentication
- ✅ Policy browsing and purchase
- ✅ Dashboard with statistics
- ✅ Admin panel
- ✅ Beneficiaries management
- ✅ Quote generation
- ✅ M-Pesa payments
- ✅ Document management
- ✅ Claims processing

**Next Steps**:
1. Monitor error logs for first 24 hours
2. Test all critical flows
3. Configure backup strategy
4. Set up monitoring (Sentry, Uptime Robot)
5. Train staff on admin panel

**Support**: Check the deployed application and report any issues for immediate fixes.

---

Generated: 2026-02-12
Commit: 6802864
