# Backend Setup Guide - Bowman Insurance Platform

## Prerequisites

Before running the backend, ensure you have:

- Python 3.11+ installed
- PostgreSQL 15+ installed and running
- Redis 7+ installed and running (optional for development)

## Installation Steps

### 1. Install Python Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Update the `.env` file with your local configuration:

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/bowman_insurance
# Or individual settings:
DB_NAME=bowman_insurance
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis (Optional for development)
REDIS_URL=redis://localhost:6379/0

# CORS (for development)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Set Up PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE bowman_insurance;

# Create user (optional)
CREATE USER bowman_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bowman_insurance TO bowman_user;

# Exit
\q
```

### 4. Run Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### 5. Create Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin user.

### 6. Load Initial Data (Optional)

If you have fixtures or sample data:

```bash
python manage.py loaddata initial_data.json
```

### 7. Run Development Server

```bash
python manage.py runserver
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **Schema**: http://localhost:8000/api/schema/
- **Admin Panel**: http://localhost:8000/admin/

## Running with Docker (Alternative)

If you prefer using Docker:

```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# View logs
docker-compose logs -f backend
```

## Testing the Setup

### 1. Check API Health

```bash
curl http://localhost:8000/api/v1/auth/register/
```

Should return a 405 Method Not Allowed (GET not supported) or the API schema.

### 2. Test User Registration

```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "first_name": "Test",
    "last_name": "User",
    "phone": "+254712345678"
  }'
```

### 3. Access Admin Panel

1. Go to http://localhost:8000/admin/
2. Login with your superuser credentials
3. You should see all registered models

## Troubleshooting

### Issue: Python not found

**Solution**: Install Python 3.11+ from [python.org](https://www.python.org/downloads/) or Microsoft Store

### Issue: PostgreSQL connection error

**Solution**:
- Ensure PostgreSQL is running: `pg_ctl status`
- Check connection details in `.env` file
- Verify database exists: `psql -U postgres -l`

### Issue: Redis connection error

**Solution**:
- Redis is optional for development
- Comment out Redis-related settings in `settings/development.py`
- Or install Redis from [redis.io](https://redis.io/download)

### Issue: Migration errors

**Solution**:
```bash
# Reset migrations (BE CAREFUL - this deletes data)
python manage.py migrate --fake-initial

# Or drop and recreate database
dropdb bowman_insurance
createdb bowman_insurance
python manage.py migrate
```

### Issue: Static files not loading

**Solution**:
```bash
python manage.py collectstatic --no-input
```

## Running Celery (For Background Tasks)

### Start Celery Worker

```bash
# In a new terminal
celery -A bowman_insurance worker -l info
```

### Start Celery Beat (Scheduled Tasks)

```bash
# In another terminal
celery -A bowman_insurance beat -l info
```

## Next Steps

After successful setup:

1. ✅ Test user registration endpoint
2. ✅ Test login endpoint
3. ✅ Access admin panel
4. ✅ Create sample insurance companies
5. ✅ Create sample policy types
6. ✅ Test policy creation
7. ✅ Connect frontend to backend

## Development Workflow

1. **Make model changes**: Edit models in `apps/*/models.py`
2. **Create migrations**: `python manage.py makemigrations`
3. **Apply migrations**: `python manage.py migrate`
4. **Test changes**: Write tests in `apps/*/tests.py`
5. **Run tests**: `python manage.py test`

## Common Commands

```bash
# Create new app
python manage.py startapp app_name

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver

# Run tests
python manage.py test

# Run specific test
python manage.py test apps.users.tests.test_views

# Django shell
python manage.py shell

# Database shell
python manage.py dbshell

# Check for issues
python manage.py check

# Show migrations
python manage.py showmigrations

# Collect static files
python manage.py collectstatic
```

## Project Structure

```
backend/
├── apps/
│   ├── users/          # User authentication & profiles
│   ├── policies/       # Insurance policies
│   ├── payments/       # Payment processing
│   ├── claims/         # Claims management
│   ├── documents/      # Document storage
│   ├── notifications/  # Email/SMS/WhatsApp
│   ├── workflows/      # Policy workflows
│   └── analytics/      # User analytics
├── bowman_insurance/
│   ├── settings/       # Configuration files
│   ├── urls.py         # URL routing
│   ├── celery.py       # Celery configuration
│   └── wsgi.py         # WSGI configuration
├── requirements.txt    # Python dependencies
├── manage.py          # Django management script
├── Dockerfile         # Docker configuration
└── docker-compose.yml # Docker Compose setup
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/` - User registration
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/logout/` - User logout
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token
- `GET /api/v1/auth/verify/` - Verify JWT token
- `GET /api/v1/auth/profile/` - Get user profile
- `PUT /api/v1/auth/profile/` - Update user profile
- `POST /api/v1/auth/change-password/` - Change password
- `POST /api/v1/auth/password-reset/request/` - Request password reset
- `POST /api/v1/auth/password-reset/confirm/` - Confirm password reset
- `GET /api/v1/auth/notification-preferences/` - Get notification preferences
- `PUT /api/v1/auth/notification-preferences/` - Update notification preferences

### Policies (To be implemented in next phases)
- `GET /api/v1/policies/` - List all policies
- `GET /api/v1/policies/<id>/` - Get policy details
- `POST /api/v1/policies/` - Create policy
- `PUT /api/v1/policies/<id>/` - Update policy

### More endpoints will be added as we progress through the phases

## Environment Variables Reference

See `.env.example` for a complete list of environment variables.

---

**Status**: Backend infrastructure complete ✅
**Next**: Continue with Phase 4 (Authentication Pages) or deploy frontend to Vercel
