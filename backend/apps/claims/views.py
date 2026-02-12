"""
Claims Views
API endpoints for claims management
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Sum, Q, Avg
from datetime import timedelta

from .models import Claim, ClaimDocument, ClaimStatusHistory, ClaimSettlement
from .serializers import (
    ClaimSerializer,
    ClaimCreateSerializer,
    ClaimUpdateSerializer,
    ClaimDocumentSerializer,
    ClaimDocumentUploadSerializer,
    ClaimStatusHistorySerializer,
    ClaimSettlementSerializer
)


class ClaimViewSet(viewsets.ModelViewSet):
    """
    ViewSet for claims management
    GET /api/v1/claims/ - List claims
    POST /api/v1/claims/ - Submit new claim
    GET /api/v1/claims/:id/ - Get claim details
    PUT /api/v1/claims/:id/ - Update claim (admin only)
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['claim_number', 'policy__policy_number', 'description']
    ordering_fields = ['filed_date', 'amount_claimed', 'status']
    ordering = ['-filed_date']

    def get_queryset(self):
        user = self.request.user

        # Admin/staff can see all claims
        if user.role in ['admin', 'staff']:
            queryset = Claim.objects.all()
        else:
            queryset = Claim.objects.filter(user=user)

        return queryset.select_related(
            'policy', 'user', 'assessor',
            'policy__policy_type', 'policy__insurance_company'
        ).prefetch_related('documents', 'status_history')

    def get_serializer_class(self):
        if self.action == 'create':
            return ClaimCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClaimUpdateSerializer
        return ClaimSerializer

    def perform_create(self, serializer):
        """Create claim for authenticated user"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_claims(self, request):
        """Get current user's claims"""
        claims = self.get_queryset().filter(user=request.user)

        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            claims = claims.filter(status=status_filter)

        # Filter by policy
        policy_id = request.query_params.get('policy')
        if policy_id:
            claims = claims.filter(policy_id=policy_id)

        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending claims (admin)"""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        claims = self.get_queryset().filter(
            status__in=['submitted', 'under_review', 'documents_requested']
        )
        serializer = self.get_serializer(claims, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign claim to assessor (admin only)"""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        claim = self.get_object()
        assessor_id = request.data.get('assessor_id')

        if not assessor_id:
            return Response(
                {'error': 'Assessor ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Assign assessor
        from apps.users.models import User
        try:
            assessor = User.objects.get(id=assessor_id, role__in=['admin', 'staff'])
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid assessor'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = claim.status
        claim.assessor = assessor
        claim.status = 'under_review'
        claim.assigned_at = timezone.now()
        claim.save()

        # Create status history
        ClaimStatusHistory.objects.create(
            claim=claim,
            from_status=old_status,
            to_status='under_review',
            notes=f'Assigned to {assessor.full_name}',
            changed_by=request.user
        )

        return Response(
            {'message': f'Claim assigned to {assessor.full_name}'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a claim (admin only)"""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        claim = self.get_object()
        amount_approved = request.data.get('amount_approved')
        notes = request.data.get('notes', '')

        if not amount_approved:
            return Response(
                {'error': 'Approved amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = claim.status
        claim.status = 'approved'
        claim.amount_approved = amount_approved
        claim.assessor_notes = notes
        claim.assessment_date = timezone.now()
        claim.save()

        # Create status history
        ClaimStatusHistory.objects.create(
            claim=claim,
            from_status=old_status,
            to_status='approved',
            notes=notes,
            changed_by=request.user
        )

        return Response(
            {'message': 'Claim approved successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a claim (admin only)"""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        claim = self.get_object()
        rejection_reason = request.data.get('rejection_reason')

        if not rejection_reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = claim.status
        claim.status = 'rejected'
        claim.rejection_reason = rejection_reason
        claim.assessment_date = timezone.now()
        claim.save()

        # Create status history
        ClaimStatusHistory.objects.create(
            claim=claim,
            from_status=old_status,
            to_status='rejected',
            notes=rejection_reason,
            changed_by=request.user
        )

        return Response(
            {'message': 'Claim rejected'},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def settle(self, request, pk=None):
        """Settle an approved claim (admin only)"""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        claim = self.get_object()

        if claim.status != 'approved':
            return Response(
                {'error': 'Only approved claims can be settled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create settlement
        serializer = ClaimSettlementSerializer(data=request.data)
        if serializer.is_valid():
            settlement = serializer.save(
                claim=claim,
                processed_by=request.user
            )

            # Update claim status
            old_status = claim.status
            claim.status = 'settled'
            claim.settlement_date = timezone.now()
            claim.save()

            # Create status history
            ClaimStatusHistory.objects.create(
                claim=claim,
                from_status=old_status,
                to_status='settled',
                notes=f'Settlement processed via {settlement.payment_method}',
                changed_by=request.user
            )

            return Response(
                {'message': 'Claim settled successfully'},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def upload_document(self, request, pk=None):
        """Upload document for claim"""
        claim = self.get_object()

        # Only owner or admin can upload documents
        if request.user != claim.user and request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ClaimDocumentUploadSerializer(
            data=request.data,
            context={'request': request, 'claim': claim}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get claim documents"""
        claim = self.get_object()
        documents = claim.documents.all()
        serializer = ClaimDocumentSerializer(documents, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get claim status history"""
        claim = self.get_object()
        history = claim.status_history.all()
        serializer = ClaimStatusHistorySerializer(history, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get claims statistics"""
        user = request.user

        if user.role in ['admin', 'staff']:
            queryset = Claim.objects.all()
        else:
            queryset = Claim.objects.filter(user=user)

        stats = {
            'total_claims': queryset.count(),
            'submitted': queryset.filter(status='submitted').count(),
            'under_review': queryset.filter(status='under_review').count(),
            'approved': queryset.filter(status='approved').count(),
            'rejected': queryset.filter(status='rejected').count(),
            'settled': queryset.filter(status='settled').count(),
            'total_claimed': queryset.aggregate(total=Sum('amount_claimed'))['total'] or 0,
            'total_approved': queryset.filter(status__in=['approved', 'settled']).aggregate(
                total=Sum('amount_approved')
            )['total'] or 0,
        }

        return Response(stats)
