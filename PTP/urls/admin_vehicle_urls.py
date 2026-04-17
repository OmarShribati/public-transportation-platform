from django.urls import path

from PTP.views import (
    AdminVehicleDetailView,
    AdminVehicleRouteAssignmentView,
    AdminVehicleTrackingView,
    AdminVehiclesView,
)


urlpatterns = [
    path('vehicles', AdminVehiclesView.as_view(), name='admin-vehicles'),
    path('vehicles/<int:vehicle_id>', AdminVehicleDetailView.as_view(), name='admin-vehicle-detail'),
    path('vehicles/<int:vehicle_id>/tracking', AdminVehicleTrackingView.as_view(), name='admin-vehicle-tracking'),
    path('vehicles/<int:vehicle_id>/route', AdminVehicleRouteAssignmentView.as_view(), name='admin-vehicle-route-assignment'),
]
