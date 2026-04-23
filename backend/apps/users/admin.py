from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, NotificationPreference


@admin.register(User)
class UserAdmin(BaseUserAdmin):
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
    list_display = ('user', 'email_policy_updates', 'sms_policy_updates', 'whatsapp_enabled', 'updated_at')
    list_filter = ('email_policy_updates', 'sms_policy_updates', 'whatsapp_enabled')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {'fields': ('user',)}),
        ('Email Preferences', {'fields': (
            'email_policy_updates', 'email_payment_reminders',
            'email_claim_updates', 'email_marketing',
        )}),
        ('SMS Preferences', {'fields': (
            'sms_policy_updates', 'sms_payment_reminders', 'sms_claim_updates',
        )}),
        ('Other Channels', {'fields': ('whatsapp_enabled', 'in_app_enabled')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
