from django.contrib import admin
from .models import Notification, EmailLog, SMSLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification model"""

    list_display = (
        'user', 'notification_type', 'channel',
        'is_read', 'sent_at', 'created_at'
    )
    list_filter = ('notification_type', 'channel', 'is_read', 'sent_at', 'created_at')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('created_at', 'sent_at', 'read_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('user',)}),
        ('Notification Details', {'fields': (
            'notification_type', 'channel', 'title', 'message'
        )}),
        ('Status', {'fields': ('is_read', 'read_at', 'sent_at')}),
        ('Metadata', {'fields': ('metadata',)}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    """Admin interface for EmailLog model"""

    list_display = (
        'recipient_email', 'subject', 'status',
        'provider', 'sent_at', 'created_at'
    )
    list_filter = ('status', 'provider', 'sent_at', 'created_at')
    search_fields = ('recipient_email', 'subject', 'message_id', 'error_message')
    readonly_fields = ('created_at', 'sent_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('user', 'notification')}),
        ('Email Details', {'fields': (
            'recipient_email', 'subject', 'body', 'html_body'
        )}),
        ('Provider', {'fields': ('provider', 'message_id')}),
        ('Status', {'fields': ('status', 'error_message', 'sent_at')}),
        ('Metadata', {'fields': ('metadata',)}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'notification')


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    """Admin interface for SMSLog model"""

    list_display = (
        'recipient_phone', 'status', 'provider',
        'sent_at', 'created_at'
    )
    list_filter = ('status', 'provider', 'sent_at', 'created_at')
    search_fields = ('recipient_phone', 'message', 'message_id', 'error_message')
    readonly_fields = ('created_at', 'sent_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('user', 'notification')}),
        ('SMS Details', {'fields': ('recipient_phone', 'message')}),
        ('Provider', {'fields': ('provider', 'message_id')}),
        ('Status', {'fields': ('status', 'error_message', 'sent_at')}),
        ('Metadata', {'fields': ('metadata',)}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'notification')
