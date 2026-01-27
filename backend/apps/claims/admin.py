from django.contrib import admin
from .models import Claim, ClaimDocument, ClaimStatusHistory, ClaimSettlement


class ClaimDocumentInline(admin.TabularInline):
    """Inline admin for ClaimDocument"""
    model = ClaimDocument
    extra = 0
    readonly_fields = ('uploaded_at',)


class ClaimStatusHistoryInline(admin.TabularInline):
    """Inline admin for ClaimStatusHistory"""
    model = ClaimStatusHistory
    extra = 0
    readonly_fields = ('changed_at', 'changed_by')
    fields = ('old_status', 'new_status', 'notes', 'changed_by', 'changed_at')


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    """Admin interface for Claim model"""

    list_display = (
        'claim_number', 'policy', 'user', 'claim_type',
        'status', 'claim_amount', 'incident_date', 'created_at'
    )
    list_filter = ('status', 'claim_type', 'incident_date', 'created_at')
    search_fields = (
        'claim_number', 'policy__policy_number',
        'user__email', 'user__first_name', 'user__last_name'
    )
    readonly_fields = ('claim_number', 'created_at', 'updated_at')
    date_hierarchy = 'incident_date'
    inlines = [ClaimDocumentInline, ClaimStatusHistoryInline]

    fieldsets = (
        (None, {'fields': ('claim_number', 'policy', 'user')}),
        ('Claim Details', {'fields': (
            'claim_type', 'status', 'claim_amount',
            'approved_amount', 'currency'
        )}),
        ('Incident Information', {'fields': (
            'incident_date', 'incident_location', 'description'
        )}),
        ('Assessment', {'fields': (
            'assessor', 'assessor_notes', 'assessment_date'
        )}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('policy', 'user', 'assessor', 'policy__policy_type')


@admin.register(ClaimDocument)
class ClaimDocumentAdmin(admin.ModelAdmin):
    """Admin interface for ClaimDocument model"""

    list_display = (
        'claim', 'document_type', 'file_name',
        'is_verified', 'uploaded_at'
    )
    list_filter = ('document_type', 'is_verified', 'uploaded_at')
    search_fields = ('claim__claim_number', 'file_name', 'description')
    readonly_fields = ('uploaded_at',)

    fieldsets = (
        (None, {'fields': ('claim', 'document_type')}),
        ('File Information', {'fields': ('file', 'file_name', 'file_size')}),
        ('Description', {'fields': ('description',)}),
        ('Verification', {'fields': ('is_verified', 'verified_by', 'verification_notes')}),
        ('Timestamps', {'fields': ('uploaded_at',)}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('claim', 'verified_by')


@admin.register(ClaimStatusHistory)
class ClaimStatusHistoryAdmin(admin.ModelAdmin):
    """Admin interface for ClaimStatusHistory model"""

    list_display = (
        'claim', 'old_status', 'new_status',
        'changed_by', 'changed_at'
    )
    list_filter = ('old_status', 'new_status', 'changed_at')
    search_fields = ('claim__claim_number', 'notes', 'changed_by__email')
    readonly_fields = ('changed_at', 'changed_by')

    fieldsets = (
        (None, {'fields': ('claim',)}),
        ('Status Change', {'fields': ('old_status', 'new_status')}),
        ('Change Details', {'fields': ('changed_by', 'notes', 'changed_at')}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('claim', 'changed_by')


@admin.register(ClaimSettlement)
class ClaimSettlementAdmin(admin.ModelAdmin):
    """Admin interface for ClaimSettlement model"""

    list_display = (
        'settlement_number', 'claim', 'settlement_amount',
        'settlement_method', 'status', 'settlement_date'
    )
    list_filter = ('settlement_method', 'status', 'settlement_date')
    search_fields = (
        'settlement_number', 'claim__claim_number',
        'payee_name', 'account_number'
    )
    readonly_fields = ('settlement_number', 'created_at', 'updated_at')
    date_hierarchy = 'settlement_date'

    fieldsets = (
        (None, {'fields': ('settlement_number', 'claim')}),
        ('Settlement Details', {'fields': (
            'settlement_amount', 'currency',
            'settlement_method', 'status', 'settlement_date'
        )}),
        ('Payee Information', {'fields': (
            'payee_name', 'account_number', 'bank_name'
        )}),
        ('Processing', {'fields': ('processed_by', 'notes')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('claim', 'processed_by', 'claim__policy')
