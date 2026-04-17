from django.urls import path

from PTP.views import (
    AdminAccountStatusView,
    AdminAccountUpdateView,
    AdminAccountsView,
    AdminDriverApprovalView,
    AdminDriverRequestsView,
    DriverDeactivateRequestView,
    DriverProfileView,
    LoginView,
    LogoutView,
    PassengerDeactivateView,
    PassengerProfileView,
    RegistrationView,
)

urlpatterns = [
    path('register', RegistrationView.as_view(), name='account-register'),
    path('login', LoginView.as_view(), name='account-login'),
    path('logout', LogoutView.as_view(), name='account-logout'),
    path('passenger/profile', PassengerProfileView.as_view(), name='passenger-profile'),
    path('passenger/deactivate', PassengerDeactivateView.as_view(), name='passenger-deactivate'),
    path('driver/profile', DriverProfileView.as_view(), name='driver-profile'),
    path('driver/deactivation-request', DriverDeactivateRequestView.as_view(), name='driver-deactivation-request'),
    path('admin/accounts', AdminAccountsView.as_view(), name='admin-accounts'),
    path('admin/accounts/<str:account_type>/<int:account_id>', AdminAccountUpdateView.as_view(), name='admin-account-update'),
    path('admin/accounts/<str:account_type>/<int:account_id>/<str:action>', AdminAccountStatusView.as_view(), name='admin-account-status'),
    path('admin/drivers/<int:driver_id>/<str:action>', AdminDriverApprovalView.as_view(), name='admin-driver-approval'),
    path('admin/driver-requests', AdminDriverRequestsView.as_view(), name='admin-driver-requests'),
    path('users', AdminAccountsView.as_view(), name='admin-users'),
]
