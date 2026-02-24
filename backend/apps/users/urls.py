from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserLogoutView,
    UserProfileView,
    PasswordChangeView,
    NotificationPreferenceView,
    BeneficiaryViewSet,
    request_password_reset,
    reset_password,
    verify_token,
    enable_2fa,
    disable_2fa,
    verify_2fa,
    delete_account,
)

app_name = 'users'

router = DefaultRouter()
router.register(r'beneficiaries', BeneficiaryViewSet, basename='beneficiary')

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', verify_token, name='verify_token'),

    # Password Management
    path('change-password/', PasswordChangeView.as_view(), name='change_password'),
    path('password-reset/request/', request_password_reset, name='request_password_reset'),
    path('password-reset/confirm/', reset_password, name='reset_password'),

    # User Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('notification-preferences/', NotificationPreferenceView.as_view(), name='notification_preferences'),

    # Two-Factor Authentication (stubs — full TOTP implementation in Phase 10)
    path('2fa/enable/', enable_2fa, name='enable_2fa'),
    path('2fa/disable/', disable_2fa, name='disable_2fa'),
    path('2fa/verify/', verify_2fa, name='verify_2fa'),

    # Account Management
    path('delete-account/', delete_account, name='delete_account'),

    # Beneficiaries (router URLs)
    path('', include(router.urls)),
]
