from django.urls import path

from PTP.views import (
    DriverLocationUpdateView,
    DriverTripStartView,
    DriverTripStatusView,
    DriverTripStopView,
    DriverVehicleStatusView,
)


urlpatterns = [
    path('trip/status', DriverTripStatusView.as_view(), name='driver-trip-status'),
    path('trip/start', DriverTripStartView.as_view(), name='driver-trip-start'),
    path('trip/stop', DriverTripStopView.as_view(), name='driver-trip-stop'),
    path('location', DriverLocationUpdateView.as_view(), name='driver-location-update'),
    path('vehicle/status', DriverVehicleStatusView.as_view(), name='driver-vehicle-status'),
]
