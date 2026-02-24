"""
Payment Views
API endpoints for payment processing, verification, and management
"""

from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action, throttle_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import UserRateThrottle


class PaymentRateThrottle(UserRateThrottle):
    """Stricter rate limit for payment initiation endpoints (20 per hour per user)."""
    scope = 'payment_initiate'
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Sum, Count, Q
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

from .models import Transaction, PaymentSchedule, Refund
from apps.policies.models import Policy
from .serializers import (
    TransactionSerializer,
    TransactionCreateSerializer,
    MpesaInitiateSerializer,
    PaystackInitializeSerializer,
    PaymentScheduleSerializer,
    RefundSerializer,
    RefundCreateSerializer,
    PaymentSummarySerializer,
    ReceiptSerializer
)
from .mpesa import mpesa_service
from .paystack import paystack_service

import logging

logger = logging.getLogger(__name__)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing transactions
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter transactions by user"""
        user = self.request.user

        if user.role in ['admin', 'staff']:
            return Transaction.objects.all()
        return Transaction.objects.filter(user=user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get payment summary statistics"""
        queryset = self.get_queryset()

        summary = queryset.aggregate(
            total_transactions=Count('id'),
            successful_payments=Count('id', filter=Q(status='completed')),
            failed_payments=Count('id', filter=Q(status='failed')),
            pending_payments=Count('id', filter=Q(status='pending')),
            total_amount=Sum('amount', filter=Q(status__in=['completed', 'pending'])),
            successful_amount=Sum('amount', filter=Q(status='completed'))
        )

        # Calculate refunded amount
        refunded = Refund.objects.filter(
            transaction__in=queryset,
            status='completed'
        ).aggregate(total=Sum('amount'))

        summary['refunded_amount'] = refunded['total'] or 0
        summary['total_amount'] = summary['total_amount'] or 0
        summary['successful_amount'] = summary['successful_amount'] or 0
        summary['currency'] = 'KES'

        serializer = PaymentSummarySerializer(summary)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def receipt(self, request, pk=None):
        """Get payment receipt"""
        transaction = self.get_object()

        if transaction.status != 'completed':
            return Response(
                {'error': 'Receipt only available for completed transactions'},
                status=status.HTTP_400_BAD_REQUEST
            )

        receipt_data = {
            'transaction_number': transaction.transaction_number,
            'policy_number': transaction.policy.policy_number if transaction.policy else 'N/A',
            'customer_name': f"{transaction.user.first_name} {transaction.user.last_name}",
            'customer_email': transaction.user.email,
            'amount': transaction.amount,
            'currency': transaction.currency,
            'payment_method': transaction.get_payment_method_display(),
            'reference_number': transaction.reference_number,
            'payment_date': transaction.processed_at or transaction.created_at,
            'description': transaction.description or 'Insurance Payment'
        }

        serializer = ReceiptSerializer(receipt_data)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentRateThrottle])
def initiate_payment(request):
    """
    Initiate a new payment transaction
    """
    serializer = TransactionCreateSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Get policy
    policy = get_object_or_404(Policy, id=serializer.validated_data['policy_id'])

    # Check if user owns the policy
    if policy.user != request.user and request.user.role not in ['admin', 'staff']:
        return Response(
            {'error': 'You do not have permission to pay for this policy'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Create transaction record
    transaction = Transaction.objects.create(
        user=request.user,
        policy=policy,
        amount=serializer.validated_data['amount'],
        payment_method=serializer.validated_data['payment_method'],
        phone_number=serializer.validated_data.get('phone_number', ''),
        description=serializer.validated_data.get('description', 'Premium payment'),
        metadata=serializer.validated_data.get('metadata', {}),
        status='pending'
    )

    return Response({
        'transaction_id': transaction.id,
        'transaction_number': transaction.transaction_number,
        'status': 'pending',
        'message': 'Transaction created. Proceed to payment.'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentRateThrottle])
def mpesa_initiate(request):
    """Initiate M-Pesa STK Push"""
    serializer = MpesaInitiateSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Get transaction
    transaction = get_object_or_404(
        Transaction,
        id=serializer.validated_data['transaction_id'],
        user=request.user
    )

    if transaction.status != 'pending':
        return Response(
            {'error': 'Transaction already processed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Initiate STK Push
    result = mpesa_service.initiate_stk_push(
        phone_number=serializer.validated_data['phone_number'],
        amount=serializer.validated_data['amount'],
        account_reference=transaction.transaction_number,
        transaction_desc=serializer.validated_data.get('description', 'Insurance Payment')
    )

    if result['success']:
        # Update transaction with checkout request ID
        transaction.gateway_reference = result['checkout_request_id']
        transaction.metadata.update({
            'mpesa_checkout_request_id': result['checkout_request_id'],
            'mpesa_merchant_request_id': result['merchant_request_id']
        })
        transaction.save()

        return Response({
            'success': True,
            'transaction_id': str(transaction.id),
            'checkout_request_id': result['checkout_request_id'],
            'message': result['message']
        })
    else:
        return Response({
            'success': False,
            'message': result['message']
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def mpesa_callback(request):
    """M-Pesa callback handler"""
    try:
        # Verify callback secret (production security)
        callback_secret = request.GET.get('secret', '')
        if not mpesa_service.verify_callback_secret(callback_secret):
            logger.warning(
                f"Invalid M-Pesa callback secret from IP {request.META.get('REMOTE_ADDR')}"
            )
            return JsonResponse({'ResultCode': 1, 'ResultDesc': 'Unauthorized'}, status=400)

        callback_data = json.loads(request.body)
        logger.info(f"M-Pesa callback received: {callback_data}")

        # Process callback
        processed = mpesa_service.process_callback(callback_data)

        if not processed.get('checkout_request_id'):
            return JsonResponse({'ResultCode': 1, 'ResultDesc': 'Invalid callback data'})

        # Find transaction
        try:
            transaction = Transaction.objects.get(
                gateway_reference=processed['checkout_request_id']
            )
        except Transaction.DoesNotExist:
            logger.error(f"Transaction not found for checkout request: {processed['checkout_request_id']}")
            return JsonResponse({'ResultCode': 1, 'ResultDesc': 'Transaction not found'})

        # Update transaction based on result
        if processed['success']:
            transaction.status = 'completed'
            transaction.reference_number = processed.get('mpesa_receipt', '')
            transaction.processed_at = timezone.now()
            transaction.metadata.update({
                'mpesa_receipt': processed.get('mpesa_receipt'),
                'transaction_date': str(processed.get('transaction_date')),
                'phone_number': processed.get('phone_number')
            })
        else:
            transaction.status = 'failed'
            transaction.failure_reason = processed.get('result_desc', 'Payment failed')

        transaction.save()

        return JsonResponse({'ResultCode': 0, 'ResultDesc': 'Success'})

    except Exception as e:
        logger.error(f"M-Pesa callback error: {str(e)}")
        return JsonResponse({'ResultCode': 1, 'ResultDesc': 'Processing failed'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mpesa_status(request, transaction_id):
    """Check M-Pesa transaction status"""
    transaction = get_object_or_404(
        Transaction,
        id=transaction_id,
        user=request.user
    )

    if not transaction.gateway_reference:
        return Response(
            {'error': 'No M-Pesa reference found for this transaction'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Query M-Pesa API
    result = mpesa_service.query_transaction_status(transaction.gateway_reference)

    if result['success']:
        # Update transaction if needed
        if result['result_code'] == 0 and transaction.status == 'pending':
            transaction.status = 'completed'
            transaction.processed_at = timezone.now()
            transaction.save()

        return Response({
            'transaction_id': str(transaction.id),
            'status': transaction.status,
            'result': result
        })
    else:
        return Response({
            'error': result['message']
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentRateThrottle])
def paystack_initialize(request):
    """Initialize Paystack payment"""
    serializer = PaystackInitializeSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Get transaction
    transaction = get_object_or_404(
        Transaction,
        id=serializer.validated_data['transaction_id'],
        user=request.user
    )

    if transaction.status != 'pending':
        return Response(
            {'error': 'Transaction already processed'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Initialize payment with Paystack
    result = paystack_service.initialize_transaction(
        email=serializer.validated_data['email'],
        amount=serializer.validated_data['amount'],
        reference=transaction.transaction_number,
        callback_url=serializer.validated_data.get('callback_url'),
        metadata=serializer.validated_data.get('metadata', {
            'transaction_id': str(transaction.id),
            'policy_id': str(transaction.policy.id) if transaction.policy else None
        })
    )

    if result['success']:
        # Update transaction
        transaction.gateway_reference = result['reference']
        transaction.metadata.update({
            'paystack_access_code': result['access_code'],
            'paystack_reference': result['reference']
        })
        transaction.save()

        return Response({
            'success': True,
            'transaction_id': str(transaction.id),
            'authorization_url': result['authorization_url'],
            'access_code': result['access_code'],
            'reference': result['reference']
        })
    else:
        return Response({
            'success': False,
            'message': result['message']
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def paystack_verify(request, reference):
    """Verify Paystack payment"""
    # Find transaction
    transaction = get_object_or_404(
        Transaction,
        transaction_number=reference,
        user=request.user
    )

    # Verify with Paystack
    result = paystack_service.verify_transaction(reference)

    if result['success'] and result['verified']:
        transaction.status = 'completed'
        transaction.reference_number = reference
        transaction.processed_at = timezone.now()
        transaction.metadata.update({
            'paystack_verified': True,
            'paystack_paid_at': result.get('paid_at'),
            'paystack_channel': result.get('channel')
        })
        transaction.save()

        return Response({
            'success': True,
            'transaction_id': str(transaction.id),
            'status': 'completed',
            'message': 'Payment verified successfully'
        })
    else:
        if transaction.status == 'pending':
            transaction.status = 'failed'
            transaction.failure_reason = 'Payment verification failed'
            transaction.save()

        return Response({
            'success': False,
            'message': result.get('message', 'Verification failed')
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def paystack_webhook(request):
    """Paystack webhook handler"""
    try:
        # Verify webhook signature
        signature = request.headers.get('X-Paystack-Signature', '')
        if not paystack_service.verify_webhook_signature(request.body, signature):
            logger.warning("Invalid Paystack webhook signature")
            return JsonResponse({'error': 'Invalid signature'}, status=400)

        webhook_data = json.loads(request.body)
        logger.info(f"Paystack webhook received: {webhook_data.get('event')}")

        # Process webhook
        processed = paystack_service.process_webhook(webhook_data)

        if processed.get('reference'):
            try:
                transaction = Transaction.objects.get(
                    transaction_number=processed['reference']
                )

                if processed.get('transaction_completed'):
                    transaction.status = 'completed'
                    transaction.reference_number = processed['reference']
                    transaction.processed_at = timezone.now()
                elif processed.get('success') is False:
                    transaction.status = 'failed'
                    transaction.failure_reason = processed.get('failure_reason', 'Payment failed')

                transaction.metadata.update(processed)
                transaction.save()

            except Transaction.DoesNotExist:
                logger.error(f"Transaction not found: {processed['reference']}")

        return JsonResponse({'status': 'success'})

    except Exception as e:
        logger.error(f"Paystack webhook error: {str(e)}")
        return JsonResponse({'error': 'Processing failed'}, status=500)


class PaymentScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payment schedules"""
    serializer_class = PaymentScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter payment schedules by user"""
        user = self.request.user

        if user.role in ['admin', 'staff']:
            return PaymentSchedule.objects.all()
        return PaymentSchedule.objects.filter(policy__user=user)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending payments"""
        queryset = self.get_queryset().filter(status='pending')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue payments"""
        today = timezone.now().date()
        queryset = self.get_queryset().filter(
            status='pending',
            due_date__lt=today
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class RefundViewSet(viewsets.ModelViewSet):
    """ViewSet for managing refunds"""
    serializer_class = RefundSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter refunds by user"""
        user = self.request.user

        if user.role in ['admin', 'staff']:
            return Refund.objects.all()
        return Refund.objects.filter(transaction__user=user)

    def create(self, request, *args, **kwargs):
        """Create a new refund request"""
        serializer = RefundCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get transaction
        transaction = get_object_or_404(
            Transaction,
            id=serializer.validated_data['transaction_id']
        )

        # Check permissions
        if transaction.user != request.user and request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'You do not have permission to request a refund for this transaction'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if transaction is refundable
        if transaction.status != 'completed':
            return Response(
                {'error': 'Only completed transactions can be refunded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if already refunded
        if Refund.objects.filter(transaction=transaction, status__in=['pending', 'completed']).exists():
            return Response(
                {'error': 'A refund request already exists for this transaction'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create refund
        refund_amount = serializer.validated_data.get('amount', transaction.amount)
        refund = Refund.objects.create(
            transaction=transaction,
            amount=refund_amount,
            reason=serializer.validated_data['reason'],
            notes=serializer.validated_data.get('notes', ''),
            status='pending'
        )

        response_serializer = RefundSerializer(refund)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
