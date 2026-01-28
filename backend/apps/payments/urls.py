"""
Payment URL Configuration
Routes for payment processing, verification, and management
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'payments'

router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'schedules', views.PaymentScheduleViewSet, basename='schedule')
router.register(r'refunds', views.RefundViewSet, basename='refund')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),

    # Payment Initiation
    path('initiate/', views.initiate_payment, name='initiate'),

    # M-Pesa endpoints
    path('mpesa/initiate/', views.mpesa_initiate, name='mpesa-initiate'),
    path('mpesa/callback/', views.mpesa_callback, name='mpesa-callback'),
    path('mpesa/status/<uuid:transaction_id>/', views.mpesa_status, name='mpesa-status'),

    # Paystack endpoints
    path('paystack/initialize/', views.paystack_initialize, name='paystack-initialize'),
    path('paystack/verify/<str:reference>/', views.paystack_verify, name='paystack-verify'),
    path('paystack/webhook/', views.paystack_webhook, name='paystack-webhook'),
]
