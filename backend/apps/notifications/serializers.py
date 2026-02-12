"""Serializers for Notifications App"""
from rest_framework import serializers
from .models import Notification, EmailLog, SMSLog


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""

    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'title', 'message',
            'action_url', 'read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'read_at']


class EmailLogSerializer(serializers.ModelSerializer):
    """Serializer for email logs"""

    class Meta:
        model = EmailLog
        fields = [
            'id', 'user', 'to_email', 'subject', 'template',
            'status', 'error_message', 'sent_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SMSLogSerializer(serializers.ModelSerializer):
    """Serializer for SMS logs"""

    class Meta:
        model = SMSLog
        fields = [
            'id', 'user', 'to_phone', 'message', 'status',
            'error_message', 'sent_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
