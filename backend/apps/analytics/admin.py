from django.contrib import admin
from .models import UserActivity


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    """Admin interface for UserActivity model"""

    list_display = (
        'user', 'action', 'resource_type',
        'resource_id', 'ip_address', 'timestamp'
    )
    list_filter = ('action', 'resource_type', 'timestamp')
    search_fields = (
        'user__email', 'user__first_name', 'user__last_name',
        'resource_id', 'ip_address', 'user_agent'
    )
    readonly_fields = ('timestamp',)
    date_hierarchy = 'timestamp'

    fieldsets = (
        (None, {'fields': ('user', 'action')}),
        ('Resource', {'fields': ('resource_type', 'resource_id')}),
        ('Request Info', {'fields': ('ip_address', 'user_agent')}),
        ('Metadata', {'fields': ('metadata',)}),
        ('Timestamps', {'fields': ('timestamp',)}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')

    def has_add_permission(self, request):
        """Disable manual creation of activity logs"""
        return False

    def has_change_permission(self, request, obj=None):
        """Make activity logs read-only"""
        return False
