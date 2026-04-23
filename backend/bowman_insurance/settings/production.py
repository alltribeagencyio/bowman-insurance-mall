"""Production settings"""

from .base import *

DEBUG = False

_allowed = os.getenv('ALLOWED_HOSTS', '')
if not _allowed:
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured("ALLOWED_HOSTS environment variable must be set in production.")
ALLOWED_HOSTS = [h.strip() for h in _allowed.split(',') if h.strip()]

# EasyPanel/reverse-proxy: SSL is terminated at the proxy, not Django.
# SECURE_SSL_REDIRECT would cause redirect loops behind a proxy.
SECURE_SSL_REDIRECT = False
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = [o.strip() for o in os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if o.strip()]
if not CSRF_TRUSTED_ORIGINS:
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured("CSRF_TRUSTED_ORIGINS must be set in production (e.g. https://api.yourdomain.com,https://app.yourdomain.com).")
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Sentry (optional — only initialise if DSN is provided)
_sentry_dsn = os.getenv('SENTRY_DSN')
if _sentry_dsn:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    sentry_sdk.init(
        dsn=_sentry_dsn,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,
        environment='production',
    )

# Use SendGrid in production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Redis Cache (replaces LocMemCache from base.py)
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'TIMEOUT': 300,
    }
}

# Static files (WhiteNoise)
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
