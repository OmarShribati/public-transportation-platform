from .admin_views import (
    AdminAccountStatusView,
    AdminAccountUpdateView,
    AdminAccountsView,
    AdminDriverRequestsView,
    AdminDriverApprovalView,
)
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
    'DriverProfileView',
    'DriverDeactivateRequestView',
    'LoginView',
    'LogoutView',
    'PassengerDeactivateView',
    'PassengerProfileView',
    'RegistrationView',
]
