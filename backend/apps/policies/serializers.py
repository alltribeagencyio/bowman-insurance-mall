"""
Serializers for Policies App
"""
from rest_framework import serializers
from .models import InsuranceCompany, PolicyCategory, PolicyType, Policy, PolicyReview
from apps.users.serializers import UserSerializer


class InsuranceCompanySerializer(serializers.ModelSerializer):
    """Serializer for insurance companies"""

    class Meta:
        model = InsuranceCompany
        fields = [
            'id', 'name', 'logo', 'rating', 'description',
            'contact_email', 'contact_phone', 'website',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PolicyCategorySerializer(serializers.ModelSerializer):
    """Serializer for policy categories"""
    policy_count = serializers.SerializerMethodField()

    class Meta:
        model = PolicyCategory
        fields = [
            'id', 'name', 'slug', 'description', 'icon',
            'display_order', 'is_active', 'policy_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_policy_count(self, obj):
        """Get count of active policy types in this category"""
        return obj.policy_types.filter(is_active=True).count()


class PolicyTypeSerializer(serializers.ModelSerializer):
    """Serializer for policy types (admin API — includes all editable fields)"""
    category = serializers.SlugRelatedField(
        slug_field='name',
        queryset=PolicyCategory.objects.all()
    )
    insurance_company_name = serializers.CharField(
        source='insurance_company.name',
        read_only=True
    )

    class Meta:
        model = PolicyType
        fields = [
            'id', 'name', 'category',
            'insurance_company', 'insurance_company_name',
            'description', 'base_premium',
            'min_coverage_amount', 'max_coverage_amount',
            'features', 'exclusions',
            'status', 'is_active', 'is_featured',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class PolicyTypeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for policy type listings"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    company_name = serializers.CharField(source='insurance_company.name', read_only=True)
    company_logo = serializers.URLField(source='insurance_company.logo', read_only=True)
    company_rating = serializers.DecimalField(
        source='insurance_company.rating',
        max_digits=3,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = PolicyType
        fields = [
            'id', 'name', 'slug', 'description', 'category_name', 'company_name',
            'company_logo', 'company_rating', 'base_premium',
            'min_coverage_amount', 'max_coverage_amount',
            'is_featured', 'features', 'status'
        ]


class PolicyTypeDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single policy type"""
    category = PolicyCategorySerializer(read_only=True)
    insurance_company = InsuranceCompanySerializer(read_only=True)

    class Meta:
        model = PolicyType
        fields = [
            'id', 'category', 'insurance_company', 'name', 'slug',
            'description', 'base_premium', 'coverage_details',
            'features', 'exclusions', 'requirements', 'terms_and_conditions',
            'min_coverage_amount', 'max_coverage_amount',
            'min_age', 'max_age', 'status', 'is_active', 'is_featured',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class PolicySerializer(serializers.ModelSerializer):
    """Serializer for customer policies"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    policy_type_name = serializers.CharField(source='policy_type.name', read_only=True)
    company_name = serializers.CharField(source='insurance_company.name', read_only=True)
    company_logo = serializers.URLField(source='insurance_company.logo', read_only=True)
    category_name = serializers.CharField(source='policy_type.category.name', read_only=True)
    days_to_expiry = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Policy
        fields = [
            'id', 'policy_number', 'user', 'user_name', 'user_email',
            'policy_type', 'policy_type_name', 'insurance_company',
            'company_name', 'company_logo', 'category_name',
            'status', 'start_date', 'end_date', 'premium_amount',
            'coverage_amount', 'payment_frequency', 'policy_data',
            'certificate_url', 'policy_document_url', 'beneficiaries',
            'days_to_expiry', 'is_active', 'created_at', 'updated_at',
            'activated_at', 'cancelled_at'
        ]
        read_only_fields = [
            'id', 'policy_number', 'user', 'created_at',
            'updated_at', 'activated_at', 'cancelled_at'
        ]


class PolicyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new policies"""

    class Meta:
        model = Policy
        fields = [
            'policy_type', 'insurance_company', 'start_date',
            'end_date', 'premium_amount', 'coverage_amount',
            'payment_frequency', 'policy_data', 'beneficiaries'
        ]

    def validate(self, data):
        """Validate policy creation data"""
        # Ensure end_date is after start_date
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date'
            })

        # Validate coverage amount against policy type limits
        policy_type = data['policy_type']
        coverage = data['coverage_amount']

        if policy_type.min_coverage_amount and coverage < policy_type.min_coverage_amount:
            raise serializers.ValidationError({
                'coverage_amount': f'Minimum coverage is {policy_type.min_coverage_amount}'
            })

        if policy_type.max_coverage_amount and coverage > policy_type.max_coverage_amount:
            raise serializers.ValidationError({
                'coverage_amount': f'Maximum coverage is {policy_type.max_coverage_amount}'
            })

        return data

    def create(self, validated_data):
        """Create policy with auto-generated policy number"""
        import random
        import string
        from django.utils import timezone

        # Generate unique policy number
        year = timezone.now().year
        random_digits = ''.join(random.choices(string.digits, k=6))
        policy_number = f"POL-{year}-{random_digits}"

        # Ensure uniqueness
        while Policy.objects.filter(policy_number=policy_number).exists():
            random_digits = ''.join(random.choices(string.digits, k=6))
            policy_number = f"POL-{year}-{random_digits}"

        validated_data['policy_number'] = policy_number
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'pending'  # Will be activated after payment

        return super().create(validated_data)


class PolicyReviewSerializer(serializers.ModelSerializer):
    """Serializer for policy reviews"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = PolicyReview
        fields = [
            'id', 'policy', 'user', 'user_name', 'rating',
            'title', 'comment', 'is_verified_purchase',
            'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'is_verified_purchase',
            'is_published', 'created_at', 'updated_at'
        ]

    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value


class PolicyRenewalSerializer(serializers.Serializer):
    """Serializer for policy renewal"""
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    premium_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate(self, data):
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date'
            })
        return data
