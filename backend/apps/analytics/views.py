"""Analytics Views"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone
from datetime import timedelta
from apps.policies.models import Policy
from apps.claims.models import Claim
from apps.payments.models import Transaction
from apps.users.models import User


@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    """Get admin dashboard statistics"""

    # Date ranges
    today = timezone.now().date()
    this_month_start = today.replace(day=1)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)

    # Users statistics
    total_users = User.objects.filter(role='customer').count()
    new_users_this_month = User.objects.filter(
        role='customer',
        created_at__gte=this_month_start
    ).count()

    # Policies statistics
    total_policies = Policy.objects.count()
    active_policies = Policy.objects.filter(status='active').count()
    pending_policies = Policy.objects.filter(status='pending').count()
    policies_this_month = Policy.objects.filter(created_at__gte=this_month_start).count()

    # Claims statistics
    total_claims = Claim.objects.count()
    pending_claims = Claim.objects.filter(
        status__in=['submitted', 'under_review', 'documents_requested']
    ).count()
    approved_claims = Claim.objects.filter(status='approved').count()
    settled_claims = Claim.objects.filter(status='settled').count()

    # Financial statistics
    total_revenue = Transaction.objects.filter(status='completed').aggregate(
        total=Sum('amount')
    )['total'] or 0

    this_month_revenue = Transaction.objects.filter(
        status='completed',
        created_at__gte=this_month_start
    ).aggregate(total=Sum('amount'))['total'] or 0

    total_claims_amount = Claim.objects.filter(
        status__in=['approved', 'settled']
    ).aggregate(total=Sum('amount_approved'))['total'] or 0

    return Response({
        'users': {
            'total': total_users,
            'new_this_month': new_users_this_month
        },
        'policies': {
            'total': total_policies,
            'active': active_policies,
            'pending': pending_policies,
            'new_this_month': policies_this_month
        },
        'claims': {
            'total': total_claims,
            'pending': pending_claims,
            'approved': approved_claims,
            'settled': settled_claims
        },
        'revenue': {
            'total': float(total_revenue),
            'this_month': float(this_month_revenue),
            'total_claims_paid': float(total_claims_amount)
        }
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def revenue_analytics(request):
    """Get revenue analytics data"""
    # Get revenue by month for the last 12 months
    today = timezone.now().date()
    months_data = []

    for i in range(12):
        month_start = (today.replace(day=1) - timedelta(days=30*i)).replace(day=1)
        if i == 0:
            month_end = today
        else:
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        revenue = Transaction.objects.filter(
            status='completed',
            created_at__gte=month_start,
            created_at__lte=month_end
        ).aggregate(total=Sum('amount'))['total'] or 0

        months_data.append({
            'month': month_start.strftime('%b %Y'),
            'revenue': float(revenue)
        })

    return Response({'months': list(reversed(months_data))})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def claims_analytics(request):
    """Get claims analytics data"""
    # Claims by status
    claims_by_status = Claim.objects.values('status').annotate(
        count=Count('id')
    )

    # Claims by type
    claims_by_type = Claim.objects.values('type').annotate(
        count=Count('id')
    )

    # Average claim processing time (in days)
    avg_processing_time = Claim.objects.filter(
        assessment_date__isnull=False
    ).extra(
        select={'processing_days': '(assessment_date - filed_date)'}
    ).count()  # Simplified

    return Response({
        'by_status': list(claims_by_status),
        'by_type': list(claims_by_type),
        'total_claims': Claim.objects.count()
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_analytics(request):
    """Get user growth and activity analytics"""
    # User growth over last 12 months
    today = timezone.now().date()
    months_data = []

    for i in range(12):
        month_start = (today.replace(day=1) - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        new_users = User.objects.filter(
            role='customer',
            created_at__gte=month_start,
            created_at__lte=month_end
        ).count()

        months_data.append({
            'month': month_start.strftime('%b %Y'),
            'new_users': new_users
        })

    # Users by role
    users_by_role = User.objects.values('role').annotate(count=Count('id'))

    return Response({
        'growth': list(reversed(months_data)),
        'by_role': list(users_by_role)
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def policy_analytics(request):
    """Get policy analytics data"""
    # Policies by category
    policies_by_category = Policy.objects.values(
        'policy_type__category__name'
    ).annotate(count=Count('id'))

    # Policies by status
    policies_by_status = Policy.objects.values('status').annotate(count=Count('id'))

    # Policies by insurance company
    policies_by_company = Policy.objects.values(
        'insurance_company__name'
    ).annotate(count=Count('id'))

    return Response({
        'by_category': list(policies_by_category),
        'by_status': list(policies_by_status),
        'by_company': list(policies_by_company)
    })
