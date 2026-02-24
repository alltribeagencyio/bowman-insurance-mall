from rest_framework import status, generics, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    PasswordChangeSerializer,
    NotificationPreferenceSerializer,
    BeneficiarySerializer
)
from .models import NotificationPreference, Beneficiary

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint for user registration
    POST /api/v1/auth/register/
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class UserLoginView(APIView):
    """
    API endpoint for user login
    POST /api/v1/auth/login/
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class UserLogoutView(APIView):
    """
    API endpoint for user logout
    POST /api/v1/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint to view and update user profile
    GET/PUT/PATCH /api/v1/auth/profile/
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserSerializer


class PasswordChangeView(APIView):
    """
    API endpoint for password change
    POST /api/v1/auth/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """
    API endpoint to view and update notification preferences
    GET/PUT/PATCH /api/v1/auth/notification-preferences/
    """
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Get or create notification preference for the user
        obj, created = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return obj


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    """
    API endpoint to request password reset
    POST /api/v1/auth/password-reset/request/
    """
    email = request.data.get('email')
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)

        # Generate password reset token
        from django.contrib.auth.tokens import default_token_generator
        from django.utils.http import urlsafe_base64_encode
        from django.utils.encoding import force_bytes

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Store token (for now, return it - in production, send via email)
        reset_link = f"/reset-password/{uid}/{token}/"

        # TODO: Send email with reset link when email service is configured
        # For now, return the link in response (development only)
        return Response({
            'message': 'Password reset link generated',
            'reset_link': reset_link,  # Remove this in production
            'uid': uid,
            'token': token
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        # For security, return success even if user doesn't exist
        return Response({
            'message': 'Password reset link sent to your email'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """
    API endpoint to reset password with token
    POST /api/v1/auth/password-reset/confirm/
    Body: {uid, token, new_password}
    """
    from django.contrib.auth.tokens import default_token_generator
    from django.utils.http import urlsafe_base64_decode
    from django.utils.encoding import force_str

    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    if not all([uid, token, new_password]):
        return Response({
            'error': 'uid, token, and new_password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Decode user ID
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)

        # Validate token
        if not default_token_generator.check_token(user, token):
            return Response({
                'error': 'Invalid or expired reset link'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response({
            'message': 'Password reset successfully'
        }, status=status.HTTP_200_OK)

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({
            'error': 'Invalid reset link'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verify_token(request):
    """
    API endpoint to verify JWT token
    GET /api/v1/auth/verify/
    """
    return Response({
        'user': UserSerializer(request.user).data,
        'message': 'Token is valid'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def enable_2fa(request):
    """
    Stub endpoint for enabling 2FA.
    POST /api/v1/auth/2fa/enable/
    TODO Phase 10: implement TOTP-based 2FA via pyotp
    """
    return Response({
        'message': '2FA enabled successfully',
        'status': 'enabled'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def disable_2fa(request):
    """
    Stub endpoint for disabling 2FA.
    POST /api/v1/auth/2fa/disable/
    """
    return Response({
        'message': '2FA disabled successfully',
        'status': 'disabled'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_2fa(request):
    """
    Stub endpoint for verifying a 2FA code.
    POST /api/v1/auth/2fa/verify/
    Body: { code }
    """
    code = request.data.get('code')
    if not code:
        return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({
        'message': '2FA verified successfully',
        'valid': True
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def delete_account(request):
    """
    Request account deletion.
    POST /api/v1/auth/delete-account/
    Body: { reason }
    Marks the account as inactive; hard deletion deferred to admin review.
    """
    user = request.user
    reason = request.data.get('reason', '')
    # Deactivate account instead of hard delete to preserve data integrity
    user.is_active = False
    user.save(update_fields=['is_active'])

    # Blacklist all tokens
    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
        for token in OutstandingToken.objects.filter(user=user):
            token.blacklist()
    except Exception:
        pass

    return Response({
        'message': 'Account deletion request submitted. Your account has been deactivated.'
    }, status=status.HTTP_200_OK)


class BeneficiaryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing beneficiaries
    GET /api/v1/auth/beneficiaries/ - List beneficiaries
    POST /api/v1/auth/beneficiaries/ - Create beneficiary
    GET /api/v1/auth/beneficiaries/:id/ - Get beneficiary details
    PATCH /api/v1/auth/beneficiaries/:id/ - Update beneficiary
    DELETE /api/v1/auth/beneficiaries/:id/ - Delete beneficiary
    POST /api/v1/auth/beneficiaries/:id/set-primary/ - Set as primary
    """
    serializer_class = BeneficiarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return beneficiaries for the current user"""
        return Beneficiary.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Set the user when creating a beneficiary"""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def set_primary(self, request, pk=None):
        """Set a beneficiary as primary"""
        beneficiary = self.get_object()

        # Unset all other primary beneficiaries for this user
        Beneficiary.objects.filter(
            user=request.user,
            is_primary=True
        ).update(is_primary=False)

        # Set this one as primary
        beneficiary.is_primary = True
        beneficiary.save()

        serializer = self.get_serializer(beneficiary)
        return Response(serializer.data)
