from django.urls import path

from PTP.views import AdminStopDetailView, AdminStopsView


urlpatterns = [
    path('stops', AdminStopsView.as_view(), name='admin-stops'),
    path('stops/<int:stop_id>', AdminStopDetailView.as_view(), name='admin-stop-detail'),
]
