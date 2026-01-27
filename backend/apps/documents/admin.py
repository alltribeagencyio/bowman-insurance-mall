from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin interface for Document model"""

    list_display = (
        'file_name', 'document_type', 'user', 'policy',
        'file_size', 'is_verified', 'uploaded_at'
    )
    list_filter = ('document_type', 'is_verified', 'uploaded_at')
    search_fields = (
        'file_name', 'user__email', 'policy__policy_number',
        's3_key', 'description'
    )
    readonly_fields = ('uploaded_at',)
    date_hierarchy = 'uploaded_at'

    fieldsets = (
        (None, {'fields': ('user', 'policy', 'claim')}),
        ('Document Details', {'fields': (
            'document_type', 'file_name', 'file_size',
            's3_key', 's3_url'
        )}),
        ('Description', {'fields': ('description',)}),
        ('Verification', {'fields': (
            'is_verified', 'verified_by', 'verification_notes', 'verified_at'
        )}),
        ('Metadata', {'fields': ('metadata',)}),
        ('Timestamps', {'fields': ('uploaded_at',)}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'policy', 'claim', 'verified_by')
