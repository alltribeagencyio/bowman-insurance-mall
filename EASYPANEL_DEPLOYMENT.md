# EasyPanel Deployment Guide — Bowman Insurance

Deploy both the Django backend and Next.js frontend on a single VPS running EasyPanel.

---

## Prerequisites

- VPS with EasyPanel installed and running
- A domain name (or use EasyPanel's auto-generated `.easypanel.host` subdomains)
- This repo pushed to GitHub

---

## Step 1 — Push Code to GitHub

If not already done:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/bowman-insurance.git
git push -u origin master
```

---

## Step 2 — Create a Project in EasyPanel

1. Log in to EasyPanel (`http://YOUR_VPS_IP:3000`)
2. Click **+ Create Project**
3. Name it `bowman-insurance`

---

## Step 3 — Add PostgreSQL Service

1. Inside the project, click **+ Create Service → Postgres**
2. Name it `db`
3. Note the **connection details** (host, user, password, db name) — you'll need these for backend env vars

---

## Step 4 — Add Redis Service

1. Click **+ Create Service → Redis**
2. Name it `redis`
3. Note the **Redis URL** (format: `redis://redis:6379/0`)

---

## Step 5 — Deploy the Backend (Django)

1. Click **+ Create Service → App**
2. Name it `backend`
3. **Source:** GitHub → connect your repo → select `master` branch
4. **Build:** Set **Dockerfile path** to `backend/Dockerfile`
5. **Port:** `8000`
6. Go to **Domains** → add your backend domain, e.g. `api.yourdomain.com`
   - Enable HTTPS (EasyPanel uses Let's Encrypt automatically)

### Backend Environment Variables

In the service **Environment** tab, add:

```
DJANGO_SETTINGS_MODULE=bowman_insurance.settings.production
SECRET_KEY=<generate a 50-char random string>
DEBUG=False
ALLOWED_HOSTS=api.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://api.yourdomain.com,https://app.yourdomain.com

# From your Postgres service (use EasyPanel's internal hostname)
DB_NAME=bowman_insurance
DB_USER=<your postgres user>
DB_PASSWORD=<your postgres password>
DB_HOST=<postgres internal hostname shown in EasyPanel>
DB_PORT=5432
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/bowman_insurance

# From your Redis service
REDIS_URL=redis://<redis internal hostname>:6379/0
CELERY_BROKER_URL=redis://<redis internal hostname>:6379/1

CORS_ALLOWED_ORIGINS=https://app.yourdomain.com
```

> **Tip:** EasyPanel shows internal hostnames in each service's connection tab.
> They look like `bowman-insurance_db` or similar.

7. Click **Deploy**
8. Watch logs — backend will auto-run migrations on startup

---

## Step 6 — Deploy the Frontend (Next.js)

1. Click **+ Create Service → App**
2. Name it `frontend`
3. **Source:** GitHub → same repo → `master` branch
4. **Build:** Set **Dockerfile path** to `frontend/Dockerfile`
5. **Port:** `3000`
6. Go to **Domains** → add `app.yourdomain.com`, enable HTTPS
7. Add **Build Argument** (in Build tab):

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

8. Add **Environment Variable**:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

9. Click **Deploy**

---

## Step 7 — Seed the Database

After the backend is running, open a **terminal** in EasyPanel for the backend service and run:

```bash
python manage.py populate_sample_data
```

This creates: `admin@bowman.co.ke` / `Admin123!` + sample data.

---

## Step 8 — Verify Everything Works

| URL | Expected |
|-----|----------|
| `https://app.yourdomain.com` | Next.js homepage |
| `https://api.yourdomain.com/api/docs/` | Swagger API docs |
| `https://api.yourdomain.com/admin/` | Django admin panel |

Login at `https://app.yourdomain.com/login` with `admin@bowman.co.ke` / `Admin123!`

---

## Step 9 (Optional) — Deploy Celery Worker

For background tasks (email/SMS notifications):

1. Click **+ Create Service → App**
2. Name it `celery`
3. Same GitHub source, same `backend/Dockerfile`
4. **Override Command:** `celery -A bowman_insurance worker -l info --concurrency=2`
5. Same environment variables as the backend (no port needed)
6. Deploy

---

## Auto-Deploy on Git Push

In each service's **Source** tab, enable **Auto Deploy** — EasyPanel will rebuild whenever you push to `master`.

---

## Quick Reference — Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| `SECRET_KEY` | 50-char random string | Yes |
| `DEBUG` | `False` | Yes |
| `ALLOWED_HOSTS` | `api.yourdomain.com` | Yes |
| `CSRF_TRUSTED_ORIGINS` | `https://api.yourdomain.com,https://app.yourdomain.com` | Yes |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Yes |
| `REDIS_URL` | `redis://host:6379/0` | Yes |
| `CORS_ALLOWED_ORIGINS` | `https://app.yourdomain.com` | Yes |
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/api/v1` | Yes (frontend build arg) |
| `AWS_*` | — | No (file uploads) |
| `MPESA_*` | — | No (payments) |
| `PAYSTACK_*` | — | No (payments) |
| `SENDGRID_API_KEY` | — | No (email) |
| `SENTRY_DSN` | — | No (monitoring) |

---

## Troubleshooting

**Backend won't start — database error**
→ Make sure DB_HOST points to the EasyPanel internal hostname, not `localhost`.

**Frontend shows "Failed to fetch" / network errors**
→ Check `NEXT_PUBLIC_API_URL` build arg is set correctly and CORS_ALLOWED_ORIGINS includes the frontend domain.

**Static files not loading (CSS/JS 404s)**
→ WhiteNoise serves static files — check ALLOWED_HOSTS includes the backend domain.

**Redirect loop on HTTPS**
→ EasyPanel terminates SSL at the proxy. The settings already have `SECURE_SSL_REDIRECT=False` and `SECURE_PROXY_SSL_HEADER` set correctly.

**Celery tasks not running**
→ Make sure the Celery service is deployed with the same `CELERY_BROKER_URL` as the backend.
