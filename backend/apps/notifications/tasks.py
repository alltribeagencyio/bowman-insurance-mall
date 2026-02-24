"""Notification Celery tasks"""
from celery import shared_task


@shared_task
def send_email_notification(user_id, template, context):
    # TODO Phase 10: SendGrid integration
    pass


@shared_task
def send_sms_notification(user_id, message):
    # TODO Phase 10: Africa's Talking integration
    pass
