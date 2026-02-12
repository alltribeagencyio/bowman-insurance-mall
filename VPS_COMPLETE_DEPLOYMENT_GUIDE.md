# 🚀 Complete VPS Deployment Guide - Frontend + Backend

**Deploy both Next.js Frontend and Django Backend on a Single VPS**

---

## 📋 Table of Contents

1. [Server Requirements](#server-requirements)
2. [Initial VPS Setup](#initial-vps-setup)
3. [Backend Deployment (Django + PostgreSQL)](#backend-deployment)
4. [Frontend Deployment (Next.js)](#frontend-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [SSL Setup](#ssl-setup)
7. [Process Management](#process-management)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance & Updates](#maintenance--updates)

---

## 🖥️ Server Requirements

### Minimum Specifications
- **OS:** Ubuntu 22.04 LTS or newer
- **RAM:** 4GB minimum (8GB recommended)
- **CPU:** 2 cores minimum
- **Storage:** 40GB SSD minimum
- **Network:** Public IP address

### Software to Install
- Node.js 18.x or 20.x (for Next.js frontend)
- Python 3.11+ (for Django backend)
- PostgreSQL 15+
- Redis 7+ (for Celery)
- Nginx
- PM2 (for Node.js process management)
- Supervisor or Systemd (for Django/Celery)

---

## 🔧 Initial VPS Setup

### 1. Connect to Your VPS

```bash
ssh root@your-vps-ip
```

### 2. Update System

```bash
apt update && apt upgrade -y
```

### 3. Create Deployment User

```bash
adduser bowman
usermod -aG sudo bowman
su - bowman
```

### 4. Set Up Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### 5. Install Essential Tools

```bash
sudo apt install -y git curl wget build-essential software-properties-common
```

---

## 🐍 Backend Deployment (Django + PostgreSQL)

### Step 1: Install Python & PostgreSQL

```bash
# Install Python 3.11
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### Step 2: Set Up PostgreSQL Database

```bash
sudo -u postgres psql
```

In PostgreSQL shell:

```sql
CREATE DATABASE bowman_insurance;
CREATE USER bowman_user WITH PASSWORD 'your_secure_password_here';
ALTER ROLE bowman_user SET client_encoding TO 'utf8';
ALTER ROLE bowman_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE bowman_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bowman_insurance TO bowman_user;

-- For PostgreSQL 15+, grant schema permissions
\c bowman_insurance
GRANT ALL ON SCHEMA public TO bowman_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bowman_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bowman_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bowman_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bowman_user;

\q
```

### Step 3: Clone Repository & Set Up Backend

```bash
cd /home/bowman
git clone https://github.com/alltribeagencyio/bowman-insurance-mall.git
cd bowman-insurance-mall/backend

# Create Python virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

```bash
nano .env
```

Add the following (update all values):

```env
# Django Settings
SECRET_KEY=your-very-long-random-secret-key-generate-with-django
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-vps-ip

# Database
DATABASE_URL=postgresql://bowman_user:your_secure_password_here@localhost:5432/bowman_insurance

# CORS (Frontend domains)
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# AWS S3 Storage
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_STORAGE_BUCKET_NAME=bowman-insurance-documents
AWS_S3_REGION_NAME=us-east-1

# M-Pesa Configuration
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/v1/payments/mpesa/callback/

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
DEFAULT_FROM_EMAIL=noreply@bowman.co.ke

# Celery & Redis
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Security
CSRF_TRUSTED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

**To generate a secure SECRET_KEY:**

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 5: Run Migrations & Create Superuser

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Or use this command:
python manage.py shell -c "from apps.users.models import User; User.objects.create_superuser(email='admin@bowman.co.ke', password='Admin123!', first_name='Admin', last_name='User', phone_number='+254700000000')"

# Collect static files
python manage.py collectstatic --noinput
```

### Step 6: Set Up Gunicorn

Create Gunicorn systemd service:

```bash
sudo nano /etc/systemd/system/gunicorn-bowman.service
```

Add:

```ini
[Unit]
Description=Gunicorn daemon for Bowman Insurance Backend
After=network.target

[Service]
User=bowman
Group=bowman
WorkingDirectory=/home/bowman/bowman-insurance-mall/backend
Environment="PATH=/home/bowman/bowman-insurance-mall/backend/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=bowman_insurance.settings.production"
ExecStart=/home/bowman/bowman-insurance-mall/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/home/bowman/bowman-insurance-mall/backend/gunicorn.sock \
    --timeout 120 \
    --access-logfile /home/bowman/bowman-insurance-mall/backend/logs/gunicorn-access.log \
    --error-logfile /home/bowman/bowman-insurance-mall/backend/logs/gunicorn-error.log \
    bowman_insurance.wsgi:application

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Create log directory:

```bash
mkdir -p /home/bowman/bowman-insurance-mall/backend/logs
```

Start Gunicorn:

```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn-bowman
sudo systemctl enable gunicorn-bowman
sudo systemctl status gunicorn-bowman
```

### Step 7: Set Up Celery Worker & Beat

**Celery Worker Service:**

```bash
sudo nano /etc/systemd/system/celery-bowman.service
```

Add:

```ini
[Unit]
Description=Celery Worker for Bowman Insurance
After=network.target redis-server.service

[Service]
Type=forking
User=bowman
Group=bowman
WorkingDirectory=/home/bowman/bowman-insurance-mall/backend
Environment="PATH=/home/bowman/bowman-insurance-mall/backend/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=bowman_insurance.settings.production"
ExecStart=/home/bowman/bowman-insurance-mall/backend/venv/bin/celery -A bowman_insurance worker \
    --loglevel=info \
    --logfile=/home/bowman/bowman-insurance-mall/backend/logs/celery-worker.log

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Celery Beat Service:**

```bash
sudo nano /etc/systemd/system/celery-beat-bowman.service
```

Add:

```ini
[Unit]
Description=Celery Beat for Bowman Insurance
After=network.target redis-server.service

[Service]
Type=simple
User=bowman
Group=bowman
WorkingDirectory=/home/bowman/bowman-insurance-mall/backend
Environment="PATH=/home/bowman/bowman-insurance-mall/backend/venv/bin"
Environment="DJANGO_SETTINGS_MODULE=bowman_insurance.settings.production"
ExecStart=/home/bowman/bowman-insurance-mall/backend/venv/bin/celery -A bowman_insurance beat \
    --loglevel=info \
    --logfile=/home/bowman/bowman-insurance-mall/backend/logs/celery-beat.log \
    --scheduler django_celery_beat.schedulers:DatabaseScheduler

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Start Celery services:

```bash
sudo systemctl daemon-reload
sudo systemctl start celery-bowman
sudo systemctl enable celery-bowman
sudo systemctl start celery-beat-bowman
sudo systemctl enable celery-beat-bowman
sudo systemctl status celery-bowman
sudo systemctl status celery-beat-bowman
```

---

## 🌐 Frontend Deployment (Next.js)

### Step 1: Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x

# Install PM2 globally
sudo npm install -g pm2
```

### Step 2: Set Up Frontend

```bash
cd /home/bowman/bowman-insurance-mall/frontend

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

Add:

```env
# Backend API URL (same domain, different path)
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1

# Other environment variables if needed
NODE_ENV=production
```

### Step 3: Build Frontend

```bash
# Build for production
npm run build

# Test build locally (optional)
npm start  # Should run on port 3000
```

### Step 4: Configure PM2

Create PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

Add:

```javascript
module.exports = {
  apps: [{
    name: 'bowman-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/bowman/bowman-insurance-mall/frontend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'https://your-domain.com/api/v1'
    },
    error_file: '/home/bowman/bowman-insurance-mall/frontend/logs/pm2-error.log',
    out_file: '/home/bowman/bowman-insurance-mall/frontend/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

Create log directory and start PM2:

```bash
mkdir -p /home/bowman/bowman-insurance-mall/frontend/logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup systemd
# Copy and run the command that PM2 outputs

# Check status
pm2 status
pm2 logs bowman-frontend
```

---

## 🔧 Nginx Configuration

### Step 1: Install Nginx

```bash
sudo apt install -y nginx
```

### Step 2: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/bowman-insurance
```

Add:

```nginx
# Upstream for Next.js frontend
upstream frontend {
    server localhost:3000;
    keepalive 64;
}

# Upstream for Django backend
upstream backend {
    server unix:/home/bowman/bowman-insurance-mall/backend/gunicorn.sock fail_timeout=0;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Max upload size
    client_max_body_size 100M;

    # Logging
    access_log /var/log/nginx/bowman-access.log;
    error_log /var/log/nginx/bowman-error.log;

    # Backend API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;

        # Timeouts
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Django static files
    location /static/ {
        alias /home/bowman/bowman-insurance-mall/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Django media files
    location /media/ {
        alias /home/bowman/bowman-insurance-mall/backend/media/;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Next.js static files
    location /_next/static/ {
        proxy_pass http://frontend;
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js public files
    location /images/ {
        proxy_pass http://frontend;
        expires 7d;
        add_header Cache-Control "public";
    }

    # All other routes go to Next.js frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts for SSR
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Important:** Replace `your-domain.com` with your actual domain name in all locations.

### Step 3: Enable Site

```bash
# Test Nginx configuration
sudo nginx -t

# Enable site
sudo ln -s /etc/nginx/sites-available/bowman-insurance /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

---

## 🔒 SSL Setup with Let's Encrypt

### Step 1: Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Obtain SSL Certificate

```bash
# For your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

### Step 3: Auto-renewal

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
# Check it's configured:
sudo systemctl status certbot.timer
```

---

## 📊 Process Management & Monitoring

### Backend Services

```bash
# Check Django/Gunicorn status
sudo systemctl status gunicorn-bowman

# View Django logs
sudo journalctl -u gunicorn-bowman -f

# Restart backend
sudo systemctl restart gunicorn-bowman

# Check Celery status
sudo systemctl status celery-bowman
sudo systemctl status celery-beat-bowman

# View Celery logs
sudo journalctl -u celery-bowman -f
tail -f /home/bowman/bowman-insurance-mall/backend/logs/celery-worker.log
```

### Frontend Services

```bash
# Check PM2 status
pm2 status

# View frontend logs
pm2 logs bowman-frontend

# Restart frontend
pm2 restart bowman-frontend

# Monitor resources
pm2 monit
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU
top

# Check all services
sudo systemctl status nginx gunicorn-bowman celery-bowman
pm2 status
```

---

## 🧪 Testing & Verification

### 1. Test Backend API

```bash
# Test health endpoint
curl https://your-domain.com/api/v1/

# Test categories endpoint
curl https://your-domain.com/api/v1/policies/categories/

# Test admin panel
# Visit: https://your-domain.com/admin/
```

### 2. Test Frontend

```bash
# Visit your domain
# https://your-domain.com/

# Check:
- Homepage loads
- Categories display
- Featured policies show
- Can browse policies
- Can view policy details
```

### 3. Test Full User Flow

1. Register new account
2. Login
3. Browse policies
4. View policy details
5. Purchase a policy (test mode)
6. File a claim
7. Upload document
8. View dashboard

---

## 🔍 Troubleshooting

### Backend Issues

**502 Bad Gateway**
```bash
# Check Gunicorn socket
ls -la /home/bowman/bowman-insurance-mall/backend/gunicorn.sock

# Check Gunicorn logs
sudo journalctl -u gunicorn-bowman -n 50

# Restart Gunicorn
sudo systemctl restart gunicorn-bowman
```

**Database Connection Error**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
sudo -u postgres psql -d bowman_insurance -U bowman_user
```

**Static Files Not Loading**
```bash
# Recollect static files
cd /home/bowman/bowman-insurance-mall/backend
source venv/bin/activate
python manage.py collectstatic --noinput

# Check permissions
sudo chown -R bowman:bowman /home/bowman/bowman-insurance-mall/backend/staticfiles/
```

### Frontend Issues

**Frontend Not Starting**
```bash
# Check PM2 logs
pm2 logs bowman-frontend --err

# Restart PM2
pm2 restart bowman-frontend

# Rebuild if needed
cd /home/bowman/bowman-insurance-mall/frontend
npm run build
pm2 restart bowman-frontend
```

**API Connection Failed**
```bash
# Check environment variable
cat /home/bowman/bowman-insurance-mall/frontend/.env.production

# Should have:
# NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1
```

### Nginx Issues

**Nginx Won't Start**
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Check if port 80/443 is in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

---

## 🔄 Maintenance & Updates

### Update Backend Code

```bash
cd /home/bowman/bowman-insurance-mall
git pull origin master

cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Restart services
sudo systemctl restart gunicorn-bowman
sudo systemctl restart celery-bowman
```

### Update Frontend Code

```bash
cd /home/bowman/bowman-insurance-mall
git pull origin master

cd frontend
npm install
npm run build
pm2 restart bowman-frontend
```

### Database Backup

```bash
# Create backup script
nano /home/bowman/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/home/bowman/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump bowman_insurance | gzip > $BACKUP_DIR/bowman_insurance_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "bowman_insurance_*.sql.gz" -mtime +7 -delete
```

Make executable and add to cron:

```bash
chmod +x /home/bowman/backup-db.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add this line:
0 2 * * * /home/bowman/backup-db.sh
```

---

## 📈 Performance Optimization

### Enable Nginx Caching

```bash
sudo nano /etc/nginx/nginx.conf
```

Add in http block:

```nginx
# Cache settings
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

### Enable Gzip Compression

Already enabled in settings, but verify in Nginx:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

---

## ✅ Final Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Database migrations run
- [ ] Superuser created
- [ ] Static files collected
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] All services running (Gunicorn, Celery, PM2, Nginx)
- [ ] Backend API accessible at /api/v1/
- [ ] Frontend loads at /
- [ ] Can register and login
- [ ] Can browse and purchase policies
- [ ] Can file claims
- [ ] Can upload documents
- [ ] Email sending works
- [ ] Backups configured
- [ ] Monitoring set up

---

## 🎉 Your App is Live!

**URLs:**
- Frontend: `https://your-domain.com/`
- Backend API: `https://your-domain.com/api/v1/`
- Admin Panel: `https://your-domain.com/admin/`

**Next Steps:**
1. Add sample data via Django admin
2. Configure email templates
3. Test payment gateways
4. Monitor logs for errors
5. Set up uptime monitoring
6. Add Google Analytics

**Support:** If issues arise, check logs and refer to the troubleshooting section.
