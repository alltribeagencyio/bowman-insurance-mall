import uuid
from django.db import models
from django.conf import settings


class Document(models.Model):
    """Document storage"""

    DOCUMENT_TYPE_CHOICES = [
        ('id_copy', 'ID Copy'),
        ('kra_pin', 'KRA PIN'),
        ('passport', 'Passport'),
        ('driving_license', 'Driving License'),
        ('logbook', 'Logbook'),
        ('certificate', 'Insurance Certificate'),
        ('receipt', 'Receipt'),
        ('policy_document', 'Policy Document'),
        ('claim_document', 'Claim Document'),
        ('medical_card', 'Medical Card'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    policy = models.ForeignKey('policies.Policy', on_delete=models.CASCADE, null=True, blank=True, related_name='documents')

    # Document details
    type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES, db_index=True)
    title = models.CharField(max_length=200)
    filename = models.CharField(max_length=255)
    s3_key = models.CharField(max_length=500, unique=True)
    file_size = models.IntegerField(help_text='File size in bytes')
    mime_type = models.CharField(max_length=100)

    # Verification
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'documents'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['user', 'type']),
            models.Index(fields=['policy', 'type']),
        ]

    def __str__(self):
        return f"{self.title} - {self.user.full_name}"

    @property
    def file_url(self):
        """Generate S3 presigned URL"""
        # Will be implemented in views/serializers
        return f"/api/v1/documents/{self.id}/download/"
