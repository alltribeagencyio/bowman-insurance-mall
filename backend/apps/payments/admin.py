from django.contrib import admin
from .models import Transaction, PaymentSchedule, Refund


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    """Admin interface for Transaction model"""

    list_display = (
        'transaction_number', 'user', 'policy', 'amount', 'payment_method',
        'status', 'created_at'
    )
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = (
        'transaction_number', 'user__email', 'policy__policy_number',
        'mpesa_receipt', 'paystack_reference'
    )
    readonly_fields = (
        'transaction_number', 'created_at', 'updated_at',
        'completed_at', 'failed_at'
    )
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('transaction_number', 'user', 'policy')}),
        ('Payment Details', {'fields': (
            'amount', 'currency', 'payment_method', 'status'
        )}),
        ('Gateway Information', {'fields': (
            'mpesa_receipt', 'mpesa_phone',
            'paystack_reference', 'paystack_authorization_code'
        )}),
        ('Metadata', {'fields': ('metadata',)}),
        ('Timestamps', {'fields': (
            'created_at', 'updated_at', 'completed_at', 'failed_at'
        )}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user', 'policy', 'policy__policy_type')


@admin.register(PaymentSchedule)
class PaymentScheduleAdmin(admin.ModelAdmin):
    """Admin interface for PaymentSchedule model"""

    list_display = (
        'policy', 'amount', 'due_date', 'status',
        'is_paid', 'created_at'
    )
    list_filter = ('status', 'is_paid', 'due_date', 'created_at')
    search_fields = ('policy__policy_number', 'policy__user__email')
    readonly_fields = ('created_at', 'updated_at', 'paid_at')
    date_hierarchy = 'due_date'

    fieldsets = (
        (None, {'fields': ('policy', 'transaction')}),
        ('Payment Details', {'fields': ('amount', 'currency', 'due_date')}),
        ('Status', {'fields': ('status', 'is_paid', 'paid_at')}),
        ('Reminders', {'fields': ('reminder_sent_at',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('policy', 'transaction', 'policy__user')


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    """Admin interface for Refund model"""

    list_display = (
        'refund_number', 'transaction', 'amount', 'status',
        'requested_at', 'processed_at'
    )
    list_filter = ('status', 'requested_at', 'processed_at')
    search_fields = (
        'refund_number', 'transaction__transaction_number',
        'transaction__user__email'
    )
    readonly_fields = ('refund_number', 'requested_at', 'processed_at')
    date_hierarchy = 'requested_at'

    fieldsets = (
        (None, {'fields': ('refund_number', 'transaction')}),
        ('Refund Details', {'fields': ('amount', 'currency', 'reason')}),
        ('Status', {'fields': ('status',)}),
        ('Processing', {'fields': (
            'requested_by', 'approved_by',
            'requested_at', 'processed_at'
        )}),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related(
            'transaction', 'transaction__user', 'transaction__policy',
            'requested_by', 'approved_by'
        )
