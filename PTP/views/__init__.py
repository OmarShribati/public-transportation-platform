from .admin_views import (
    AdminAccountStatusView,
    AdminAccountUpdateView,
    AdminAccountsView,
    AdminComplaintsView,
    AdminDriverRequestsView,
    AdminDriverApprovalView,
)
from .admin_route_views import AdminRouteDetailView, AdminRoutesView, AdminVehicleRouteAssignmentView
from .admin_stop_views import AdminStopDetailView, AdminStopsView
from .admin_vehicle_views import AdminVehicleDetailView, AdminVehicleTrackingView, AdminVehiclesView
from .auth_views import LoginView, RegistrationView
from .driver_views import DriverDeactivateRequestView, DriverProfileView
from .driver_tracking_views import (
    DriverLocationUpdateView,
    DriverTripStartView,
    DriverTripStatusView,
    DriverTripStopView,
    DriverVehicleStatusView,
)
from .logout_views import LogoutView
from .passenger_views import (
    PassengerComplaintsView,
    PassengerDeactivateView,
    PassengerFavoriteTripDetailView,
    PassengerFavoriteTripsView,
    PassengerProfileView,
)
from .passenger_trip_views import (
    PassengerRouteDetailView,
    PassengerRouteTrackingView,
    PassengerTripSearchView,
    PassengerTripTrackingView,
)

__all__ = [
    'AdminAccountStatusView',
    'AdminAccountUpdateView',
    'AdminAccountsView',
    'AdminComplaintsView',
    'AdminDriverRequestsView',
    'AdminDriverApprovalView',
    'AdminRouteDetailView',
    'AdminRoutesView',
    'AdminStopDetailView',
    'AdminStopsView',
    'AdminVehicleDetailView',
    'AdminVehicleRouteAssignmentView',
    'AdminVehicleTrackingView',
    'AdminVehiclesView',
    'DriverProfileView',
    'DriverDeactivateRequestView',
    'DriverLocationUpdateView',
    'DriverTripStartView',
    'DriverTripStatusView',
    'DriverTripStopView',
    'DriverVehicleStatusView',
    'LoginView',
    'LogoutView',
    'PassengerComplaintsView',
    'PassengerDeactivateView',
    'PassengerFavoriteTripDetailView',
    'PassengerFavoriteTripsView',
    'PassengerProfileView',
    'PassengerRouteDetailView',
    'PassengerRouteTrackingView',
    'PassengerTripSearchView',
    'PassengerTripTrackingView',
    'RegistrationView',
]
