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

from .models import InsuranceCompany, PolicyCategory, PolicyType, Policy, PolicyReview
from .serializers import (
    InsuranceCompanySerializer,
    PolicyCategorySerializer,
    PolicyTypeListSerializer,
    PolicyTypeDetailSerializer,
    PolicySerializer,
    PolicyCreateSerializer,
    PolicyReviewSerializer,
    PolicyRenewalSerializer
)


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
    queryset = PolicyType.objects.filter(is_active=True).select_related(
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
