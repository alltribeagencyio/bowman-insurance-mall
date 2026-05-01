"""
Policy Views
API endpoints for policy management
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Avg
from datetime import timedelta

from .models import InsuranceCompany, PolicyCategory, PolicyType, Policy, PolicyReview, Vehicle
from .serializers import (
    InsuranceCompanySerializer,
    PolicyCategorySerializer,
    PolicyTypeListSerializer,
    PolicyTypeDetailSerializer,
    PolicySerializer,
    PolicyCreateSerializer,
    PolicyReviewSerializer,
    PolicyRenewalSerializer,
    VehicleSerializer,
)


class VehicleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for customer vehicles
    GET    /api/v1/assets/vehicles/       - list user's vehicles
    POST   /api/v1/assets/vehicles/       - add a vehicle
    GET    /api/v1/assets/vehicles/:id/   - get vehicle detail
    PATCH  /api/v1/assets/vehicles/:id/   - update vehicle
    DELETE /api/v1/assets/vehicles/:id/   - remove vehicle
    """
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Vehicle.objects.filter(user=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()


class InsuranceCompanyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for insurance companies (read-only for customers)
    GET /api/v1/policies/companies/
    GET /api/v1/policies/companies/:id/
    """
    queryset = InsuranceCompany.objects.filter(is_active=True)
    serializer_class = InsuranceCompanySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'rating', 'created_at']
    ordering = ['-rating', 'name']


class PolicyCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for policy categories
    GET /api/v1/policies/categories/
    GET /api/v1/policies/categories/:id/
    """
    queryset = PolicyCategory.objects.filter(is_active=True)
    serializer_class = PolicyCategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    ordering = ['display_order', 'name']


class PolicyTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for policy types (browsable insurance products)
    GET /api/v1/policies/types/
    GET /api/v1/policies/types/:id/
    """
    queryset = PolicyType.objects.filter(is_active=True, status='published').select_related(
        'category', 'insurance_company'
    )
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'insurance_company__name']
    ordering_fields = ['base_premium', 'created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PolicyTypeDetailSerializer
        return PolicyTypeListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by category
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        # Filter by company
        company_id = self.request.query_params.get('company')
        if company_id:
            queryset = queryset.filter(insurance_company_id=company_id)

        # Filter featured only
        featured = self.request.query_params.get('featured')
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(base_premium__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_premium__lte=max_price)

        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured policy types"""
        featured_policies = self.get_queryset().filter(is_featured=True)[:6]
        serializer = self.get_serializer(featured_policies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def quote(self, request):
        """
        Generate premium quote for a policy type.
        POST /api/v1/policies/types/quote/
        Body: { policy_type_id, coverage_amount, start_date }

        For motor comprehensive (rate_type=commission_percent):
          coverage_amount = vehicle market value
          net_premium = vehicle_value * commission_rate / 100

        For flat-rate policies:
          net_premium = base_premium
        """
        from decimal import Decimal, ROUND_HALF_UP
        from datetime import datetime, timedelta

        policy_type_id = request.data.get('policy_type_id')
        coverage_amount = request.data.get('coverage_amount')
        start_date = request.data.get('start_date')

        if not all([policy_type_id, coverage_amount, start_date]):
            return Response(
                {'error': 'policy_type_id, coverage_amount, and start_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            policy_type = PolicyType.objects.select_related(
                'insurance_company', 'category'
            ).get(id=policy_type_id, is_active=True)
        except PolicyType.DoesNotExist:
            return Response({'error': 'Policy type not found'}, status=status.HTTP_404_NOT_FOUND)

        coverage = Decimal(str(coverage_amount))

        # ── Net premium calculation ──────────────────────────────────────────
        if policy_type.rate_type == 'commission_percent' and policy_type.commission_rate:
            rate = Decimal(str(policy_type.commission_rate))
            net_premium = (coverage * rate / Decimal('100')).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP
            )
            rate_description = f'{rate}% of insured value'
        else:
            net_premium = Decimal(str(policy_type.base_premium))
            rate_description = 'Flat rate'

        # ── Kenya statutory levies (IRA) ─────────────────────────────────────
        # IRA Levy: 0.2% of net premium
        ira_levy = (net_premium * Decimal('0.002')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        # PHF (Policyholders Compensation Fund): 0.25% of net premium
        phf = (net_premium * Decimal('0.0025')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        # Training Levy: 0.1% of net premium
        training_levy = (net_premium * Decimal('0.001')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        # Stamp Duty: fixed KES 40
        stamp_duty = Decimal('40.00')

        total_levies = ira_levy + phf + training_levy + stamp_duty
        total_premium = net_premium + total_levies

        valid_until = (datetime.now() + timedelta(days=30)).isoformat()

        return Response({
            'policy_type': {
                'id': str(policy_type.id),
                'name': policy_type.name,
                'rate_type': policy_type.rate_type,
                'commission_rate': str(policy_type.commission_rate) if policy_type.commission_rate else None,
            },
            'coverage_amount': str(coverage),
            'rate_description': rate_description,
            'net_premium': str(net_premium),
            'levies': {
                'ira_levy': str(ira_levy),
                'phf': str(phf),
                'training_levy': str(training_levy),
                'stamp_duty': str(stamp_duty),
                'total': str(total_levies),
            },
            'total_premium': str(total_premium),
            'valid_until': valid_until,
        })


class PolicyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for customer policies
    GET /api/v1/policies/ - List user's policies
    POST /api/v1/policies/ - Create new policy (purchase)
    GET /api/v1/policies/:id/ - Get policy details
    PUT /api/v1/policies/:id/ - Update policy
    DELETE /api/v1/policies/:id/ - Cancel policy
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['policy_number', 'policy_type__name', 'insurance_company__name']
    ordering_fields = ['created_at', 'start_date', 'end_date', 'premium_amount']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user

        # Admin/staff can see all policies
        if user.role in ['admin', 'staff']:
            queryset = Policy.objects.all()
        else:
            queryset = Policy.objects.filter(user=user)

        return queryset.select_related(
            'user', 'policy_type', 'insurance_company',
            'policy_type__category'
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return PolicyCreateSerializer
        return PolicySerializer

    def perform_create(self, serializer):
        """Create policy with current user"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_policies(self, request):
        """Get current user's policies"""
        policies = self.get_queryset().filter(user=request.user)

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            policies = policies.filter(status=status_filter)

        serializer = self.get_serializer(policies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get user's active policies"""
        policies = self.get_queryset().filter(
            user=request.user,
            status='active'
        )
        serializer = self.get_serializer(policies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """Get policies expiring in next 30 days"""
        today = timezone.now().date()
        expiry_date = today + timedelta(days=30)

        policies = self.get_queryset().filter(
            user=request.user,
            status='active',
            end_date__gte=today,
            end_date__lte=expiry_date
        )
        serializer = self.get_serializer(policies, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Renew an existing policy"""
        policy = self.get_object()

        # Only owner or admin can renew
        if request.user != policy.user and request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'You do not have permission to renew this policy'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = PolicyRenewalSerializer(data=request.data)
        if serializer.is_valid():
            # Create new policy based on old one
            new_policy = Policy.objects.create(
                user=policy.user,
                policy_type=policy.policy_type,
                insurance_company=policy.insurance_company,
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date'],
                premium_amount=serializer.validated_data.get('premium_amount', policy.premium_amount),
                coverage_amount=policy.coverage_amount,
                payment_frequency=policy.payment_frequency,
                policy_data=policy.policy_data,
                beneficiaries=policy.beneficiaries,
                status='pending',
                policy_number=self._generate_policy_number()
            )

            return Response(
                PolicySerializer(new_policy).data,
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a policy"""
        policy = self.get_object()

        # Only owner or admin can cancel
        if request.user != policy.user and request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'You do not have permission to cancel this policy'},
                status=status.HTTP_403_FORBIDDEN
            )

        if policy.status == 'cancelled':
            return Response(
                {'error': 'Policy is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        policy.status = 'cancelled'
        policy.cancelled_at = timezone.now()
        policy.save()

        return Response(
            {'message': 'Policy cancelled successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a pending policy (admin only)"""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Only admins can activate policies'},
                status=status.HTTP_403_FORBIDDEN
            )

        policy = self.get_object()

        if policy.status != 'pending':
            return Response(
                {'error': 'Only pending policies can be activated'},
                status=status.HTTP_400_BAD_REQUEST
            )

        policy.status = 'active'
        policy.activated_at = timezone.now()
        policy.save()

        return Response(
            {'message': 'Policy activated successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def request_valuation_extension(self, request, pk=None):
        """Customer requests more time for vehicle valuation."""
        policy = self.get_object()
        if policy.user != request.user:
            return Response({'error': 'Not your policy'}, status=status.HTTP_403_FORBIDDEN)
        if policy.payment_stage != 'valuation_pending':
            return Response(
                {'error': 'Valuation extension only applies to policies awaiting valuation'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if policy.valuation_extension_requested:
            return Response({'error': 'Extension already requested'}, status=status.HTTP_400_BAD_REQUEST)

        policy.valuation_extension_requested = True
        policy.save(update_fields=['valuation_extension_requested'])
        return Response({'message': 'Valuation extension request submitted. Awaiting approval.'})

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get policy statistics for current user"""
        user_policies = self.get_queryset().filter(user=request.user)

        stats = {
            'total_policies': user_policies.count(),
            'active_policies': user_policies.filter(status='active').count(),
            'pending_policies': user_policies.filter(status='pending').count(),
            'expired_policies': user_policies.filter(status='expired').count(),
            'cancelled_policies': user_policies.filter(status='cancelled').count(),
            'total_premium': sum(p.premium_amount for p in user_policies.filter(status='active')),
            'total_coverage': sum(p.coverage_amount for p in user_policies.filter(status='active')),
        }

        return Response(stats)

    def _generate_policy_number(self):
        """Generate unique policy number"""
        import random
        import string

        year = timezone.now().year
        random_digits = ''.join(random.choices(string.digits, k=6))
        policy_number = f"POL-{year}-{random_digits}"

        while Policy.objects.filter(policy_number=policy_number).exists():
            random_digits = ''.join(random.choices(string.digits, k=6))
            policy_number = f"POL-{year}-{random_digits}"

        return policy_number


class PolicyReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for policy reviews
    GET /api/v1/policies/reviews/
    POST /api/v1/policies/reviews/
    """
    queryset = PolicyReview.objects.filter(is_published=True)
    serializer_class = PolicyReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by policy
        policy_id = self.request.query_params.get('policy')
        if policy_id:
            queryset = queryset.filter(policy_id=policy_id)

        # Admin can see all reviews
        if self.request.user.role in ['admin', 'staff']:
            return PolicyReview.objects.all()

        return queryset

    def perform_create(self, serializer):
        """Create review for authenticated user"""
        policy = serializer.validated_data['policy']

        # Check if user owns the policy
        if policy.user != self.request.user:
            # Check if policy exists for user
            is_verified = Policy.objects.filter(
                user=self.request.user,
                policy_type=policy.policy_type,
                status='active'
            ).exists()
        else:
            is_verified = True

        serializer.save(
            user=self.request.user,
            is_verified_purchase=is_verified
        )
