"""Admin API Views"""
import csv
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User
from apps.policies.models import Policy, PolicyType, InsuranceCompany
from apps.claims.models import Claim
from apps.payments.models import Transaction
from apps.policies.serializers import PolicyTypeSerializer, InsuranceCompanySerializer


class IsAdmin(IsAuthenticated):
    """Custom permission to only allow admin users"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role in ['admin', 'staff']


# ==================== Helpers ====================

def calculate_growth(current, previous):
    if previous == 0:
        return 100 if current > 0 else 0
    return round(((current - previous) / previous) * 100, 2)


def serialize_user(u, policies_count=0, total_spent=0):
    return {
        'id': str(u.id),
        'first_name': u.first_name,
        'last_name': u.last_name,
        'email': u.email,
        'phone': u.phone,
        'role': u.role,
        'status': 'active' if u.is_active else 'suspended',
        'created_at': u.created_at.isoformat(),
        'policies_count': policies_count,
        'total_spent': float(total_spent or 0),
    }


def serialize_claim(c):
    amount = float(c.amount_claimed)
    priority = 'high' if amount > 100000 else ('medium' if amount > 50000 else 'low')
    frontend_status = 'pending' if c.status == 'submitted' else c.status
    return {
        'id': str(c.id),
        'claim_number': c.claim_number,
        'user': {
            'id': str(c.user.id),
            'name': f'{c.user.first_name} {c.user.last_name}',
            'email': c.user.email,
        },
        'policy': {
            'id': str(c.policy.id),
            'policy_number': c.policy.policy_number,
            'policy_type': c.policy.policy_type.name if c.policy.policy_type else '',
        },
        'claim_amount': amount,
        'status': frontend_status,
        'priority': priority,
        'description': c.description,
        'documents_count': getattr(c, 'documents_count', 0),
        'assigned_to': {
            'id': str(c.assessor.id),
            'name': f'{c.assessor.first_name} {c.assessor.last_name}',
        } if c.assessor else None,
        'submitted_at': c.filed_date.isoformat(),
        'updated_at': c.updated_at.isoformat(),
    }


def serialize_transaction(t):
    return {
        'id': str(t.id),
        'transaction_reference': t.transaction_number,
        'user': {
            'id': str(t.user.id),
            'name': f'{t.user.first_name} {t.user.last_name}',
        },
        'amount': float(t.amount),
        'payment_method': t.payment_method,
        'status': t.status,
        'created_at': t.created_at.isoformat(),
        'policy': {
            'id': str(t.policy.id),
            'policy_number': t.policy.policy_number,
        } if t.policy else None,
    }


# ==================== Dashboard ====================

@api_view(['GET'])
@permission_classes([IsAdmin])
def get_admin_dashboard(request):
    """Get admin dashboard data"""
    total_users = User.objects.filter(role='customer').count()
    active_policies = Policy.objects.filter(status='active').count()

    thirty_days_ago = timezone.now() - timedelta(days=30)
    sixty_days_ago = timezone.now() - timedelta(days=60)

    new_users_last_30 = User.objects.filter(created_at__gte=thirty_days_ago).count()
    new_users_prev_30 = User.objects.filter(
        created_at__gte=sixty_days_ago, created_at__lt=thirty_days_ago
    ).count()

    policies_last_30 = Policy.objects.filter(created_at__gte=thirty_days_ago).count()
    policies_prev_30 = Policy.objects.filter(
        created_at__gte=sixty_days_ago, created_at__lt=thirty_days_ago
    ).count()

    revenue_last_30 = Transaction.objects.filter(
        created_at__gte=thirty_days_ago, status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    revenue_prev_30 = Transaction.objects.filter(
        created_at__gte=sixty_days_ago, created_at__lt=thirty_days_ago, status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0

    pending_claims = Claim.objects.filter(status__in=['submitted', 'under_review']).count()
    claims_last_30 = Claim.objects.filter(filed_date__gte=thirty_days_ago).count()
    claims_prev_30 = Claim.objects.filter(
        filed_date__gte=sixty_days_ago, filed_date__lt=thirty_days_ago
    ).count()

    recent_transactions = Transaction.objects.select_related('user', 'policy').order_by('-created_at')[:10]

    recent_users = User.objects.filter(role='customer').annotate(
        policies_count=Count('policy', distinct=True),
        total_spent=Sum('transactions__amount', filter=Q(transactions__status='completed'))
    ).order_by('-created_at')[:10]

    pending_tasks = []
    for claim in Claim.objects.filter(status='submitted').select_related('user').order_by('-filed_date')[:5]:
        pending_tasks.append({
            'id': f'claim-{claim.id}',
            'title': f'Review Claim #{claim.claim_number}',
            'description': f'{claim.type} claim - {claim.user.first_name} {claim.user.last_name}',
            'priority': 'high',
            'created_at': claim.filed_date.isoformat(),
        })

    return Response({
        'metrics': {
            'total_users': total_users,
            'users_growth': calculate_growth(new_users_last_30, new_users_prev_30),
            'active_policies': active_policies,
            'policies_growth': calculate_growth(policies_last_30, policies_prev_30),
            'total_revenue': float(revenue_last_30),
            'revenue_growth': calculate_growth(float(revenue_last_30), float(revenue_prev_30)),
            'pending_claims': pending_claims,
            'claims_change': claims_last_30 - claims_prev_30,
        },
        'recent_transactions': [serialize_transaction(t) for t in recent_transactions],
        'recent_users': [serialize_user(u, u.policies_count, u.total_spent) for u in recent_users],
        'pending_tasks': pending_tasks,
    })


# ==================== User Management ====================

class UserManagementViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def _get_queryset(self):
        queryset = User.objects.annotate(
            policies_count=Count('policy', distinct=True),
            total_spent=Sum('transactions__amount', filter=Q(transactions__status='completed'))
        )
        search = self.request.query_params.get('search')
        role = self.request.query_params.get('role')
        status_filter = self.request.query_params.get('status')

        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(phone__icontains=search)
            )
        if role:
            queryset = queryset.filter(role=role)
        if status_filter == 'active':
            queryset = queryset.filter(is_active=True)
        elif status_filter == 'suspended':
            queryset = queryset.filter(is_active=False)

        return queryset.order_by('-created_at')

    def list(self, request):
        queryset = self._get_queryset()
        data = [serialize_user(u, u.policies_count, u.total_spent) for u in queryset]
        return Response({'results': data, 'count': len(data)})

    def retrieve(self, request, pk=None):
        try:
            u = User.objects.annotate(
                policies_count=Count('policy', distinct=True),
                total_spent=Sum('transactions__amount', filter=Q(transactions__status='completed'))
            ).get(pk=pk)
            return Response(serialize_user(u, u.policies_count, u.total_spent))
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    def partial_update(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            for field in ['first_name', 'last_name', 'email', 'phone', 'role']:
                if field in request.data:
                    setattr(user, field, request.data[field])
            user.save()
            return Response(serialize_user(user))
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    def destroy(self, request, pk=None):
        try:
            User.objects.get(pk=pk).delete()
            return Response(status=204)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = False
            user.save()
            return Response({'message': 'User suspended successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = True
            user.save()
            return Response({'message': 'User activated successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


# ==================== Claims Management ====================

class ClaimsManagementViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def _get_queryset(self):
        queryset = Claim.objects.select_related(
            'user', 'policy', 'policy__policy_type', 'assessor'
        ).annotate(documents_count=Count('documents'))

        status_filter = self.request.query_params.get('status')
        if status_filter:
            backend_status = 'submitted' if status_filter == 'pending' else status_filter
            queryset = queryset.filter(status=backend_status)

        return queryset.order_by('-filed_date')

    def list(self, request):
        queryset = self._get_queryset()
        data = [serialize_claim(c) for c in queryset]
        return Response({'results': data, 'count': len(data)})

    def retrieve(self, request, pk=None):
        try:
            c = Claim.objects.select_related(
                'user', 'policy', 'policy__policy_type', 'assessor'
            ).annotate(documents_count=Count('documents')).get(pk=pk)
            return Response(serialize_claim(c))
        except Claim.DoesNotExist:
            return Response({'error': 'Claim not found'}, status=404)

    @action(detail=True, methods=['patch'])
    def assign(self, request, pk=None):
        try:
            claim = Claim.objects.select_related(
                'user', 'policy', 'policy__policy_type', 'assessor'
            ).annotate(documents_count=Count('documents')).get(pk=pk)
        except Claim.DoesNotExist:
            return Response({'error': 'Claim not found'}, status=404)

        assessor_id = request.data.get('assessor_id')
        try:
            assessor = User.objects.get(pk=assessor_id)
            claim.assessor = assessor
            claim.status = 'under_review'
            claim.assigned_at = timezone.now()
            claim.save()
            return Response(serialize_claim(claim))
        except User.DoesNotExist:
            return Response({'error': 'Assessor not found'}, status=400)

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        try:
            claim = Claim.objects.select_related(
                'user', 'policy', 'policy__policy_type', 'assessor'
            ).annotate(documents_count=Count('documents')).get(pk=pk)
        except Claim.DoesNotExist:
            return Response({'error': 'Claim not found'}, status=404)

        settlement_amount = request.data.get('settlement_amount', float(claim.amount_claimed))
        claim.status = 'approved'
        claim.amount_approved = settlement_amount
        claim.assessment_date = timezone.now()
        claim.save()
        return Response(serialize_claim(claim))

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        try:
            claim = Claim.objects.select_related(
                'user', 'policy', 'policy__policy_type', 'assessor'
            ).annotate(documents_count=Count('documents')).get(pk=pk)
        except Claim.DoesNotExist:
            return Response({'error': 'Claim not found'}, status=404)

        rejection_reason = request.data.get('rejection_reason', '')
        claim.status = 'rejected'
        claim.rejection_reason = rejection_reason
        claim.assessment_date = timezone.now()
        claim.save()
        return Response(serialize_claim(claim))


# ==================== Transaction Management ====================

class TransactionManagementViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]

    def _get_queryset(self):
        queryset = Transaction.objects.select_related('user', 'policy')
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')
        payment_method = self.request.query_params.get('payment_method')

        if search:
            queryset = queryset.filter(
                Q(transaction_number__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search)
            )
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)

        return queryset.order_by('-created_at')

    def list(self, request):
        queryset = self._get_queryset()
        data = [serialize_transaction(t) for t in queryset]
        return Response({'results': data, 'count': len(data)})

    def retrieve(self, request, pk=None):
        try:
            t = Transaction.objects.select_related('user', 'policy').get(pk=pk)
            return Response(serialize_transaction(t))
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=404)

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        try:
            txn = Transaction.objects.select_related('user', 'policy').get(pk=pk)
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=404)

        if txn.status in ['failed', 'cancelled']:
            txn.status = 'pending'
            txn.save()
        return Response(serialize_transaction(txn))

    @action(detail=False, methods=['get'])
    def failed(self, request):
        queryset = Transaction.objects.select_related('user', 'policy').filter(
            status='failed'
        ).order_by('-created_at')
        return Response([serialize_transaction(t) for t in queryset])


# ==================== Policy Management ====================

class PolicyTypeManagementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class = PolicyTypeSerializer
    queryset = PolicyType.objects.select_related('category').all()
    pagination_class = None  # Return plain array, not paginated object


class InsuranceCompanyManagementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    serializer_class = InsuranceCompanySerializer
    queryset = InsuranceCompany.objects.all()
    pagination_class = None  # Return plain array, not paginated object


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_admin_policies(request):
    """List all user policies (admin view)"""
    policies = Policy.objects.select_related(
        'user', 'policy_type', 'insurance_company'
    ).order_by('-created_at')[:100]

    data = [{
        'id': str(p.id),
        'policy_number': p.policy_number,
        'user': {'id': str(p.user.id), 'name': p.user.full_name, 'email': p.user.email},
        'policy_type': p.policy_type.name if p.policy_type else '',
        'insurance_company': p.insurance_company.name if p.insurance_company else '',
        'premium_amount': float(p.premium_amount),
        'status': p.status,
        'start_date': str(p.start_date) if p.start_date else None,
        'end_date': str(p.end_date) if p.end_date else None,
        'created_at': p.created_at.isoformat(),
    } for p in policies]

    return Response({'results': data, 'count': len(data)})


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def approve_policy(request, policy_id):
    try:
        policy = Policy.objects.get(pk=policy_id)
        policy.status = 'active'
        policy.activated_at = timezone.now()
        policy.save()
        return Response({'message': 'Policy approved'})
    except Policy.DoesNotExist:
        return Response({'error': 'Policy not found'}, status=404)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def cancel_policy(request, policy_id):
    try:
        policy = Policy.objects.get(pk=policy_id)
        policy.status = 'cancelled'
        policy.cancelled_at = timezone.now()
        policy.save()
        return Response({'message': 'Policy cancelled'})
    except Policy.DoesNotExist:
        return Response({'error': 'Policy not found'}, status=404)


# ==================== Reports ====================

@api_view(['GET'])
@permission_classes([IsAdmin])
def get_sales_report(request):
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    policies = Policy.objects.all()
    if date_from:
        policies = policies.filter(created_at__gte=date_from)
    if date_to:
        policies = policies.filter(created_at__lte=date_to)

    category_data = policies.values('policy_type__category__name').annotate(
        count=Count('id'), amount=Sum('premium_amount')
    ).order_by('-amount')

    return Response({
        'sales': {
            'total_sales': policies.count(),
            'growth': 0,
            'by_category': [
                {
                    'category': item['policy_type__category__name'] or 'Unknown',
                    'count': item['count'],
                    'amount': float(item['amount'] or 0),
                }
                for item in category_data
            ],
        }
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_revenue_report(request):
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    transactions = Transaction.objects.filter(status='completed')
    if date_from:
        transactions = transactions.filter(created_at__gte=date_from)
    if date_to:
        transactions = transactions.filter(created_at__lte=date_to)

    total_revenue = transactions.aggregate(total=Sum('amount'))['total'] or 0

    by_period = []
    for i in range(5, -1, -1):
        month_start = (timezone.now() - timedelta(days=30 * i)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        month_end = (month_start + timedelta(days=31)).replace(day=1)
        month_total = Transaction.objects.filter(
            status='completed', created_at__gte=month_start, created_at__lt=month_end
        ).aggregate(total=Sum('amount'))['total'] or 0
        by_period.append({'period': month_start.strftime('%b %Y'), 'amount': float(month_total)})

    return Response({
        'revenue': {
            'total_revenue': float(total_revenue),
            'growth': 0,
            'by_period': by_period,
        }
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_claims_report(request):
    claims = Claim.objects.all()
    by_status = [
        {'status': s, 'count': claims.filter(status=s).count()}
        for s in ['submitted', 'under_review', 'approved', 'rejected', 'settled']
    ]
    total_claims = claims.count()
    total_policies = Policy.objects.count()
    avg_settlement = claims.filter(amount_approved__isnull=False).aggregate(
        avg=Avg('amount_approved')
    )['avg'] or 0

    return Response({
        'claims': {
            'total_claims': total_claims,
            'claims_ratio': round(total_claims / total_policies, 4) if total_policies > 0 else 0,
            'avg_settlement': float(avg_settlement),
            'by_status': by_status,
        }
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_user_growth_report(request):
    thirty_days_ago = timezone.now() - timedelta(days=30)
    return Response({
        'users': {
            'total_users': User.objects.count(),
            'new_users': User.objects.filter(created_at__gte=thirty_days_ago).count(),
            'retention_rate': 0.85,
            'by_role': [
                {'role': role, 'count': User.objects.filter(role=role).count()}
                for role in ['customer', 'staff', 'admin', 'assessor']
            ],
        }
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def export_report(request, report_id):
    """Export report as CSV"""
    from django.http import HttpResponse

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{report_id}-report.csv"'
    writer = csv.writer(response)

    if report_id == 'transactions':
        writer.writerow(['Reference', 'User', 'Amount', 'Method', 'Status', 'Date'])
        for t in Transaction.objects.select_related('user').order_by('-created_at')[:1000]:
            writer.writerow([
                t.transaction_number,
                f'{t.user.first_name} {t.user.last_name}',
                float(t.amount), t.payment_method, t.status,
                t.created_at.strftime('%Y-%m-%d'),
            ])
    elif report_id == 'sales':
        writer.writerow(['Policy Number', 'Type', 'Premium', 'Status', 'Date'])
        for p in Policy.objects.select_related('policy_type').order_by('-created_at')[:1000]:
            writer.writerow([
                p.policy_number,
                p.policy_type.name if p.policy_type else '',
                float(p.premium_amount), p.status,
                p.created_at.strftime('%Y-%m-%d'),
            ])
    else:
        writer.writerow(['Report', 'Generated'])
        writer.writerow([report_id, timezone.now().strftime('%Y-%m-%d %H:%M')])

    return response


# ==================== Settings ====================

@api_view(['GET', 'PATCH'])
@permission_classes([IsAdmin])
def admin_settings(request):
    import os
    if request.method == 'GET':
        return Response({
            'site_name': os.getenv('SITE_NAME', 'Bowman Insurance'),
            'support_email': os.getenv('SUPPORT_EMAIL', 'support@bowmaninsurance.co.ke'),
            'support_phone': os.getenv('SUPPORT_PHONE', '+254 700 000 000'),
            'mpesa_enabled': True,
            'card_enabled': True,
        })
    return Response({'message': 'Settings noted. Update .env to persist credential changes.'})


# ==================== Roles ====================

@api_view(['GET'])
@permission_classes([IsAdmin])
def get_roles(request):
    return Response([
        {'id': 'admin', 'name': 'Admin', 'description': 'Full system access'},
        {'id': 'staff', 'name': 'Staff', 'description': 'Limited admin access'},
        {'id': 'customer', 'name': 'Customer', 'description': 'Standard user access'},
        {'id': 'assessor', 'name': 'Assessor', 'description': 'Claims assessment access'},
    ])
