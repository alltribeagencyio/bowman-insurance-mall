"""
URL configuration for Policies app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'companies', views.InsuranceCompanyViewSet, basename='company')
router.register(r'categories', views.PolicyCategoryViewSet, basename='category')
router.register(r'types', views.PolicyTypeViewSet, basename='policy-type')
router.register(r'reviews', views.PolicyReviewViewSet, basename='review')
router.register(r'my-policies', views.PolicyViewSet, basename='policy')

urlpatterns = [
    path('', include(router.urls)),
]
