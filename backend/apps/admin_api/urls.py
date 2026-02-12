"""Admin API URL Configuration"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'admin_api'

router = DefaultRouter()
router.register(r'users', views.UserManagementViewSet, basename='user')
router.register(r'policy-types', views.PolicyTypeManagementViewSet, basename='policy-type')
router.register(r'insurance-companies', views.InsuranceCompanyManagementViewSet, basename='insurance-company')

urlpatterns = [
    # Dashboard
    path('dashboard/', views.get_admin_dashboard, name='dashboard'),

    # Reports
    path('reports/sales/', views.get_sales_report, name='sales-report'),
    path('reports/revenue/', views.get_revenue_report, name='revenue-report'),
    path('reports/claims/', views.get_claims_report, name='claims-report'),

    # Router URLs
    path('', include(router.urls)),
]
