"""
Celery configuration for Bowman Insurance project.
"""

import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bowman_insurance.settings.development')

app = Celery('bowman_insurance')

# Load config from Django settings with CELERY namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Autodiscover tasks in all installed apps
app.autodiscover_tasks()

# Celery Beat Schedule (Periodic Tasks)
app.conf.beat_schedule = {
    'send-payment-reminders-daily': {
        'task': 'apps.payments.tasks.send_payment_reminders',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9:00 AM
    },
    'check-expiring-policies': {
        'task': 'apps.policies.tasks.check_expiring_policies',
        'schedule': crontab(hour=8, minute=0),  # Run daily at 8:00 AM
    },
    'cleanup-expired-tokens': {
        'task': 'apps.users.tasks.cleanup_expired_tokens',
        'schedule': crontab(hour=2, minute=0),  # Run daily at 2:00 AM
    },
    'cleanup-old-notifications': {
        'task': 'apps.notifications.tasks.cleanup_old_notifications',
        'schedule': crontab(day_of_week=0, hour=3, minute=0),  # Run weekly on Sunday at 3:00 AM
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
