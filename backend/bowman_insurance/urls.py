"""
URL configuration for Bowman Insurance project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # API v1
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/policies/', include('apps.policies.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/claims/', include('apps.claims.urls')),
    path('api/v1/documents/', include('apps.documents.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/workflows/', include('apps.workflows.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),
    path('api/v1/admin/', include('apps.admin_api.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns

# Customize admin site
admin.site.site_header = "Bowman Insurance Admin"
admin.site.site_title = "Bowman Insurance Portal"
admin.site.index_title = "Welcome to Bowman Insurance Management Portal"
