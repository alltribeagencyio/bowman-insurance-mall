from django.contrib import admin
from .models import WorkflowStage


@admin.register(WorkflowStage)
class WorkflowStageAdmin(admin.ModelAdmin):
    """Admin interface for WorkflowStage model"""

    list_display = (
        'policy', 'stage_name', 'status',
        'assigned_to', 'created_at', 'completed_at'
    )
    list_filter = ('stage_name', 'status', 'created_at', 'completed_at')
    search_fields = (
        'policy__policy_number', 'notes',
        'assigned_to__email', 'assigned_to__first_name', 'assigned_to__last_name'
    )
    readonly_fields = ('created_at', 'updated_at', 'started_at', 'completed_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('policy', 'stage_name', 'status')}),
        ('Assignment', {'fields': ('assigned_to',)}),
        ('Details', {'fields': ('notes', 'metadata')}),
        ('Timestamps', {'fields': (
            'created_at', 'updated_at', 'started_at', 'completed_at'
        )}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('policy', 'assigned_to', 'policy__user', 'policy__policy_type')

    actions = ['mark_as_completed', 'mark_as_in_progress']

    def mark_as_completed(self, request, queryset):
        """Action to mark selected stages as completed"""
        from django.utils import timezone
        updated = queryset.update(status='completed', completed_at=timezone.now())
        self.message_user(request, f'{updated} workflow stage(s) marked as completed.')

    mark_as_completed.short_description = 'Mark selected stages as completed'

    def mark_as_in_progress(self, request, queryset):
        """Action to mark selected stages as in progress"""
        from django.utils import timezone
        updated = queryset.filter(status='pending').update(
            status='in_progress',
            started_at=timezone.now()
        )
        self.message_user(request, f'{updated} workflow stage(s) marked as in progress.')

    mark_as_in_progress.short_description = 'Mark selected stages as in progress'
