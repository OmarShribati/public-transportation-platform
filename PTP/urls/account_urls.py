from django.urls import path

from PTP.views import (
    DriverDeactivateRequestView,
    DriverProfileView,
    PassengerDeactivateView,
    PassengerProfileView,
)


urlpatterns = [
    path('passenger/profile', PassengerProfileView.as_view(), name='passenger-profile'),
    path('passenger/deactivate', PassengerDeactivateView.as_view(), name='passenger-deactivate'),
    path('driver/profile', DriverProfileView.as_view(), name='driver-profile'),
    path('driver/deactivation-request', DriverDeactivateRequestView.as_view(), name='driver-deactivation-request'),
]
