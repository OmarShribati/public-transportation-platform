"""
Passenger Count Service
=======================

Core business logic for AI-driven passenger counting.

Called by:
- PassengerCountUpdateView (HTTP POST from AI camera service)

Responsibilities:
1. Validate the incoming count against vehicle capacity
2. Update passenger_count + is_full on the Vehicle
3. Broadcast the update via WebSocket
"""

import logging

from django.db import transaction

from PTP.models import DriverTrip, Vehicle


logger = logging.getLogger(__name__)


class PassengerCountService:

    @classmethod
    @transaction.atomic
    def update_count(cls, *, vehicle_id: int, passenger_count: int) -> dict:
        """
        Update passenger count and broadcast update.
        """

        if passenger_count < 0:
            raise ValueError("passenger_count cannot be negative.")

        vehicle = Vehicle.objects.select_for_update().get(
            pk=vehicle_id
        )

        # Prevent exceeding capacity
        passenger_count = min(
            passenger_count,
            vehicle.capacity
        )

        vehicle.passenger_count = passenger_count

        vehicle.save(
            update_fields=[
                'passenger_count',
                'is_full'
            ]
        )

        payload = cls._build_payload(vehicle)

        cls._broadcast(
            vehicle_id=vehicle_id,
            payload=payload
        )

        logger.info(
            "Vehicle %s passenger count updated to %s/%s (%.1f%%)",
            vehicle_id,
            vehicle.passenger_count,
            vehicle.capacity,
            vehicle.occupancy_percentage,
        )

        return payload


    @staticmethod
    def _build_payload(vehicle):
        return {
            'type': 'passenger_count_update',
            'vehicle_id': vehicle.vehicle_id,
            'passenger_count': vehicle.passenger_count,
            'capacity': vehicle.capacity,
            'occupancy_percentage': vehicle.occupancy_percentage,
            'is_full': vehicle.is_full,
        }


    @staticmethod
    def _broadcast(*, vehicle_id, payload):

        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer


        channel_layer = get_channel_layer()

        if channel_layer is None:
            logger.warning(
                "No channel layer configured — WebSocket broadcast skipped."
            )
            return


        vehicle = Vehicle.objects.get(
            pk=vehicle_id
        )


        # Send to admin vehicle tracking socket
        admin_payload = {
            'type': 'vehicle_location_update',
            'trip_id': None,
            'driver_id': None,
            'vehicle_id': vehicle.vehicle_id,

            'location': None,

            'passenger_info': {
                'passenger_count': vehicle.passenger_count,
                'capacity': vehicle.capacity,
                'occupancy_percentage': vehicle.occupancy_percentage,
                'is_full': vehicle.is_full,
            },

            'alert': None,
        }


        async_to_sync(channel_layer.group_send)(
            f"vehicle_tracking_{vehicle_id}",
            {
                "type": "tracking_update",
                "payload": admin_payload,
            },
        )


        # Send to passenger trip sockets
        active_trips = DriverTrip.objects.filter(
            vehicle_id=vehicle_id,
            status='active',
        )


        for trip in active_trips:

            passenger_payload = {
                'type': 'vehicle_location_update',

                'trip_id': trip.trip_id,
                'driver_id': trip.driver_id,
                'vehicle_id': vehicle.vehicle_id,

                # no new GPS point
                'location': None,

                'passenger_info': {
                    'passenger_count': vehicle.passenger_count,
                    'capacity': vehicle.capacity,
                    'occupancy_percentage': vehicle.occupancy_percentage,
                    'is_full': vehicle.is_full,
                },

                'alert': None,
            }


            async_to_sync(channel_layer.group_send)(
                f"trip_tracking_{trip.trip_id}",
                {
                    "type": "tracking_update",
                    "payload": passenger_payload,
                },
            )