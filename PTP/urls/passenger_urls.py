from django.urls import path

from PTP.views import (
    PassengerRouteDetailView,
    PassengerRouteTrackingView,
    PassengerTripSearchView,
    PassengerTripTrackingView,
)


urlpatterns = [
    path('trips/search', PassengerTripSearchView.as_view(), name='passenger-trip-search'),
    path('trips/<int:trip_id>/tracking', PassengerTripTrackingView.as_view(), name='passenger-trip-tracking'),
    path('routes/<int:route_id>', PassengerRouteDetailView.as_view(), name='passenger-route-detail'),
    path('routes/<int:route_id>/tracking', PassengerRouteTrackingView.as_view(), name='passenger-route-tracking'),
]
