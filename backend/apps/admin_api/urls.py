"""Admin API URL Configuration"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'admin_api'

router = DefaultRouter()
router.register(r'users', views.UserManagementViewSet, basename='user')
router.register(r'claims', views.ClaimsManagementViewSet, basename='claim')
router.register(r'transactions', views.TransactionManagementViewSet, basename='transaction')
router.register(r'policy-types', views.PolicyTypeManagementViewSet, basename='policy-type')
router.register(r'insurance-companies', views.InsuranceCompanyManagementViewSet, basename='insurance-company')

urlpatterns = [
    # Dashboard
    path('dashboard/', views.get_admin_dashboard, name='dashboard'),

    # Policies (user policies admin view)
    path('policies/', views.get_admin_policies, name='admin-policies'),
    path('policies/<uuid:policy_id>/approve/', views.approve_policy, name='approve-policy'),
    path('policies/<uuid:policy_id>/cancel/', views.cancel_policy, name='cancel-policy'),

    # Reports
    path('reports/sales/', views.get_sales_report, name='sales-report'),
    path('reports/revenue/', views.get_revenue_report, name='revenue-report'),
    path('reports/claims/', views.get_claims_report, name='claims-report'),
    path('reports/user-growth/', views.get_user_growth_report, name='user-growth-report'),
    path('reports/export/<str:report_id>/', views.export_report, name='export-report'),

    # Settings & Roles
    path('settings/', views.admin_settings, name='settings'),
    path('roles/', views.get_roles, name='roles'),

    # Router URLs (users, claims, transactions, policy-types, insurance-companies)
    path('', include(router.urls)),
]
