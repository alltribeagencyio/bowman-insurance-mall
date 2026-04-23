from django.contrib import admin
from .models import Transaction, PaymentSchedule, Refund


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'transaction_number', 'user', 'policy', 'amount',
        'payment_method', 'status', 'created_at'
    )
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = (
        'transaction_number', 'user__email', 'policy__policy_number',
        'mpesa_receipt', 'paystack_reference', 'reference_number'
    )
    readonly_fields = ('transaction_number', 'created_at', 'updated_at', 'completed_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('transaction_number', 'user', 'policy')}),
        ('Payment Details', {'fields': ('amount', 'payment_method', 'status')}),
        ('Gateway Info', {'fields': ('mpesa_receipt', 'mpesa_phone', 'paystack_reference', 'reference_number')}),
        ('Failure', {'fields': ('failure_reason',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'completed_at')}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'policy', 'policy__policy_type')


@admin.register(PaymentSchedule)
class PaymentScheduleAdmin(admin.ModelAdmin):
    list_display = ('policy', 'installment_number', 'amount', 'due_date', 'status', 'created_at')
    list_filter = ('status', 'due_date', 'created_at')
    search_fields = ('policy__policy_number', 'policy__user__email')
    readonly_fields = ('created_at', 'paid_at')
    date_hierarchy = 'due_date'

    fieldsets = (
        (None, {'fields': ('policy', 'transaction', 'installment_number')}),
        ('Payment Details', {'fields': ('amount', 'due_date')}),
        ('Status', {'fields': ('status', 'paid_at')}),
        ('Reminders', {'fields': ('reminder_sent_at',)}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('policy', 'transaction', 'policy__user')


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ('refund_number', 'transaction', 'amount', 'status', 'created_at', 'processed_at')
    list_filter = ('status', 'created_at', 'processed_at')
    search_fields = (
        'refund_number', 'transaction__transaction_number',
        'transaction__user__email', 'refund_reference'
    )
    readonly_fields = ('refund_number', 'created_at', 'processed_at')
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {'fields': ('refund_number', 'transaction')}),
        ('Refund Details', {'fields': ('amount', 'reason', 'reason_description')}),
        ('Status', {'fields': ('status', 'refund_reference')}),
        ('Processing', {'fields': ('processed_by', 'notes', 'processed_at')}),
        ('Timestamps', {'fields': ('created_at',)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'transaction', 'transaction__user', 'transaction__policy', 'processed_by'
        )
