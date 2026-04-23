from django.contrib import admin
from .models import Claim, ClaimDocument, ClaimStatusHistory, ClaimSettlement


class ClaimDocumentInline(admin.TabularInline):
    model = ClaimDocument
    extra = 0
    readonly_fields = ('uploaded_at',)


class ClaimStatusHistoryInline(admin.TabularInline):
    model = ClaimStatusHistory
    extra = 0
    readonly_fields = ('changed_at', 'changed_by')
    fields = ('old_status', 'new_status', 'notes', 'changed_by', 'changed_at')


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = (
        'claim_number', 'policy', 'user', 'type',
        'status', 'amount_claimed', 'incident_date', 'filed_date'
    )
    list_filter = ('status', 'type', 'incident_date', 'filed_date')
    search_fields = (
        'claim_number', 'policy__policy_number',
        'user__email', 'user__first_name', 'user__last_name'
    )
    readonly_fields = ('claim_number', 'filed_date', 'updated_at')
    date_hierarchy = 'incident_date'
    inlines = [ClaimDocumentInline, ClaimStatusHistoryInline]

    fieldsets = (
        (None, {'fields': ('claim_number', 'policy', 'user')}),
        ('Claim Details', {'fields': (
            'type', 'status', 'amount_claimed', 'amount_approved'
        )}),
        ('Incident Information', {'fields': (
            'incident_date', 'incident_location', 'description'
        )}),
        ('Assessment', {'fields': (
            'assessor', 'assessor_notes', 'assessment_date', 'rejection_reason'
        )}),
        ('Timestamps', {'fields': ('filed_date', 'updated_at')}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'policy', 'user', 'assessor', 'policy__policy_type'
        )


@admin.register(ClaimDocument)
class ClaimDocumentAdmin(admin.ModelAdmin):
    list_display = ('claim', 'document_type', 'title', 'uploaded_at')
    list_filter = ('document_type', 'uploaded_at')
    search_fields = ('claim__claim_number', 'title')
    readonly_fields = ('uploaded_at',)

    fieldsets = (
        (None, {'fields': ('claim', 'document_type')}),
        ('File Information', {'fields': ('title', 'file_url', 'file_size', 'mime_type')}),
        ('Timestamps', {'fields': ('uploaded_at',)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('claim', 'uploaded_by')


@admin.register(ClaimStatusHistory)
class ClaimStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('claim', 'from_status', 'to_status', 'changed_by', 'changed_at')
    list_filter = ('from_status', 'to_status', 'changed_at')
    search_fields = ('claim__claim_number', 'notes', 'changed_by__email')
    readonly_fields = ('changed_at', 'changed_by')

    fieldsets = (
        (None, {'fields': ('claim',)}),
        ('Status Change', {'fields': ('from_status', 'to_status')}),
        ('Change Details', {'fields': ('changed_by', 'notes', 'changed_at')}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('claim', 'changed_by')


@admin.register(ClaimSettlement)
class ClaimSettlementAdmin(admin.ModelAdmin):
    list_display = ('claim', 'amount', 'payment_method', 'reference_number', 'created_at', 'processed_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('claim__claim_number', 'reference_number', 'account_number')
    readonly_fields = ('created_at', 'processed_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('claim',)}),
        ('Settlement Details', {'fields': ('amount', 'payment_method', 'reference_number')}),
        ('Payee Information', {'fields': ('bank_name', 'account_number', 'mpesa_phone', 'cheque_number')}),
        ('Processing', {'fields': ('processed_by', 'notes')}),
        ('Timestamps', {'fields': ('created_at', 'processed_at')}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('claim', 'processed_by')
