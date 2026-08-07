from django.urls import path

from PTP.views import AdminRouteDetailView, AdminRoutesView


urlpatterns = [
    path('routes', AdminRoutesView.as_view(), name='admin-routes'),
    path('routes/<int:route_id>', AdminRouteDetailView.as_view(), name='admin-route-detail'),
]
