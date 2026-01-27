# Bowman Insurance Platform - Setup Guide

Quick setup guide for developers joining the project.

## Prerequisites Checklist

Before you start, ensure you have:

- [ ] Python 3.11 or higher
- [ ] Node.js 18 or higher
- [ ] PostgreSQL 15 or higher
- [ ] Redis 7 or higher
- [ ] Git
- [ ] Code editor (VS Code recommended)
- [ ] Docker Desktop (optional, but recommended)

## Initial Setup (First Time)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Web App 2.0 - Mall"
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Edit .env file with your local configuration
# At minimum, update these:
# - SECRET_KEY (generate a new one)
# - DB_PASSWORD
# - MPESA keys (use sandbox credentials)
# - PAYSTACK keys (use test credentials)
```

### 3. Database Setup

```bash
# Option A: Using PostgreSQL directly

# Create database (PostgreSQL must be running)
createdb bowman_insurance

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Option B: Using Docker
docker-compose up -d db redis
python manage.py migrate
python manage.py createsuperuser
```

### 4. Start Backend Server

```bash
# Make sure you're in backend directory with venv activated
python manage.py runserver

# Should see: Starting development server at http://127.0.0.1:8000/
```

Test: Visit http://localhost:8000/admin/ and login with superuser credentials.

### 5. Start Celery (Separate Terminal)

```bash
cd backend
# Activate venv first
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Start Celery worker
celery -A bowman_insurance worker -l info

# In another terminal, start Celery beat (optional for scheduled tasks)
celery -A bowman_insurance beat -l info
```

### 6. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env.local  # Windows
cp .env.example .env.local    # macOS/Linux

# Edit .env.local
# Update NEXT_PUBLIC_API_URL if backend is not on localhost:8000
```

### 7. Start Frontend Server

```bash
# Make sure you're in frontend directory
npm run dev

# Should see: ready - started server on 0.0.0.0:3000
```

Test: Visit http://localhost:3000/

## Using Docker (Easier Alternative)

If you have Docker Desktop installed:

```bash
cd backend

# Start all services (database, redis, backend, celery)
docker-compose up --build

# In another terminal, run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# For frontend, still run locally
cd ../frontend
npm install
npm run dev
```

## Verify Installation

### Backend Checklist

- [ ] Visit http://localhost:8000/admin/ - Should see Django admin login
- [ ] Visit http://localhost:8000/api/docs/ - Should see Swagger UI
- [ ] Login to admin - Should work with superuser credentials
- [ ] Check logs - Should see no errors

### Frontend Checklist

- [ ] Visit http://localhost:3000/ - Should see homepage
- [ ] No console errors in browser DevTools
- [ ] Tailwind CSS styles are working
- [ ] Page loads without crashes

## Common Setup Issues

### Issue: PostgreSQL Connection Error

**Error**: `could not connect to server: Connection refused`

**Solution**:
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Start PostgreSQL if needed
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### Issue: Redis Connection Error

**Error**: `Error connecting to Redis`

**Solution**:
```bash
# Check if Redis is running
redis-cli ping  # Should return PONG

# Start Redis if needed
# macOS: brew services start redis
# Linux: sudo systemctl start redis
# Windows: redis-server
```

### Issue: Port Already in Use

**Error**: `Error: That port is already in use`

**Solution**:
```bash
# Backend (port 8000)
# Find and kill process
# Windows: netstat -ano | findstr :8000
# macOS/Linux: lsof -ti:8000 | xargs kill

# Or use different port
python manage.py runserver 8001

# Frontend (port 3000)
npm run dev -- -p 3001
```

### Issue: Module Import Errors

**Error**: `ModuleNotFoundError: No module named 'django'`

**Solution**:
```bash
# Make sure virtual environment is activated
# You should see (venv) in your terminal prompt

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: npm install fails

**Error**: Various npm errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Development Workflow

### Daily Startup

1. **Start Backend**:
   ```bash
   cd backend
   venv\Scripts\activate  # Activate venv
   python manage.py runserver
   ```

2. **Start Celery** (if needed):
   ```bash
   cd backend
   venv\Scripts\activate
   celery -A bowman_insurance worker -l info
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### Making Database Changes

```bash
cd backend

# After modifying models.py
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# If you need to reset database
python manage.py flush
python manage.py migrate
python manage.py createsuperuser
```

### Installing New Dependencies

**Backend**:
```bash
cd backend
venv\Scripts\activate
pip install package-name
pip freeze > requirements.txt  # Update requirements
```

**Frontend**:
```bash
cd frontend
npm install package-name
# package.json is automatically updated
```

## IDE Setup (VS Code)

Recommended extensions:

- Python (Microsoft)
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/Scripts/python.exe",
  "editor.formatOnSave": true,
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Getting Sample Data

To populate the database with sample data:

```bash
cd backend

# Create a management command or Django shell
python manage.py shell

# In shell:
from apps.policies.factories import PolicyFactory
PolicyFactory.create_batch(10)  # Create 10 sample policies
```

## Testing Your Setup

### Backend API Test

```bash
# Test user registration
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "phone": "254712345678"
  }'
```

### Frontend Test

Visit http://localhost:3000/ and check:
- Homepage loads correctly
- Navigation works
- Styles are applied
- No console errors

## Next Steps

Once setup is complete:

1. Review [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for development roadmap
2. Check [backend/README.md](backend/README.md) for backend details
3. Check [frontend/README.md](frontend/README.md) for frontend details
4. Review [Technical_Specifications.pdf](Technical_Specifications.pdf) for full requirements

## Need Help?

- Check the main [README.md](README.md)
- Review error logs in `backend/logs/`
- Check browser console for frontend errors
- Ensure all prerequisites are installed correctly

## Quick Reference

| Service | URL | Credentials |
|---------|-----|-------------|
| Backend API | http://localhost:8000 | - |
| Admin Panel | http://localhost:8000/admin/ | Superuser |
| API Docs | http://localhost:8000/api/docs/ | - |
| Frontend | http://localhost:3000 | - |
| PostgreSQL | localhost:5432 | See .env |
| Redis | localhost:6379 | - |

---

**Setup Complete!** You're ready to start development. 🚀
