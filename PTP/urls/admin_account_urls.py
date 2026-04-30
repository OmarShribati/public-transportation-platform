from django.urls import path

from PTP.views import (
    AdminAccountStatusView,
    AdminAccountUpdateView,
    AdminAccountsView,
    AdminComplaintsView,
    AdminDriverApprovalView,
    AdminDriverRequestsView,
)


urlpatterns = [
    path('accounts', AdminAccountsView.as_view(), name='admin-accounts'),
    path('accounts/<str:account_type>/<int:account_id>', AdminAccountUpdateView.as_view(), name='admin-account-update'),
    path('accounts/<str:account_type>/<int:account_id>/<str:action>', AdminAccountStatusView.as_view(), name='admin-account-status'),
    path('drivers/<int:driver_id>/<str:action>', AdminDriverApprovalView.as_view(), name='admin-driver-approval'),
    path('driver-requests', AdminDriverRequestsView.as_view(), name='admin-driver-requests'),
    path('complaints', AdminComplaintsView.as_view(), name='admin-complaints'),
]
