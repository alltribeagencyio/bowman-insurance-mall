"""Dashboard URL Configuration"""
from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.get_dashboard_data, name='dashboard'),
    path('stats/', views.get_dashboard_stats, name='stats'),
    path('activity/', views.get_recent_activity, name='activity'),
    path('recommendations/', views.get_recommendations, name='recommendations'),
    path('upcoming-payments/', views.get_upcoming_payments, name='upcoming-payments'),
    path('expiring-policies/', views.get_expiring_policies, name='expiring-policies'),
]
