from django.urls import path

from PTP.websocket.tracking_consumers import TripTrackingConsumer, VehicleTrackingConsumer


websocket_urlpatterns = [
    path('ws/admin/vehicles/<int:vehicle_id>/tracking/', VehicleTrackingConsumer.as_asgi()),
    path('ws/passenger/trips/<int:trip_id>/tracking/', TripTrackingConsumer.as_asgi()),
]
