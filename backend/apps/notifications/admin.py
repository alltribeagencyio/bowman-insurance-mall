from django.contrib import admin
from .models import Notification, EmailLog, SMSLog


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'title', 'read', 'created_at')
    list_filter = ('type', 'read', 'created_at')
    search_fields = ('user__email', 'title', 'message')
    readonly_fields = ('created_at', 'read_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('user',)}),
        ('Notification Details', {'fields': ('type', 'title', 'message', 'action_url')}),
        ('Status', {'fields': ('read', 'read_at')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = ('to_email', 'subject', 'status', 'sent_at', 'created_at')
    list_filter = ('status', 'sent_at', 'created_at')
    search_fields = ('to_email', 'subject', 'error_message')
    readonly_fields = ('created_at', 'sent_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('user',)}),
        ('Email Details', {'fields': ('to_email', 'subject', 'template')}),
        ('Status', {'fields': ('status', 'error_message', 'sent_at')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(SMSLog)
class SMSLogAdmin(admin.ModelAdmin):
    list_display = ('to_phone', 'status', 'sent_at', 'created_at')
    list_filter = ('status', 'sent_at', 'created_at')
    search_fields = ('to_phone', 'message', 'error_message')
    readonly_fields = ('created_at', 'sent_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('user',)}),
        ('SMS Details', {'fields': ('to_phone', 'message')}),
        ('Status', {'fields': ('status', 'error_message', 'provider_response', 'sent_at')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
