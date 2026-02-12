from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User, NotificationPreference, Beneficiary


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password')

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name', 'phone')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)

        # Create notification preferences
        NotificationPreference.objects.create(user=user)

        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(email=email, password=password)

            if not user:
                raise serializers.ValidationError('Invalid email or password.')

            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include "email" and "password".')


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'id_number', 'kra_pin', 'role', 'is_verified',
            'email_verified_at', 'phone_verified_at', 'created_at'
        )
        read_only_fields = ('id', 'role', 'is_verified', 'email_verified_at', 'phone_verified_at', 'created_at')


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'phone', 'id_number', 'kra_pin')


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences"""

    class Meta:
        model = NotificationPreference
        exclude = ('id', 'user', 'created_at', 'updated_at')


class BeneficiarySerializer(serializers.ModelSerializer):
    """Serializer for beneficiaries"""

    class Meta:
        model = Beneficiary
        fields = (
            'id', 'name', 'relationship', 'percentage', 'phone', 'email',
            'date_of_birth', 'national_id', 'is_primary', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_percentage(self, value):
        """Validate percentage is between 0 and 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Percentage must be between 0 and 100")
        return value

    def validate(self, attrs):
        """Validate total percentage doesn't exceed 100"""
        user = self.context['request'].user
        percentage = attrs.get('percentage', 0)

        # Get existing beneficiaries (excluding current one if updating)
        existing = Beneficiary.objects.filter(user=user)
        if self.instance:
            existing = existing.exclude(id=self.instance.id)

        total_existing = sum(b.percentage for b in existing)

        if total_existing + percentage > 100:
            raise serializers.ValidationError({
                'percentage': f'Total percentage cannot exceed 100%. Current total: {total_existing}%'
            })

        return attrs
