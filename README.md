# Bowman Insurance - Digital Insurance Platform

A comprehensive digital insurance marketplace and management platform for Bowman Insurance Agency.

## Project Overview

This platform enables customers to browse, compare, purchase, and manage insurance policies from multiple insurance companies through a single unified digital interface.

### Key Features

- **Insurance Marketplace**: E-commerce style policy browsing and purchasing
- **Customer Dashboard**: Self-service policy management
- **Admin Panel**: Comprehensive management tools for agency staff
- **Workflow Engine**: Automated policy lifecycle management
- **Payment Integration**: M-Pesa and Paystack support
- **Claims Management**: End-to-end claims processing
- **Multi-channel Notifications**: Email, SMS, and WhatsApp
- **Document Management**: Certificate generation and storage

## Project Structure

```
bowman-insurance/
├── backend/                    # Django REST API
│   ├── bowman_insurance/       # Project configuration
│   ├── apps/                   # Django applications
│   │   ├── users/              # User management
│   │   ├── policies/           # Policy management
│   │   ├── payments/           # Payment processing
│   │   ├── claims/             # Claims management
│   │   ├── documents/          # Document management
│   │   ├── notifications/      # Notification system
│   │   ├── workflows/          # Workflow engine
│   │   └── analytics/          # Analytics & reporting
│   ├── requirements.txt        # Python dependencies
│   ├── docker-compose.yml      # Docker configuration
│   └── README.md               # Backend documentation
│
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/                # Next.js App Router
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities and hooks
│   │   ├── store/              # State management
│   │   └── types/              # TypeScript types
│   ├── package.json            # Node dependencies
│   └── README.md               # Frontend documentation
│
├── Technical_Specifications.pdf     # Full specifications
├── IMPLEMENTATION_PLAN.md           # Detailed implementation plan
└── README.md                        # This file
```

## Technology Stack

### Backend
- **Framework**: Django 5.0 + Django REST Framework
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Task Queue**: Celery
- **Authentication**: JWT
- **Storage**: AWS S3
- **Payment Gateways**: M-Pesa Daraja API, Paystack
- **Notifications**: SendGrid, Africa's Talking

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Hosting**: Vercel (frontend), AWS/DigitalOcean (backend)
- **CDN**: CloudFlare
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Containerization**: Docker

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend API: http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Frontend: http://localhost:3000

### Using Docker

```bash
# Start all services
cd backend
docker-compose up --build

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## Development Workflow

1. **Backend Development**
   - API endpoints in `backend/apps/*/views.py`
   - Models in `backend/apps/*/models.py`
   - Tests in `backend/apps/*/tests.py`
   - Run tests: `pytest`

2. **Frontend Development**
   - Pages in `frontend/src/app/`
   - Components in `frontend/src/components/`
   - API calls in `frontend/src/lib/api/`
   - Run tests: `npm test`

3. **Code Quality**
   - Backend: `black . && flake8`
   - Frontend: `npm run lint && npm run type-check`

## Project Phases

The implementation is divided into 13 phases:

1. ✅ **Foundation & Setup** - Project structure and configuration
2. **Core Backend Architecture** - Database models and authentication
3. **Frontend Foundation** - Next.js setup and UI framework
4. **Insurance Marketplace** - Policy browsing and purchasing
5. **Payment Integration** - M-Pesa and Paystack
6. **Customer Dashboard** - Self-service portal
7. **Claims Management** - Claims filing and processing
8. **Admin Panel** - Management interface
9. **Workflow Engine** - Policy lifecycle automation
10. **Notifications** - Email, SMS, WhatsApp
11. **Document Management** - Certificate generation
12. **Testing & Optimization** - Performance and security
13. **Deployment & Launch** - Production deployment

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for detailed breakdown.

## API Documentation

Once the backend is running:
- **Swagger UI**: http://localhost:8000/api/docs/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## Key Endpoints

```
POST   /api/v1/auth/register/       - User registration
POST   /api/v1/auth/login/          - User login
GET    /api/v1/policies/            - List policies
POST   /api/v1/policies/purchase/   - Purchase policy
GET    /api/v1/claims/              - List claims
POST   /api/v1/payments/mpesa/      - M-Pesa payment
```

## Environment Variables

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost:5432/bowman_insurance
REDIS_URL=redis://localhost:6379/0
MPESA_CONSUMER_KEY=your-key
PAYSTACK_SECRET_KEY=your-key
AWS_ACCESS_KEY_ID=your-key
SENDGRID_API_KEY=your-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_ENVIRONMENT=development
```

## Testing

### Backend
```bash
cd backend
pytest                      # Run all tests
pytest --cov               # With coverage
pytest apps/users/tests.py # Specific app
```

### Frontend
```bash
cd frontend
npm test                   # Run all tests
npm run test:coverage     # With coverage
```

## Deployment

### Backend (Production)
```bash
# Set environment to production
export DJANGO_SETTINGS_MODULE=bowman_insurance.settings.production

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Start with Gunicorn
gunicorn --bind 0.0.0.0:8000 --workers 3 bowman_insurance.wsgi
```

### Frontend (Vercel)
1. Push to GitHub
2. Import in Vercel
3. Configure environment variables
4. Deploy

## Performance Targets

- Page Load Time: <3 seconds (3G network)
- API Response Time: <200ms (95th percentile)
- Concurrent Users: 10,000+
- Uptime: 99.9%
- Mobile Performance Score: >90

## Security

- HTTPS/SSL for all communications
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- PCI-DSS compliant payment processing
- Kenya Data Protection Act compliance
- Regular security audits

## Support

- **Documentation**: See READMEs in backend/ and frontend/
- **API Docs**: http://localhost:8000/api/docs/
- **Implementation Plan**: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- **Technical Specs**: [Technical_Specifications.pdf](Technical_Specifications.pdf)

## Team

- Project Manager
- Senior Full-Stack Developer
- Frontend Developers (2)
- Backend Developers (2)
- UI/UX Designer
- QA Engineer
- DevOps Engineer

## License

Proprietary - Bowman Insurance Agency
Copyright © 2026 Bowman Insurance Agency. All rights reserved.

---

**Status**: Phase 1 Complete ✅ - Foundation & Setup
**Next**: Phase 2 - Core Backend Architecture

For detailed implementation guide, see [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
