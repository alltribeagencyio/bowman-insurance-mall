from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, NotificationPreference


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""

    list_display = ('email', 'first_name', 'last_name', 'role', 'is_verified', 'is_active', 'created_at')
    list_filter = ('role', 'is_verified', 'is_active', 'is_staff', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'phone', 'id_number')
    ordering = ('-created_at',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal Info'), {'fields': ('first_name', 'last_name', 'phone', 'id_number', 'kra_pin')}),
        (_('Permissions'), {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Verification'), {'fields': ('is_verified', 'email_verified_at', 'phone_verified_at')}),
        (_('Important dates'), {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'phone', 'role'),
        }),
    )

    readonly_fields = ('created_at', 'updated_at', 'last_login', 'email_verified_at', 'phone_verified_at')


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    """Admin interface for NotificationPreference model"""

    list_display = ('user', 'email_notifications', 'sms_notifications', 'whatsapp_notifications', 'updated_at')
    list_filter = ('email_notifications', 'sms_notifications', 'whatsapp_notifications')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {'fields': ('user',)}),
        ('Email Preferences', {'fields': (
            'email_notifications',
            'policy_updates_email',
            'payment_reminders_email',
            'claims_updates_email',
            'marketing_email',
        )}),
        ('SMS Preferences', {'fields': (
            'sms_notifications',
            'policy_updates_sms',
            'payment_reminders_sms',
            'claims_updates_sms',
        )}),
        ('WhatsApp Preferences', {'fields': (
            'whatsapp_notifications',
            'policy_updates_whatsapp',
            'payment_reminders_whatsapp',
            'claims_updates_whatsapp',
        )}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
