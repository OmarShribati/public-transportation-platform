from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


class TrackingBroadcastService:
    def broadcast_location(self, location, alert=None):
        payload = {
            'type': 'vehicle_location_update',
            'trip_id': location.trip_id,
            'driver_id': location.driver_id,
            'vehicle_id': location.vehicle_id,
            'location': {
                'location_id': location.location_id,
                'latitude': str(location.latitude),
                'longitude': str(location.longitude),
                'speed_kmh': str(location.speed_kmh) if location.speed_kmh is not None else None,
                'heading': str(location.heading) if location.heading is not None else None,
                'distance_to_route_meters': (
                    str(location.distance_to_route_meters)
                    if location.distance_to_route_meters is not None
                    else None
                ),
                'is_off_route': location.is_off_route,
                'recorded_at': location.recorded_at.isoformat(),
            },
            'alert': alert,
        }
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return

        for group_name in [
            f'vehicle_tracking_{location.vehicle_id}',
            f'trip_tracking_{location.trip_id}',
        ]:
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'tracking.update',
                    'payload': payload,
                },
            )
