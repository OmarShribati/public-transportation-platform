from django.urls import path
from apps.account_management.views.registration_view import (
    AdminAccountStatusView,
    AdminAccountUpdateView,
    AdminAccountsView,
    AdminDriverApprovalView,
    DriverProfileView,
    LoginView,
    PassengerDeactivateView,
    PassengerProfileView,
    RegistrationView,
)

urlpatterns = [
    path('register/', RegistrationView.as_view(), name='account-register'),
    path('login/', LoginView.as_view(), name='account-login'),
    path('passenger/profile/', PassengerProfileView.as_view(), name='passenger-profile'),
    path('passenger/deactivate/', PassengerDeactivateView.as_view(), name='passenger-deactivate'),
    path('driver/profile/', DriverProfileView.as_view(), name='driver-profile'),
    path('admin/accounts/', AdminAccountsView.as_view(), name='admin-accounts'),
    path('admin/accounts/<str:account_type>/<int:account_id>/', AdminAccountUpdateView.as_view(), name='admin-account-update'),
    path('admin/accounts/<str:account_type>/<int:account_id>/<str:action>/', AdminAccountStatusView.as_view(), name='admin-account-status'),
    path('admin/drivers/<int:driver_id>/<str:action>/', AdminDriverApprovalView.as_view(), name='admin-driver-approval'),
    path('users/', AdminAccountsView.as_view(), name='admin-users'),
]
