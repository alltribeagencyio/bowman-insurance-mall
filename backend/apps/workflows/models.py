import uuid
from django.db import models
from django.conf import settings


class WorkflowStage(models.Model):
    """Track policy workflow stages"""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
        ('failed', 'Failed'),
    ]

    STAGE_CHOICES = [
        ('quote_generated', 'Quote Generated'),
        ('payment_pending', 'Payment Pending'),
        ('payment_received', 'Payment Received'),
        ('underwriting', 'Underwriting'),
        ('document_verification', 'Document Verification'),
        ('approval', 'Approval'),
        ('policy_issuance', 'Policy Issuance'),
        ('certificate_generation', 'Certificate Generation'),
        ('active', 'Active'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    policy = models.ForeignKey('policies.Policy', on_delete=models.CASCADE, related_name='workflow_stages')
    stage_name = models.CharField(max_length=50, choices=STAGE_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)

    # Assignment
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_workflow_stages'
    )

    # Notes and metadata
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workflow_stages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['policy', 'status']),
            models.Index(fields=['assigned_to', 'status']),
        ]

    def __str__(self):
        return f"{self.policy.policy_number} - {self.stage_name} ({self.status})"

    def mark_completed(self, notes=''):
        """Mark stage as completed"""
        from django.utils import timezone
        self.status = 'completed'
        self.completed_at = timezone.now()
        if notes:
            self.notes = notes
        self.save()

    def assign_to_user(self, user):
        """Assign stage to user"""
        from django.utils import timezone
        self.assigned_to = user
        if self.status == 'pending':
            self.status = 'in_progress'
            self.started_at = timezone.now()
        self.save()
