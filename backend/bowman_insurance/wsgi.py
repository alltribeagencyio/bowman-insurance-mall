"""
WSGI config for bowman_insurance project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bowman_insurance.settings.production')

application = get_wsgi_application()
