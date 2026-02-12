"""Serializers for Documents App"""
from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer for documents"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    policy_number = serializers.CharField(source='policy.policy_number', read_only=True, allow_null=True)
    verified_by_name = serializers.CharField(source='verified_by.full_name', read_only=True, allow_null=True)
    file_url = serializers.CharField(read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'user', 'user_name', 'policy', 'policy_number',
            'type', 'title', 'filename', 's3_key', 'file_size',
            'mime_type', 'is_verified', 'verified_by', 'verified_by_name',
            'verified_at', 'uploaded_at', 'updated_at', 'file_url'
        ]
        read_only_fields = [
            'id', 'user', 's3_key', 'verified_by', 'verified_at',
            'uploaded_at', 'updated_at'
        ]


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading documents"""

    class Meta:
        model = Document
        fields = ['policy', 'type', 'title', 'filename', 's3_key', 'file_size', 'mime_type']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
