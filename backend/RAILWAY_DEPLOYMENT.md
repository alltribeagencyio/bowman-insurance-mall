# Railway Deployment Guide for Bowman Insurance Backend

## Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- Code pushed to GitHub repository

## Step-by-Step Deployment

### 1. Create Railway Project

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository: `alltribeagencyio/bowman-insurance-mall`
6. Railway will automatically detect it's a Python/Django project

### 2. Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL database and provide connection details
4. The `DATABASE_URL` environment variable is automatically set

### 3. Configure Environment Variables

Click on your **backend service** → **"Variables"** tab and add these:

#### Required Variables:
```bash
# Django
SECRET_KEY=your-secret-key-here-generate-a-strong-one
DJANGO_SETTINGS_MODULE=bowman_insurance.settings.production
ALLOWED_HOSTS=.railway.app,.vercel.app,bowmaninsurance.co.ke

# Database (Auto-set by Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# CORS (Your frontend URL)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://bowmaninsurance.co.ke

# JWT Tokens
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=10080
```

#### Payment Gateways (M-Pesa):
```bash
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASSKEY=your_passkey
MPESA_SHORTCODE=your_shortcode
MPESA_CALLBACK_URL=https://your-backend.railway.app/api/payments/mpesa/callback/
```

#### Payment Gateways (Paystack):
```bash
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_CALLBACK_URL=https://your-backend.railway.app/api/payments/paystack/callback/
```

#### Email (SendGrid):
```bash
SENDGRID_API_KEY=SG.xxxxx
DEFAULT_FROM_EMAIL=noreply@bowmaninsurance.co.ke
```

#### SMS (Africa's Talking):
```bash
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_SENDER_ID=BOWMAN
```

#### Optional (for production monitoring):
```bash
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 4. Deploy

1. Railway will automatically deploy when you push to GitHub
2. First deployment takes 3-5 minutes
3. Watch the logs in Railway dashboard

### 5. Run Database Migrations

Once deployed:
1. Go to your backend service in Railway
2. Click **"Settings"** → **"Service"**
3. The migrations should run automatically via the `release` command in Procfile
4. Or run manually in Railway CLI:
   ```bash
   railway run python manage.py migrate
   ```

### 6. Create Superuser (Admin)

In Railway dashboard:
1. Click your backend service
2. Click **"Settings"** → **"Service"** → **"Connect"**
3. In the Railway CLI terminal:
   ```bash
   railway run python manage.py createsuperuser
   ```
4. Follow prompts to create admin account

### 7. Get Your Backend URL

1. Click on your backend service
2. Go to **"Settings"** → **"Networking"**
3. Your URL will be something like: `https://bowman-insurance-production.up.railway.app`
4. Copy this URL

### 8. Update Frontend Environment Variables

In Vercel (your frontend):
1. Go to your project settings
2. Navigate to **"Environment Variables"**
3. Add:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
4. Redeploy frontend

## Troubleshooting

### Build Fails

**Error:** `No module named 'X'`
- **Solution:** Make sure all dependencies are in `requirements.txt`

**Error:** `Collectstatic failed`
- **Solution:** Check that `STATIC_ROOT` is set correctly in settings

### Database Connection Issues

**Error:** `could not connect to server`
- **Solution:** Verify `DATABASE_URL` is set in environment variables
- **Solution:** Check PostgreSQL service is running in Railway

### Migration Errors

**Error:** `relation does not exist`
- **Solution:** Run migrations manually:
  ```bash
  railway run python manage.py migrate
  ```

### CORS Errors in Frontend

**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`
- **Solution:** Add your frontend URL to `CORS_ALLOWED_ORIGINS`
- **Solution:** Redeploy backend after changing environment variables

### 500 Internal Server Error

- Check logs in Railway dashboard
- Verify all required environment variables are set
- Check `SECRET_KEY` is set and not default value
- Verify `ALLOWED_HOSTS` includes your Railway domain

## Cost Breakdown

### Railway Pricing:
- **Hobby Plan**: $5/month
  - Includes: 512MB RAM, PostgreSQL, Redis
  - Good for staging/testing

- **Pro Plan**: $20/month per service
  - Includes: 8GB RAM, better performance
  - Recommended for production

### Free Trial:
- $5 credit per month
- Good for testing before going to production

## Custom Domain Setup (Optional)

1. In Railway, go to your backend service
2. Click **"Settings"** → **"Networking"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `api.bowmaninsurance.co.ke`)
5. Add the CNAME record to your DNS:
   ```
   CNAME: api.bowmaninsurance.co.ke → your-app.railway.app
   ```
6. Update `ALLOWED_HOSTS` in environment variables:
   ```bash
   ALLOWED_HOSTS=.railway.app,api.bowmaninsurance.co.ke
   ```

## Monitoring

### View Logs:
1. Click on your backend service
2. Click **"Deployments"**
3. Click on the latest deployment
4. View real-time logs

### Database Access:
1. Click on PostgreSQL service
2. Click **"Data"** tab
3. View tables and run queries
4. Or connect via CLI:
   ```bash
   railway connect postgres
   ```

## Backup Strategy

### Database Backups:
Railway automatically backs up PostgreSQL daily

### Manual Backup:
```bash
railway run python manage.py dumpdata > backup.json
```

## Scaling

### Vertical Scaling:
1. Upgrade to Pro plan for more resources
2. Increase RAM/CPU allocation

### Horizontal Scaling:
- Add Redis for caching (click "+ New" → "Redis")
- Add Celery worker service for background tasks

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

## Next Steps After Deployment

1. ✅ Test all API endpoints: `https://your-backend.railway.app/api/`
2. ✅ Access admin panel: `https://your-backend.railway.app/admin/`
3. ✅ Update frontend to use new backend URL
4. ✅ Test user registration and login
5. ✅ Test policy purchase flow
6. ✅ Test payment integrations (M-Pesa, Paystack)
7. ✅ Monitor logs for any errors

## Quick Commands Reference

```bash
# Connect to Railway CLI
railway login

# Link to project
railway link

# View logs
railway logs

# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser

# Open Django shell
railway run python manage.py shell

# View environment variables
railway variables

# Deploy specific branch
railway up --detach
```

---

**Your backend should now be live! 🚀**

Visit: `https://your-backend.railway.app/api/schema/swagger-ui/` to see API documentation.
