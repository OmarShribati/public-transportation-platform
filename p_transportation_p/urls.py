from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('PTP.urls.auth_urls')),
    path('api/accounts/', include('PTP.urls.account_urls')),
    path('api/passenger/', include('PTP.urls.passenger_urls')),
    path('api/driver/', include('PTP.urls.driver_urls')),
    path('api/admin/', include('PTP.urls.admin_account_urls')),
    path('api/admin/', include('PTP.urls.admin_route_urls')),
    path('api/admin/', include('PTP.urls.admin_stop_urls')),
    path('api/admin/', include('PTP.urls.admin_vehicle_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
