"""Admin API Views"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.policies.models import Policy, PolicyType, InsuranceCompany
from apps.claims.models import Claim
from apps.payments.models import Transaction
from apps.users.serializers import UserSerializer
from apps.policies.serializers import PolicyTypeSerializer, InsuranceCompanySerializer


class IsAdmin(IsAuthenticated):
    """Custom permission to only allow admin users"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ['admin', 'staff']


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_admin_dashboard(request):
    """Get admin dashboard data"""
    # Calculate metrics
    total_users = User.objects.filter(role='customer').count()
    active_policies = Policy.objects.filter(status='active').count()

    # Calculate growth (last 30 days vs previous 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    sixty_days_ago = timezone.now() - timedelta(days=60)

    new_users_last_30 = User.objects.filter(created_at__gte=thirty_days_ago).count()
    new_users_prev_30 = User.objects.filter(
        created_at__gte=sixty_days_ago,
        created_at__lt=thirty_days_ago
    ).count()
    users_growth = calculate_growth(new_users_last_30, new_users_prev_30)

    policies_last_30 = Policy.objects.filter(created_at__gte=thirty_days_ago).count()
    policies_prev_30 = Policy.objects.filter(
        created_at__gte=sixty_days_ago,
        created_at__lt=thirty_days_ago
    ).count()
    policies_growth = calculate_growth(policies_last_30, policies_prev_30)

    # Revenue
    revenue_last_30 = Transaction.objects.filter(
        created_at__gte=thirty_days_ago,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0

    revenue_prev_30 = Transaction.objects.filter(
        created_at__gte=sixty_days_ago,
        created_at__lt=thirty_days_ago,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0

    revenue_growth = calculate_growth(float(revenue_last_30), float(revenue_prev_30))

    # Claims
    pending_claims = Claim.objects.filter(status__in=['submitted', 'under_review']).count()
    claims_last_30 = Claim.objects.filter(submitted_at__gte=thirty_days_ago).count()
    claims_prev_30 = Claim.objects.filter(
        submitted_at__gte=sixty_days_ago,
        submitted_at__lt=thirty_days_ago
    ).count()
    claims_change = claims_last_30 - claims_prev_30

    # Recent transactions
    recent_transactions = Transaction.objects.select_related(
        'user', 'policy'
    ).order_by('-created_at')[:10]

    transactions_data = [{
        'id': str(t.id),
        'transaction_reference': t.transaction_reference,
        'user': {
            'id': str(t.user.id),
            'name': f'{t.user.first_name} {t.user.last_name}'
        },
        'amount': float(t.amount),
        'payment_method': t.payment_method,
        'status': t.status,
        'created_at': t.created_at.isoformat(),
        'policy': {
            'id': str(t.policy.id),
            'policy_number': t.policy.policy_number
        } if t.policy else None
    } for t in recent_transactions]

    # Recent users — single query with annotations (avoids N+1)
    recent_users = User.objects.filter(role='customer').annotate(
        policies_count=Count('policy', distinct=True),
        total_spent=Sum('transaction__amount', filter=Q(transaction__status='completed'))
    ).order_by('-created_at')[:10]
    users_data = [{
        'id': str(u.id),
        'first_name': u.first_name,
        'last_name': u.last_name,
        'email': u.email,
        'phone': u.phone_number,
        'role': u.role,
        'status': 'active' if u.is_active else 'inactive',
        'created_at': u.created_at.isoformat(),
        'policies_count': u.policies_count or 0,
        'total_spent': float(u.total_spent or 0)
    } for u in recent_users]

    # Pending tasks
    pending_tasks = []

    # Add pending claims as tasks — select_related('user') avoids N+1
    for claim in Claim.objects.filter(status='submitted').select_related('user').order_by('-submitted_at')[:5]:
        pending_tasks.append({
            'id': f'claim-{claim.id}',
            'title': f'Review Claim #{claim.claim_number}',
            'description': f'{claim.type} claim - {claim.user.first_name} {claim.user.last_name}',
            'priority': 'high',
            'created_at': claim.submitted_at.isoformat()
        })

    return Response({
        'metrics': {
            'total_users': total_users,
            'users_growth': users_growth,
            'active_policies': active_policies,
            'policies_growth': policies_growth,
            'total_revenue': float(revenue_last_30),
            'revenue_growth': revenue_growth,
            'pending_claims': pending_claims,
            'claims_change': claims_change
        },
        'recent_transactions': transactions_data,
        'recent_users': users_data,
        'pending_tasks': pending_tasks
    })


class UserManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for user management"""
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        queryset = User.objects.all()

        # Filters
        search = self.request.query_params.get('search')
        role = self.request.query_params.get('role')
        status_filter = self.request.query_params.get('status')

        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone_number__icontains=search)
            )

        if role:
            queryset = queryset.filter(role=role)

        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'suspended':
            queryset = queryset.filter(is_active=False)

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a user"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message': 'User suspended successfully'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user"""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'message': 'User activated successfully'})


class PolicyTypeManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for policy type management"""
    permission_classes = [IsAdmin]
    serializer_class = PolicyTypeSerializer
    queryset = PolicyType.objects.all()


class InsuranceCompanyManagementViewSet(viewsets.ModelViewSet):
    """ViewSet for insurance company management"""
    permission_classes = [IsAdmin]
    serializer_class = InsuranceCompanySerializer
    queryset = InsuranceCompany.objects.all()


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_sales_report(request):
    """Get sales report"""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    policies = Policy.objects.all()

    if date_from:
        policies = policies.filter(created_at__gte=date_from)
    if date_to:
        policies = policies.filter(created_at__lte=date_to)

    # Sales by category — single annotated query (avoids N+1 category loop)
    category_data = policies.values('policy_type__category__name').annotate(
        count=Count('id'),
        amount=Sum('premium_amount')
    ).order_by('-amount')
    by_category = [
        {
            'category': item['policy_type__category__name'] or 'Unknown',
            'count': item['count'],
            'amount': float(item['amount'] or 0)
        }
        for item in category_data
    ]

    total_sales = policies.count()

    return Response({
        'sales': {
            'total_sales': total_sales,
            'growth': 0,  # Would need historical data
            'by_category': by_category
        }
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_revenue_report(request):
    """Get revenue report"""
    transactions = Transaction.objects.filter(status='completed')

    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    if date_from:
        transactions = transactions.filter(created_at__gte=date_from)
    if date_to:
        transactions = transactions.filter(created_at__lte=date_to)

    total_revenue = transactions.aggregate(total=Sum('amount'))['total'] or 0

    return Response({
        'revenue': {
            'total_revenue': float(total_revenue),
            'growth': 0,
            'by_period': []
        }
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_claims_report(request):
    """Get claims report"""
    claims = Claim.objects.all()

    by_status = []
    for status_choice in ['submitted', 'under_review', 'approved', 'rejected', 'settled']:
        count = claims.filter(status=status_choice).count()
        by_status.append({
            'status': status_choice,
            'count': count
        })

    total_claims = claims.count()
    avg_settlement = claims.filter(amount_approved__isnull=False).aggregate(
        avg=Avg('amount_approved')
    )['avg'] or 0

    return Response({
        'claims': {
            'total_claims': total_claims,
            'claims_ratio': 0,
            'avg_settlement': float(avg_settlement),
            'by_status': by_status
        }
    })


def calculate_growth(current, previous):
    """Calculate percentage growth"""
    if previous == 0:
        return 100 if current > 0 else 0
    return round(((current - previous) / previous) * 100, 2)
