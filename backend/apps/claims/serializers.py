"""
Serializers for Claims App
"""
from rest_framework import serializers
from .models import Claim, ClaimDocument, ClaimStatusHistory, ClaimSettlement
from apps.policies.models import Policy


class ClaimDocumentSerializer(serializers.ModelSerializer):
    """Serializer for claim documents"""

    class Meta:
        model = ClaimDocument
        fields = [
            'id', 'claim', 'document_type', 'title', 'file_url',
            'file_size', 'mime_type', 'uploaded_by', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']


class ClaimStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for claim status history"""
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True)

    class Meta:
        model = ClaimStatusHistory
        fields = [
            'id', 'claim', 'from_status', 'to_status',
            'notes', 'changed_by', 'changed_by_name', 'changed_at'
        ]
        read_only_fields = ['id', 'changed_by', 'changed_at']


class ClaimSettlementSerializer(serializers.ModelSerializer):
    """Serializer for claim settlements"""
    processed_by_name = serializers.CharField(source='processed_by.full_name', read_only=True)

    class Meta:
        model = ClaimSettlement
        fields = [
            'id', 'claim', 'amount', 'payment_method',
            'bank_name', 'account_number', 'mpesa_phone',
            'cheque_number', 'reference_number', 'processed_by',
            'processed_by_name', 'notes', 'created_at', 'processed_at'
        ]
        read_only_fields = ['id', 'processed_by', 'created_at', 'processed_at']


class ClaimSerializer(serializers.ModelSerializer):
    """Serializer for claims"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    policy_number = serializers.CharField(source='policy.policy_number', read_only=True)
    policy_type = serializers.CharField(source='policy.policy_type.name', read_only=True)
    company_name = serializers.CharField(source='policy.insurance_company.name', read_only=True)
    assessor_name = serializers.CharField(source='assessor.full_name', read_only=True, allow_null=True)
    documents = ClaimDocumentSerializer(many=True, read_only=True)
    status_history = ClaimStatusHistorySerializer(many=True, read_only=True)
    is_pending = serializers.BooleanField(read_only=True)
    is_approved = serializers.BooleanField(read_only=True)
    is_settled = serializers.BooleanField(read_only=True)

    class Meta:
        model = Claim
        fields = [
            'id', 'claim_number', 'policy', 'policy_number',
            'policy_type', 'company_name', 'user', 'user_name',
            'user_email', 'type', 'description', 'incident_date',
            'incident_location', 'amount_claimed', 'amount_approved',
            'status', 'assessor', 'assessor_name', 'assessor_notes',
            'rejection_reason', 'filed_date', 'assigned_at',
            'assessment_date', 'settlement_date', 'updated_at',
            'documents', 'status_history', 'is_pending',
            'is_approved', 'is_settled'
        ]
        read_only_fields = [
            'id', 'claim_number', 'user', 'filed_date',
            'assigned_at', 'assessment_date', 'settlement_date',
            'updated_at'
        ]


class ClaimCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating claims"""

    class Meta:
        model = Claim
        fields = [
            'policy', 'type', 'description', 'incident_date',
            'incident_location', 'amount_claimed'
        ]

    def validate_policy(self, value):
        """Validate that policy belongs to user and is active"""
        user = self.context['request'].user

        if value.user != user:
            raise serializers.ValidationError('You can only file claims for your own policies')

        if value.status != 'active':
            raise serializers.ValidationError('Policy must be active to file a claim')

        return value

    def validate_incident_date(self, value):
        """Validate incident date is within policy period"""
        from django.utils import timezone

        if value > timezone.now().date():
            raise serializers.ValidationError('Incident date cannot be in the future')

        return value

    def create(self, validated_data):
        """Create claim with auto-generated claim number"""
        import random
        import string
        from django.utils import timezone

        # Generate unique claim number
        year = timezone.now().year
        random_digits = ''.join(random.choices(string.digits, k=6))
        claim_number = f"CLM-{year}-{random_digits}"

        while Claim.objects.filter(claim_number=claim_number).exists():
            random_digits = ''.join(random.choices(string.digits, k=6))
            claim_number = f"CLM-{year}-{random_digits}"

        validated_data['claim_number'] = claim_number
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'submitted'

        claim = super().create(validated_data)

        # Create initial status history
        ClaimStatusHistory.objects.create(
            claim=claim,
            to_status='submitted',
            notes='Claim submitted by customer',
            changed_by=claim.user
        )

        return claim


class ClaimUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating claim status (admin only)"""

    class Meta:
        model = Claim
        fields = [
            'status', 'amount_approved', 'assessor_notes',
            'rejection_reason', 'assessor'
        ]

    def update(self, instance, validated_data):
        """Update claim and create status history"""
        old_status = instance.status
        new_status = validated_data.get('status', old_status)

        # Update claim
        claim = super().update(instance, validated_data)

        # Create status history if status changed
        if old_status != new_status:
            from django.utils import timezone

            ClaimStatusHistory.objects.create(
                claim=claim,
                from_status=old_status,
                to_status=new_status,
                notes=validated_data.get('assessor_notes', ''),
                changed_by=self.context['request'].user
            )

            # Update timestamps based on status
            if new_status == 'under_review' and not claim.assigned_at:
                claim.assigned_at = timezone.now()
            elif new_status == 'assessment_complete' and not claim.assessment_date:
                claim.assessment_date = timezone.now()
            elif new_status == 'settled' and not claim.settlement_date:
                claim.settlement_date = timezone.now()

            claim.save()

        return claim


class ClaimDocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading claim documents"""

    class Meta:
        model = ClaimDocument
        fields = [
            'document_type', 'title', 'file_url',
            'file_size', 'mime_type'
        ]

    def create(self, validated_data):
        """Create document with claim and uploader"""
        validated_data['claim'] = self.context['claim']
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)
