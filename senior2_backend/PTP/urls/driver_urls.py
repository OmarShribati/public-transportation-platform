from django.urls import path

from PTP.views import (
    DriverLocationUpdateView,
    DriverTripStartView,
    DriverTripStatusView,
    DriverTripStopView,
)
from PTP.views.passenger_count_views import (
    PassengerCountUpdateView,
    VehiclePassengerCountView,
)

urlpatterns = [
    path('trip/status', DriverTripStatusView.as_view(), name='driver-trip-status'),
    path('trip/start', DriverTripStartView.as_view(), name='driver-trip-start'),
    path('trip/stop', DriverTripStopView.as_view(), name='driver-trip-stop'),
    path('location', DriverLocationUpdateView.as_view(), name='driver-location-update'),

    # AI camera service endpoints
    # POST — AI sends updated absolute passenger count
    path('passenger-count/update', PassengerCountUpdateView.as_view(), name='passenger-count-update'),
    # GET  — AI syncs current count on startup
    path('passenger-count', VehiclePassengerCountView.as_view(), name='passenger-count-get'),

    # NOTE: vehicle/status (manual is_full) has been removed.
    # is_full is now derived automatically from passenger_count vs capacity.
]