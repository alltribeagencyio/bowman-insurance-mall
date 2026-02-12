# 🚀 Deployment Summary - Quick Reference

**Bowman Insurance Web App - Complete Deployment Overview**

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR VPS SERVER                          │
│                     (Ubuntu 22.04 / 4GB RAM)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      NGINX (Port 80/443)                  │  │
│  │                  SSL/TLS Reverse Proxy                    │  │
│  └───────┬────────────────────────────────────────┬──────────┘  │
│          │                                        │              │
│          │ /api/*                                 │ /*           │
│          │ /admin/*                               │              │
│          │                                        │              │
│  ┌───────▼─────────────────┐           ┌─────────▼─────────┐   │
│  │  BACKEND (Django)       │           │ FRONTEND (Next.js) │   │
│  │  Port: Unix Socket      │           │ Port: 3000         │   │
│  │  ────────────────────   │           │ ──────────────────  │   │
│  │  • Gunicorn (WSGI)     │           │ • PM2 Cluster      │   │
│  │  • 3 Workers           │           │ • 2 Instances      │   │
│  │  • Python 3.11         │           │ • Node.js 20.x     │   │
│  │  • Django 5.0          │           │ • Next.js 14       │   │
│  └────────┬───────────────┘           └────────────────────┘   │
│           │                                                      │
│  ┌────────▼──────────────────────────────────────────────────┐ │
│  │              CELERY WORKERS (Background Tasks)            │ │
│  │  • Worker: Process async tasks                            │ │
│  │  • Beat: Scheduled tasks                                  │ │
│  │  • Broker: Redis                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    POSTGRESQL 15+                          │ │
│  │  Database: bowman_insurance                               │ │
│  │  Port: 5432 (localhost only)                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                       REDIS 7+                             │ │
│  │  Celery Broker & Result Backend                           │ │
│  │  Port: 6379 (localhost only)                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              │
                    ┌─────────▼──────────┐
                    │   Internet Users    │
                    │   (Port 443/80)     │
                    └────────────────────┘

External Services:
┌────────────────┐  ┌──────────────┐  ┌───────────────┐
│  AWS S3        │  │   M-Pesa     │  │   Paystack    │
│  (Documents)   │  │  (Payments)  │  │  (Payments)   │
└────────────────┘  └──────────────┘  └───────────────┘
```

---

## 📁 Directory Structure on VPS

```
/home/bowman/
└── bowman-insurance-mall/
    ├── backend/
    │   ├── venv/                    # Python virtual environment
    │   ├── apps/                    # Django apps
    │   ├── bowman_insurance/        # Django project settings
    │   ├── staticfiles/             # Collected static files
    │   ├── media/                   # Uploaded media files
    │   ├── logs/                    # Application logs
    │   ├── .env                     # Environment variables (SECRET)
    │   ├── manage.py
    │   └── requirements.txt
    │
    └── frontend/
        ├── .next/                   # Next.js build output
        ├── node_modules/            # NPM dependencies
        ├── public/                  # Static assets
        ├── src/                     # Source code
        ├── logs/                    # PM2 logs
        ├── .env.production          # Production env vars
        ├── ecosystem.config.js      # PM2 configuration
        └── package.json
```

---

## 🔑 Critical Files & Configurations

### 1. Environment Variables

**Backend:** `/home/bowman/bowman-insurance-mall/backend/.env`
```env
SECRET_KEY=...
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://...
CORS_ALLOWED_ORIGINS=https://your-domain.com
AWS_ACCESS_KEY_ID=...
MPESA_CONSUMER_KEY=...
PAYSTACK_SECRET_KEY=...
```

**Frontend:** `/home/bowman/bowman-insurance-mall/frontend/.env.production`
```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1
NODE_ENV=production
```

### 2. Systemd Services

**Gunicorn:** `/etc/systemd/system/gunicorn-bowman.service`
- Runs Django application
- 3 workers
- Unix socket communication
- Auto-restart on failure

**Celery Worker:** `/etc/systemd/system/celery-bowman.service`
- Background task processing
- Auto-restart on failure

**Celery Beat:** `/etc/systemd/system/celery-beat-bowman.service`
- Scheduled task management
- Database scheduler

### 3. PM2 Configuration

**File:** `/home/bowman/bowman-insurance-mall/frontend/ecosystem.config.js`
- Next.js application
- Cluster mode: 2 instances
- Auto-restart enabled
- Memory limit: 1GB per instance

### 4. Nginx Configuration

**File:** `/etc/nginx/sites-available/bowman-insurance`
- Routes `/api/*` → Django backend
- Routes `/admin/*` → Django admin
- Routes `/*` → Next.js frontend
- SSL/TLS termination
- Static file serving
- Gzip compression

---

## 🚀 Deployment Commands Quick Reference

### First Time Deployment

```bash
# 1. Clone repository
git clone https://github.com/alltribeagencyio/bowman-insurance-mall.git
cd bowman-insurance-mall

# 2. Backend setup
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
nano .env  # Configure environment
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput

# 3. Frontend setup
cd ../frontend
npm install
nano .env.production  # Configure environment
npm run build

# 4. Start services
sudo systemctl start gunicorn-bowman celery-bowman celery-beat-bowman
pm2 start ecosystem.config.js
pm2 save

# 5. Configure Nginx
sudo ln -s /etc/nginx/sites-available/bowman-insurance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6. SSL setup
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Update Deployment

```bash
# Pull latest code
cd /home/bowman/bowman-insurance-mall
git pull origin master

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn-bowman celery-bowman

# Update frontend
cd ../frontend
npm install
npm run build
pm2 restart bowman-frontend
```

---

## 🔍 Service Management Commands

### Check Status

```bash
# All backend services
sudo systemctl status gunicorn-bowman
sudo systemctl status celery-bowman
sudo systemctl status celery-beat-bowman

# Frontend service
pm2 status

# Nginx
sudo systemctl status nginx

# Database & Redis
sudo systemctl status postgresql
sudo systemctl status redis-server
```

### View Logs

```bash
# Backend logs
sudo journalctl -u gunicorn-bowman -f
sudo journalctl -u celery-bowman -f
tail -f /home/bowman/bowman-insurance-mall/backend/logs/gunicorn-access.log

# Frontend logs
pm2 logs bowman-frontend

# Nginx logs
sudo tail -f /var/log/nginx/bowman-access.log
sudo tail -f /var/log/nginx/bowman-error.log
```

### Restart Services

```bash
# Backend
sudo systemctl restart gunicorn-bowman
sudo systemctl restart celery-bowman
sudo systemctl restart celery-beat-bowman

# Frontend
pm2 restart bowman-frontend

# Nginx
sudo systemctl restart nginx
```

---

## 🌐 URLs & Access Points

### Production URLs
- **Main Website:** `https://your-domain.com/`
- **Backend API:** `https://your-domain.com/api/v1/`
- **Admin Panel:** `https://your-domain.com/admin/`
- **API Docs:** `https://your-domain.com/api/v1/schema/swagger-ui/`

### Common API Endpoints
- Categories: `GET /api/v1/policies/categories/`
- Featured Policies: `GET /api/v1/policies/types/featured/`
- User Policies: `GET /api/v1/policies/my-policies/`
- Submit Claim: `POST /api/v1/claims/`
- Upload Document: `POST /api/v1/documents/upload/`
- User Profile: `GET /api/v1/auth/profile/`

---

## 🔒 Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Password authentication disabled
- [ ] SSL/TLS certificates installed
- [ ] HTTPS redirect enabled
- [ ] Database access restricted to localhost
- [ ] Redis access restricted to localhost
- [ ] Strong SECRET_KEY set
- [ ] DEBUG=False in production
- [ ] ALLOWED_HOSTS configured
- [ ] CORS_ALLOWED_ORIGINS configured
- [ ] CSRF_TRUSTED_ORIGINS configured
- [ ] Security headers enabled in Nginx
- [ ] Rate limiting configured
- [ ] Regular backups scheduled

---

## 📊 Resource Usage (Typical)

### Expected Resource Consumption

**CPU:**
- Idle: 5-10%
- Normal Load: 20-40%
- Peak Load: 60-80%

**Memory:**
- PostgreSQL: ~200-300 MB
- Redis: ~50-100 MB
- Django (Gunicorn): ~300-500 MB
- Celery Workers: ~200-300 MB
- Next.js (PM2): ~400-600 MB
- Nginx: ~50-100 MB
- **Total:** ~1.5-2 GB (leaving 2GB free on 4GB VPS)

**Disk:**
- Base installation: ~3 GB
- Logs (monthly): ~500 MB
- Database (growing): Start ~100 MB
- Static files: ~50 MB
- Media files: Variable
- **Total:** ~4-5 GB (leaving 35GB+ free)

**Network:**
- Idle: <1 Mbps
- Normal: 5-10 Mbps
- Peak: 20-50 Mbps

---

## 🔧 Common Maintenance Tasks

### Daily
- Monitor error logs
- Check service status
- Verify backups completed

### Weekly
- Review disk space
- Check memory usage
- Analyze access logs
- Update dependencies (if security patches)

### Monthly
- Full system update
- Database vacuum/optimize
- Log rotation check
- SSL certificate check (auto-renews)
- Performance review

---

## 🆘 Emergency Troubleshooting

### Site is Down
```bash
# Check all services
sudo systemctl status nginx gunicorn-bowman
pm2 status

# Check logs
sudo tail -100 /var/log/nginx/error.log
sudo journalctl -u gunicorn-bowman -n 100

# Quick restart all
sudo systemctl restart nginx gunicorn-bowman celery-bowman
pm2 restart all
```

### Database Issues
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Out of Disk Space
```bash
# Check disk usage
df -h

# Clean old logs
sudo journalctl --vacuum-time=7d
find /home/bowman/bowman-insurance-mall -name "*.log" -mtime +30 -delete

# Clean old backups
find /home/bowman/backups -mtime +30 -delete
```

### High Memory Usage
```bash
# Check memory
free -h
top

# Identify culprit
sudo systemctl status gunicorn-bowman
pm2 monit

# Restart high memory service
pm2 restart bowman-frontend
sudo systemctl restart gunicorn-bowman
```

---

## 📞 Support & Resources

### Documentation
- [VPS_COMPLETE_DEPLOYMENT_GUIDE.md](VPS_COMPLETE_DEPLOYMENT_GUIDE.md) - Full deployment guide
- [INTEGRATION_COMPLETE.md](frontend/INTEGRATION_COMPLETE.md) - Integration summary
- [API_ENDPOINTS_REFERENCE.md](backend/API_ENDPOINTS_REFERENCE.md) - API documentation
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist

### Service Logs Location
- Backend: `/home/bowman/bowman-insurance-mall/backend/logs/`
- Frontend: `/home/bowman/bowman-insurance-mall/frontend/logs/`
- Nginx: `/var/log/nginx/`
- System: `sudo journalctl -u <service-name>`

### Useful Commands
```bash
# View all running processes
ps aux | grep -E 'gunicorn|celery|pm2|nginx'

# Check port usage
sudo netstat -tulpn | grep -E ':80|:443|:3000|:5432|:6379'

# Disk usage by directory
du -sh /home/bowman/bowman-insurance-mall/*

# Database size
sudo -u postgres psql -d bowman_insurance -c "SELECT pg_size_pretty(pg_database_size('bowman_insurance'));"
```

---

## ✅ Post-Deployment Checklist

After deployment, verify:

1. **Frontend**
   - [ ] Homepage loads
   - [ ] Can browse policies
   - [ ] Can view policy details
   - [ ] Images load correctly
   - [ ] Loading states work
   - [ ] Error handling works

2. **Backend API**
   - [ ] API returns data
   - [ ] Authentication works
   - [ ] CORS configured correctly
   - [ ] File uploads work
   - [ ] Admin panel accessible

3. **Services**
   - [ ] All systemd services running
   - [ ] PM2 processes stable
   - [ ] No errors in logs
   - [ ] SSL certificate valid
   - [ ] HTTPS redirect works

4. **Integrations**
   - [ ] Database connections work
   - [ ] Redis connections work
   - [ ] S3 uploads work
   - [ ] Email sending works
   - [ ] Celery tasks execute

5. **Security**
   - [ ] Firewall active
   - [ ] SSH hardened
   - [ ] SSL/TLS enabled
   - [ ] Security headers present
   - [ ] No sensitive data exposed

6. **Performance**
   - [ ] Page load times acceptable
   - [ ] API response times fast
   - [ ] No memory leaks
   - [ ] CPU usage normal
   - [ ] Disk space adequate

---

## 🎉 You're Live!

**Congratulations! Your Bowman Insurance Web App is now running in production on your VPS!**

**What's Working:**
✅ Complete user registration and authentication
✅ Browse and search insurance policies
✅ Purchase policies with payment integration
✅ File and track insurance claims
✅ Upload and manage documents
✅ Admin dashboard for management
✅ Automated background tasks
✅ SSL encryption for all traffic
✅ Automatic backups

**Your Stack:**
- **Frontend:** Next.js 14 (React, TypeScript, Tailwind CSS)
- **Backend:** Django 5.0 (Python, REST API)
- **Database:** PostgreSQL 15
- **Cache/Queue:** Redis 7
- **Web Server:** Nginx
- **SSL:** Let's Encrypt
- **Hosting:** Your own VPS (full control!)

**Next Steps:**
1. Add sample policies via Django admin
2. Test payment gateways thoroughly
3. Set up monitoring (UptimeRobot, Sentry)
4. Configure email templates
5. Add Google Analytics
6. Plan scaling strategy

**Need Help?** Refer to the detailed guides in this repository!
