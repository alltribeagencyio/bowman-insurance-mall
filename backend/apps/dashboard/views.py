"""Dashboard API Views"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from apps.policies.models import Policy
from apps.claims.models import Claim
from apps.payments.models import Transaction, PaymentSchedule


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_data(request):
    """Get complete dashboard data"""
    user = request.user

    # Get all data in one response
    stats = get_dashboard_stats_data(user)
    recent_activity = get_recent_activity_data(user)
    recommendations = get_recommendations_data(user)
    upcoming_payments = get_upcoming_payments_data(user)
    expiring_policies = get_expiring_policies_data(user)

    return Response({
        'stats': stats,
        'recentActivity': recent_activity,
        'recommendations': recommendations,
        'upcomingPayments': upcoming_payments,
        'expiringPolicies': expiring_policies
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    """Get dashboard statistics"""
    user = request.user
    stats = get_dashboard_stats_data(user)
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recent_activity(request):
    """Get recent activity"""
    user = request.user
    limit = int(request.GET.get('limit', 10))
    activities = get_recent_activity_data(user, limit)
    return Response(activities)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    """Get personalized recommendations"""
    user = request.user
    recommendations = get_recommendations_data(user)
    return Response(recommendations)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_upcoming_payments(request):
    """Get upcoming payments"""
    user = request.user
    limit = int(request.GET.get('limit', 5))
    payments = get_upcoming_payments_data(user, limit)
    return Response(payments)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_expiring_policies(request):
    """Get expiring policies"""
    user = request.user
    days = int(request.GET.get('days', 30))
    policies = get_expiring_policies_data(user, days)
    return Response(policies)


# Helper functions
def get_dashboard_stats_data(user):
    """Calculate dashboard statistics"""
    # Policy stats
    policies = Policy.objects.filter(user=user)
    total_policies = policies.count()
    active_policies = policies.filter(status='active').count()

    # Expiring soon (next 30 days)
    thirty_days_later = timezone.now().date() + timedelta(days=30)
    expiring_soon = policies.filter(
        status='active',
        end_date__lte=thirty_days_later,
        end_date__gte=timezone.now().date()
    ).count()

    expired_policies = policies.filter(status='expired').count()

    # Payment stats
    schedules = PaymentSchedule.objects.filter(policy__user=user, status='pending')
    pending_amount = schedules.aggregate(total=Sum('amount'))['total'] or 0
    pending_count = schedules.count()

    # Overdue payments
    overdue_schedules = schedules.filter(due_date__lt=timezone.now().date())
    overdue_amount = overdue_schedules.aggregate(total=Sum('amount'))['total'] or 0
    overdue_count = overdue_schedules.count()

    # Next payment
    next_schedule = schedules.filter(due_date__gte=timezone.now().date()).order_by('due_date').first()
    next_payment_date = next_schedule.due_date.isoformat() if next_schedule else None
    next_payment_amount = float(next_schedule.amount) if next_schedule else None

    # Claim stats
    claims = Claim.objects.filter(user=user)
    total_claims = claims.count()
    pending_claims = claims.filter(status__in=['submitted', 'under_review']).count()
    approved_claims = claims.filter(status='approved').count()
    rejected_claims = claims.filter(status='rejected').count()

    return {
        'policies': {
            'total': total_policies,
            'active': active_policies,
            'expiringSoon': expiring_soon,
            'expired': expired_policies
        },
        'payments': {
            'pendingAmount': float(pending_amount),
            'pendingCount': pending_count,
            'overdueAmount': float(overdue_amount),
            'overdueCount': overdue_count,
            'nextPaymentDate': next_payment_date,
            'nextPaymentAmount': next_payment_amount
        },
        'claims': {
            'total': total_claims,
            'pending': pending_claims,
            'approved': approved_claims,
            'rejected': rejected_claims
        }
    }


def get_recent_activity_data(user, limit=10):
    """Get recent activity events"""
    activities = []

    # Recent payments
    recent_payments = Transaction.objects.filter(
        user=user,
        status='completed'
    ).order_by('-created_at')[:limit]

    for payment in recent_payments:
        activities.append({
            'id': f'payment-{payment.id}',
            'type': 'payment',
            'title': 'Payment Processed',
            'description': f'Premium payment of KES {payment.amount:,.2f} completed',
            'timestamp': payment.created_at.isoformat(),
            'icon': 'CreditCard',
            'iconColor': 'text-green-600',
            'bgColor': 'bg-green-50'
        })

    # Recent claims
    recent_claims = Claim.objects.filter(user=user).order_by('-submitted_at')[:limit]
    for claim in recent_claims:
        activities.append({
            'id': f'claim-{claim.id}',
            'type': 'claim',
            'title': f'Claim {claim.status.replace("_", " ").title()}',
            'description': f'Claim #{claim.claim_number} - {claim.type}',
            'timestamp': claim.submitted_at.isoformat(),
            'icon': 'FileText',
            'iconColor': 'text-blue-600',
            'bgColor': 'bg-blue-50'
        })

    # Recent policies
    recent_policies = Policy.objects.filter(user=user).order_by('-created_at')[:limit]
    for policy in recent_policies:
        activities.append({
            'id': f'policy-{policy.id}',
            'type': 'policy',
            'title': 'New Policy Created',
            'description': f'Policy #{policy.policy_number} - {policy.policy_type.name}',
            'timestamp': policy.created_at.isoformat(),
            'icon': 'Shield',
            'iconColor': 'text-purple-600',
            'bgColor': 'bg-purple-50'
        })

    # Sort by timestamp and limit
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    return activities[:limit]


def get_recommendations_data(user):
    """Generate personalized recommendations"""
    recommendations = []

    # Check for policies expiring soon
    thirty_days_later = timezone.now().date() + timedelta(days=30)
    expiring = Policy.objects.filter(
        user=user,
        status='active',
        end_date__lte=thirty_days_later,
        end_date__gte=timezone.now().date()
    )

    if expiring.exists():
        recommendations.append({
            'id': 'renew-policy',
            'priority': 'high',
            'title': 'Renew Expiring Policies',
            'description': f'You have {expiring.count()} policy/policies expiring soon. Renew now to avoid coverage gaps.',
            'action': 'Renew Now',
            'link': '/dashboard/my-policies'
        })

    # Check for overdue payments
    overdue = PaymentSchedule.objects.filter(
        policy__user=user,
        status='pending',
        due_date__lt=timezone.now().date()
    )

    if overdue.exists():
        recommendations.append({
            'id': 'overdue-payments',
            'priority': 'high',
            'title': 'Overdue Payments',
            'description': f'You have {overdue.count()} overdue payment(s). Pay now to keep your coverage active.',
            'action': 'Pay Now',
            'link': '/dashboard/payments'
        })

    # Check if user has no health insurance
    has_health = Policy.objects.filter(
        user=user,
        policy_type__category__slug='health',
        status='active'
    ).exists()

    if not has_health:
        recommendations.append({
            'id': 'get-health',
            'priority': 'medium',
            'title': 'Protect Your Health',
            'description': 'Consider adding health insurance to your portfolio for comprehensive coverage.',
            'action': 'Browse Health Plans',
            'link': '/policies?category=health'
        })

    # Check if user has only one policy
    if Policy.objects.filter(user=user, status='active').count() == 1:
        recommendations.append({
            'id': 'diversify',
            'priority': 'low',
            'title': 'Diversify Your Coverage',
            'description': 'Protect different aspects of your life with our range of insurance products.',
            'action': 'Explore Products',
            'link': '/policies'
        })

    return recommendations


def get_upcoming_payments_data(user, limit=5):
    """Get upcoming payment schedules"""
    schedules = PaymentSchedule.objects.filter(
        policy__user=user,
        status='pending',
        due_date__gte=timezone.now().date()
    ).select_related('policy', 'policy__policy_type').order_by('due_date')[:limit]

    payments = []
    for schedule in schedules:
        payments.append({
            'id': str(schedule.id),
            'policy': {
                'id': str(schedule.policy.id),
                'policy_number': schedule.policy.policy_number,
                'policy_type': schedule.policy.policy_type.name
            },
            'amount': float(schedule.amount),
            'due_date': schedule.due_date.isoformat(),
            'is_overdue': schedule.due_date < timezone.now().date()
        })

    return payments


def get_expiring_policies_data(user, days=30):
    """Get policies expiring within specified days"""
    end_date = timezone.now().date() + timedelta(days=days)

    policies = Policy.objects.filter(
        user=user,
        status='active',
        end_date__lte=end_date,
        end_date__gte=timezone.now().date()
    ).select_related('policy_type').order_by('end_date')

    result = []
    for policy in policies:
        days_remaining = (policy.end_date - timezone.now().date()).days
        result.append({
            'id': str(policy.id),
            'policy_number': policy.policy_number,
            'policy_type': policy.policy_type.name,
            'end_date': policy.end_date.isoformat(),
            'days_remaining': days_remaining
        })

    return result
