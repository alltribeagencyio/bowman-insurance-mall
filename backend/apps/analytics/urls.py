"""URL configuration for Analytics app"""
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
    path('revenue/', views.revenue_analytics, name='revenue-analytics'),
    path('claims/', views.claims_analytics, name='claims-analytics'),
    path('users/', views.user_analytics, name='user-analytics'),
    path('policies/', views.policy_analytics, name='policy-analytics'),
]
