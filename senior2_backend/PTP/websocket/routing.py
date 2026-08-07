from django.urls import path

from PTP.websocket.notification_consumer import NotificationConsumer
from PTP.websocket.tracking_consumers import (
    TripTrackingConsumer,
    VehicleTrackingConsumer,
)

websocket_urlpatterns = [
    # Existing tracking WebSockets — unchanged
    path(
        'ws/admin/vehicles/<int:vehicle_id>/tracking/',
        VehicleTrackingConsumer.as_asgi(),
    ),
    path(
        'ws/passenger/trips/<int:trip_id>/tracking/',
        TripTrackingConsumer.as_asgi(),
    ),

    # New — unified notification WebSocket for passengers + drivers
    path(
        'ws/notifications/',
        NotificationConsumer.as_asgi(),
    ),
]