from django.urls import path

from PTP.views import (
    PassengerComplaintsView,
    PassengerFavoriteTripDetailView,
    PassengerFavoriteTripsView,
    PassengerRouteDetailView,
    PassengerRouteTrackingView,
    PassengerTripSearchView,
    PassengerTripTrackingView,
)


urlpatterns = [
    path('complaints', PassengerComplaintsView.as_view(), name='passenger-complaints'),
    path('trips/search', PassengerTripSearchView.as_view(), name='passenger-trip-search'),
    path('trips/<int:trip_id>/tracking', PassengerTripTrackingView.as_view(), name='passenger-trip-tracking'),
    path('trips/favorites', PassengerFavoriteTripsView.as_view(), name='passenger-favorite-trips'),
    path('trips/favorites/<int:route_id>', PassengerFavoriteTripDetailView.as_view(), name='passenger-favorite-trip-detail'),
    path('routes/<int:route_id>', PassengerRouteDetailView.as_view(), name='passenger-route-detail'),
    path('routes/<int:route_id>/tracking', PassengerRouteTrackingView.as_view(), name='passenger-route-tracking'),
]
