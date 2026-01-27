# Bowman Insurance - Backend API

Django REST API for the Bowman Insurance digital platform.

## Tech Stack

- **Framework:** Django 5.0
- **API:** Django REST Framework 3.14+
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Task Queue:** Celery 5.x
- **Authentication:** JWT (Simple JWT)
- **File Storage:** AWS S3
- **Payment Gateways:** M-Pesa, Paystack
- **Notifications:** SendGrid, Africa's Talking

## Project Structure

```
backend/
├── bowman_insurance/          # Project configuration
│   ├── settings/              # Settings (base, development, production)
│   ├── urls.py                # URL routing
│   ├── wsgi.py                # WSGI application
│   ├── asgi.py                # ASGI application
│   └── celery.py              # Celery configuration
├── apps/                      # Django apps
│   ├── users/                 # User management & authentication
│   ├── policies/              # Policy management
│   ├── payments/              # Payment processing
│   ├── claims/                # Claims management
│   ├── documents/             # Document management
│   ├── notifications/         # Notification system
│   ├── workflows/             # Workflow engine
│   └── analytics/             # Analytics & reporting
├── tests/                     # Test files
├── static/                    # Static files
├── media/                     # Media files (local development)
├── templates/                 # Email templates
└── logs/                      # Application logs
```

## Setup Instructions

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Create database**
   ```bash
   createdb bowman_insurance
   ```

6. **Run migrations**
   ```bash
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

8. **Run development server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000`

### Using Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Run migrations**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

3. **Create superuser**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## Running Celery

### Development (separate terminals)

```bash
# Terminal 1: Celery worker
celery -A bowman_insurance worker -l info

# Terminal 2: Celery beat (scheduled tasks)
celery -A bowman_insurance beat -l info
```

### Docker

```bash
docker-compose up celery celery-beat
```

## Testing

### Run all tests
```bash
pytest
```

### Run with coverage
```bash
pytest --cov=apps --cov-report=html
```

### Run specific app tests
```bash
pytest apps/users/tests.py
```

## API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/api/docs/
- **OpenAPI Schema:** http://localhost:8000/api/schema/

## Code Quality

### Format code
```bash
black .
isort .
```

### Lint code
```bash
flake8
```

## Common Django Commands

```bash
# Create new app
python manage.py startapp app_name

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Open Django shell
python manage.py shell
```

## Environment Variables

Key environment variables (see `.env.example` for complete list):

- `DEBUG` - Debug mode (True/False)
- `SECRET_KEY` - Django secret key
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `MPESA_CONSUMER_KEY` - M-Pesa API key
- `PAYSTACK_SECRET_KEY` - Paystack API key
- `SENDGRID_API_KEY` - SendGrid API key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

## Deployment

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up AWS S3 for media files
- [ ] Configure email backend (SendGrid)
- [ ] Set up Sentry for error tracking
- [ ] Enable HTTPS/SSL
- [ ] Configure allowed hosts
- [ ] Set up backups
- [ ] Configure monitoring

### Deploy to production

```bash
# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Start with Gunicorn
gunicorn --bind 0.0.0.0:8000 --workers 3 bowman_insurance.wsgi:application
```

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Redis connection issues
- Ensure Redis is running: `redis-cli ping`
- Check Redis URL in `.env`

### Import errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

## Contributing

1. Create feature branch
2. Make changes
3. Run tests
4. Format code (black, isort)
5. Submit pull request

## License

Proprietary - Bowman Insurance Agency
