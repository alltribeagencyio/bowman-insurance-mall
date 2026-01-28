"""
Payment Serializers
Handles serialization for transactions, payment schedules, and refunds
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Transaction, PaymentSchedule, Refund

User = get_user_model()


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""

    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    policy_number = serializers.CharField(source='policy.policy_number', read_only=True)
    amount_display = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id',
            'transaction_number',
            'user',
            'user_email',
            'user_name',
            'policy',
            'policy_number',
            'amount',
            'amount_display',
            'currency',
            'payment_method',
            'payment_method_display',
            'status',
            'status_display',
            'reference_number',
            'gateway_reference',
            'phone_number',
            'description',
            'metadata',
            'failure_reason',
            'processed_at',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'transaction_number',
            'gateway_reference',
            'processed_at',
            'created_at',
            'updated_at'
        ]

    def get_user_name(self, obj):
        """Get user's full name"""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email

    def get_amount_display(self, obj):
        """Get formatted amount"""
        return f"{obj.currency} {obj.amount:,.2f}"


class TransactionCreateSerializer(serializers.Serializer):
    """Serializer for creating a new transaction"""

    policy_id = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    payment_method = serializers.ChoiceField(choices=['mpesa', 'card'], required=True)
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False)

    def validate_amount(self, value):
        """Validate amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero")
        return value

    def validate(self, attrs):
        """Cross-field validation"""
        payment_method = attrs.get('payment_method')
        phone_number = attrs.get('phone_number')

        # M-Pesa requires phone number
        if payment_method == 'mpesa' and not phone_number:
            raise serializers.ValidationError({
                'phone_number': 'Phone number is required for M-Pesa payments'
            })

        return attrs


class MpesaInitiateSerializer(serializers.Serializer):
    """Serializer for initiating M-Pesa STK Push"""

    transaction_id = serializers.UUIDField(required=True)
    phone_number = serializers.CharField(max_length=15, required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    account_reference = serializers.CharField(max_length=100, required=False)
    description = serializers.CharField(max_length=200, required=False, default="Insurance Payment")

    def validate_phone_number(self, value):
        """Validate phone number format"""
        # Remove spaces and special characters
        cleaned = value.replace(' ', '').replace('-', '').replace('+', '')

        # Check if it's a valid Kenyan number
        if not (cleaned.startswith('254') or cleaned.startswith('0') or cleaned.startswith('7')):
            raise serializers.ValidationError("Please enter a valid Kenyan phone number")

        return value


class PaystackInitializeSerializer(serializers.Serializer):
    """Serializer for initializing Paystack payment"""

    transaction_id = serializers.UUIDField(required=True)
    email = serializers.EmailField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    callback_url = serializers.URLField(required=False)
    metadata = serializers.JSONField(required=False)


class TransactionStatusSerializer(serializers.Serializer):
    """Serializer for transaction status response"""

    transaction_id = serializers.UUIDField()
    status = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.CharField()
    reference_number = serializers.CharField()
    gateway_reference = serializers.CharField(required=False)
    processed_at = serializers.DateTimeField(required=False)
    message = serializers.CharField()


class PaymentScheduleSerializer(serializers.ModelSerializer):
    """Serializer for Payment Schedule"""

    policy_number = serializers.CharField(source='policy.policy_number', read_only=True)
    user_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    amount_display = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = PaymentSchedule
        fields = [
            'id',
            'policy',
            'policy_number',
            'user_name',
            'amount',
            'amount_display',
            'due_date',
            'status',
            'status_display',
            'is_overdue',
            'transaction',
            'reminder_sent',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'transaction',
            'reminder_sent',
            'created_at',
            'updated_at'
        ]

    def get_user_name(self, obj):
        """Get user's full name"""
        user = obj.policy.user
        return f"{user.first_name} {user.last_name}".strip() or user.email

    def get_amount_display(self, obj):
        """Get formatted amount"""
        return f"KES {obj.amount:,.2f}"

    def get_is_overdue(self, obj):
        """Check if payment is overdue"""
        from django.utils import timezone
        return obj.status == 'pending' and obj.due_date < timezone.now().date()


class RefundSerializer(serializers.ModelSerializer):
    """Serializer for Refund"""

    transaction_number = serializers.CharField(source='transaction.transaction_number', read_only=True)
    user_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    amount_display = serializers.SerializerMethodField()

    class Meta:
        model = Refund
        fields = [
            'id',
            'transaction',
            'transaction_number',
            'user_name',
            'amount',
            'amount_display',
            'reason',
            'status',
            'status_display',
            'processed_at',
            'processed_by',
            'notes',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'processed_at',
            'processed_by',
            'created_at',
            'updated_at'
        ]

    def get_user_name(self, obj):
        """Get user's full name"""
        user = obj.transaction.user
        return f"{user.first_name} {user.last_name}".strip() or user.email

    def get_amount_display(self, obj):
        """Get formatted amount"""
        return f"{obj.transaction.currency} {obj.amount:,.2f}"


class RefundCreateSerializer(serializers.Serializer):
    """Serializer for creating a refund"""

    transaction_id = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    reason = serializers.CharField(max_length=500, required=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_amount(self, value):
        """Validate refund amount"""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Refund amount must be greater than zero")
        return value


class PaymentSummarySerializer(serializers.Serializer):
    """Serializer for payment summary/statistics"""

    total_transactions = serializers.IntegerField()
    successful_payments = serializers.IntegerField()
    failed_payments = serializers.IntegerField()
    pending_payments = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    successful_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    refunded_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField()


class ReceiptSerializer(serializers.Serializer):
    """Serializer for payment receipt"""

    transaction_number = serializers.CharField()
    policy_number = serializers.CharField()
    customer_name = serializers.CharField()
    customer_email = serializers.EmailField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField()
    payment_method = serializers.CharField()
    reference_number = serializers.CharField()
    payment_date = serializers.DateTimeField()
    description = serializers.CharField()
    company_name = serializers.CharField(default="Bowman Insurance")
    company_address = serializers.CharField(required=False)
    company_phone = serializers.CharField(required=False)
    company_email = serializers.EmailField(required=False)
