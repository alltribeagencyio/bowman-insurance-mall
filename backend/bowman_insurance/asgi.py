"""
ASGI config for bowman_insurance project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bowman_insurance.settings.production')

application = get_asgi_application()
