import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Claim(models.Model):
    """Insurance claims"""

    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('documents_requested', 'Documents Requested'),
        ('assessment_complete', 'Assessment Complete'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('settled', 'Settled'),
    ]

    TYPE_CHOICES = [
        ('accident', 'Accident'),
        ('theft', 'Theft'),
        ('fire', 'Fire'),
        ('medical', 'Medical'),
        ('death', 'Death'),
        ('disability', 'Disability'),
        ('property_damage', 'Property Damage'),
        ('third_party', 'Third Party'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    claim_number = models.CharField(max_length=50, unique=True, db_index=True)
    policy = models.ForeignKey('policies.Policy', on_delete=models.PROTECT, related_name='claims')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='claims')

    # Claim details
    type = models.CharField(max_length=50, choices=TYPE_CHOICES, db_index=True)
    description = models.TextField()
    incident_date = models.DateField()
    incident_location = models.CharField(max_length=255)
    amount_claimed = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    amount_approved = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Status and workflow
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='submitted', db_index=True)
    assessor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assessed_claims'
    )
    assessor_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True, null=True)

    # Timestamps
    filed_date = models.DateTimeField(auto_now_add=True, db_index=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    assessment_date = models.DateTimeField(null=True, blank=True)
    settlement_date = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'claims'
        ordering = ['-filed_date']
        indexes = [
            models.Index(fields=['policy', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['assessor', 'status']),
            models.Index(fields=['status', 'filed_date']),
        ]

    def __str__(self):
        return f"{self.claim_number} - {self.policy.policy_number}"

    @property
    def is_pending(self):
        return self.status in ['submitted', 'under_review', 'documents_requested']

    @property
    def is_approved(self):
        return self.status == 'approved'

    @property
    def is_settled(self):
        return self.status == 'settled'


class ClaimDocument(models.Model):
    """Documents attached to claims"""

    DOCUMENT_TYPE_CHOICES = [
        ('police_report', 'Police Report'),
        ('medical_report', 'Medical Report'),
        ('photos', 'Photos'),
        ('videos', 'Videos'),
        ('receipts', 'Receipts'),
        ('invoices', 'Invoices'),
        ('witness_statement', 'Witness Statement'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=DOCUMENT_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    file_url = models.URLField()
    file_size = models.IntegerField(help_text='File size in bytes')
    mime_type = models.CharField(max_length=100)

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_claim_documents'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'claim_documents'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.document_type} for {self.claim.claim_number}"


class ClaimStatusHistory(models.Model):
    """Track claim status changes"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='status_history')
    from_status = models.CharField(max_length=30, blank=True)
    to_status = models.CharField(max_length=30)
    notes = models.TextField(blank=True)

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='claim_status_changes'
    )
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'claim_status_history'
        ordering = ['-changed_at']
        verbose_name_plural = 'Claim Status Histories'

    def __str__(self):
        return f"{self.claim.claim_number}: {self.from_status} → {self.to_status}"


class ClaimSettlement(models.Model):
    """Settlement details for approved claims"""

    PAYMENT_METHOD_CHOICES = [
        ('bank_transfer', 'Bank Transfer'),
        ('mpesa', 'M-Pesa'),
        ('cheque', 'Cheque'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    claim = models.OneToOneField(Claim, on_delete=models.CASCADE, related_name='settlement')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)

    # Payment details
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=50, blank=True)
    mpesa_phone = models.CharField(max_length=20, blank=True)
    cheque_number = models.CharField(max_length=50, blank=True)
    reference_number = models.CharField(max_length=100, blank=True)

    # Processing
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='processed_settlements'
    )
    notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'claim_settlements'
        ordering = ['-created_at']

    def __str__(self):
        return f"Settlement for {self.claim.claim_number} - {self.amount}"
