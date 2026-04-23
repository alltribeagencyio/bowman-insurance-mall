"""Development settings"""

from .base import *
import os

DEBUG = True

# Allow override from environment variable for Coolify/Docker deployments
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,0.0.0.0').split(',')

# Add debug toolbar for development
INSTALLED_APPS += ['debug_toolbar']
MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']

INTERNAL_IPS = ['127.0.0.1']

# Use console email backend in development
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')

# Disable HTTPS redirects in development
SECURE_SSL_REDIRECT = False

# Run Celery tasks synchronously (no Redis needed locally)
CELERY_TASK_ALWAYS_EAGER = os.getenv('CELERY_TASK_ALWAYS_EAGER', 'True') == 'True'
CELERY_TASK_EAGER_PROPAGATES = os.getenv('CELERY_TASK_EAGER_PROPAGATES', 'True') == 'True'

# Use local file storage instead of S3 in development
if not os.getenv('AWS_ACCESS_KEY_ID') or os.getenv('AWS_ACCESS_KEY_ID') == 'local-dev-placeholder':
    DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
    MEDIA_ROOT = BASE_DIR / 'media'
