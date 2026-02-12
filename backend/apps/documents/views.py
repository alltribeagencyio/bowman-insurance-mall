"""Documents Views"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for document management
    GET /api/v1/documents/ - List documents
    POST /api/v1/documents/ - Upload document
    GET /api/v1/documents/:id/ - Get document details
    DELETE /api/v1/documents/:id/ - Delete document
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'filename', 'type']
    ordering_fields = ['uploaded_at', 'title']
    ordering = ['-uploaded_at']

    def get_queryset(self):
        user = self.request.user

        if user.role in ['admin', 'staff']:
            queryset = Document.objects.all()
        else:
            queryset = Document.objects.filter(user=user)

        return queryset.select_related('user', 'policy', 'verified_by')

    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentUploadSerializer
        return DocumentSerializer

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Verify a document (admin only)"""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        document = self.get_object()
        document.is_verified = True
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.save()

        return Response({'message': 'Document verified successfully'})

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Get download URL for document"""
        document = self.get_object()

        # For now, return the s3_key - frontend should handle actual download
        # In production, generate presigned S3 URL here
        return Response({
            'download_url': f"/media/{document.s3_key}",  # Placeholder
            'filename': document.filename,
            'mime_type': document.mime_type
        })

    @action(detail=False, methods=['get'])
    def by_policy(self, request):
        """Get documents by policy"""
        policy_id = request.query_params.get('policy_id')
        if not policy_id:
            return Response({'error': 'policy_id required'}, status=400)

        documents = self.get_queryset().filter(policy_id=policy_id)
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)
