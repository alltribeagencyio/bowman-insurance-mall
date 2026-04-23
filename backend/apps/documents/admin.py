from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('filename', 'type', 'user', 'policy', 'file_size', 'is_verified', 'uploaded_at')
    list_filter = ('type', 'is_verified', 'uploaded_at')
    search_fields = ('filename', 'user__email', 'policy__policy_number', 's3_key')
    readonly_fields = ('uploaded_at', 'updated_at')
    date_hierarchy = 'uploaded_at'

    fieldsets = (
        (None, {'fields': ('user', 'policy')}),
        ('Document Details', {'fields': ('type', 'title', 'filename', 'file_size', 'mime_type', 's3_key')}),
        ('Verification', {'fields': ('is_verified', 'verified_by', 'verified_at')}),
        ('Timestamps', {'fields': ('uploaded_at', 'updated_at')}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'policy', 'verified_by')
