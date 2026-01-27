import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from decimal import Decimal


class Transaction(models.Model):
    """Payment transactions"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('card', 'Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash', 'Cash'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction_number = models.CharField(max_length=50, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='transactions')
    policy = models.ForeignKey('policies.Policy', on_delete=models.PROTECT, related_name='transactions', null=True, blank=True)

    # Transaction details
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)

    # Payment gateway details
    mpesa_receipt = models.CharField(max_length=100, blank=True, null=True)
    mpesa_phone = models.CharField(max_length=20, blank=True, null=True)
    paystack_reference = models.CharField(max_length=100, blank=True, null=True)
    reference_number = models.CharField(max_length=100, blank=True, db_index=True)

    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)
    failure_reason = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['policy', 'status']),
            models.Index(fields=['payment_method', 'status']),
            models.Index(fields=['created_at', 'status']),
        ]

    def __str__(self):
        return f"{self.transaction_number} - {self.amount} ({self.status})"

    @property
    def is_successful(self):
        return self.status == 'completed'

    @property
    def can_retry(self):
        return self.status in ['failed', 'cancelled']


class PaymentSchedule(models.Model):
    """Payment schedule for installment policies"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    policy = models.ForeignKey('policies.Policy', on_delete=models.CASCADE, related_name='payment_schedules')
    transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='schedules')

    # Schedule details
    installment_number = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    due_date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'payment_schedules'
        ordering = ['due_date']
        indexes = [
            models.Index(fields=['policy', 'status']),
            models.Index(fields=['due_date', 'status']),
        ]

    def __str__(self):
        return f"Installment {self.installment_number} for {self.policy.policy_number}"

    @property
    def is_overdue(self):
        from django.utils import timezone
        return self.status == 'pending' and self.due_date < timezone.now().date()


class Refund(models.Model):
    """Refund records"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    REASON_CHOICES = [
        ('policy_cancellation', 'Policy Cancellation'),
        ('overpayment', 'Overpayment'),
        ('duplicate_payment', 'Duplicate Payment'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, on_delete=models.PROTECT, related_name='refunds')
    refund_number = models.CharField(max_length=50, unique=True, db_index=True)

    # Refund details
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    reason_description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)

    # Processing details
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_refunds'
    )
    refund_reference = models.CharField(max_length=100, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'refunds'
        ordering = ['-created_at']

    def __str__(self):
        return f"Refund {self.refund_number} - {self.amount}"
