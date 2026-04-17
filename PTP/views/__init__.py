from .admin_views import (
    AdminAccountStatusView,
    AdminAccountUpdateView,
    AdminAccountsView,
    AdminDriverRequestsView,
    AdminDriverApprovalView,
)
from .admin_stop_views import AdminStopDetailView, AdminStopsView
from .auth_views import LoginView, RegistrationView
from .driver_views import DriverDeactivateRequestView, DriverProfileView
from .logout_views import LogoutView
from .passenger_views import PassengerDeactivateView, PassengerProfileView

__all__ = [
    'AdminAccountStatusView',
    'AdminAccountUpdateView',
    'AdminAccountsView',
    'AdminDriverRequestsView',
    'AdminDriverApprovalView',
    'AdminStopDetailView',
    'AdminStopsView',
    'DriverProfileView',
    'DriverDeactivateRequestView',
    'LoginView',
    'LogoutView',
    'PassengerDeactivateView',
    'PassengerProfileView',
    'RegistrationView',
]
