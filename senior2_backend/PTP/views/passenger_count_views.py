"""
Passenger Count Views
=====================
HTTP endpoint consumed exclusively by the AI camera service.

The AI service sends the current absolute passenger count after
every enter/exit event. This view validates, persists, and
broadcasts the update via WebSocket.

Endpoint:
    POST /api/driver/passenger-count/update/

Auth:
    Driver token — the AI service uses the same token as the driver
    (stored securely on the Raspberry Pi / camera device).

Request body:
    {
        "passenger_count": 12
    }

Response:
    {
        "vehicle_id": 3,
        "passenger_count": 12,
        "capacity": 50,
        "occupancy_percentage": 24.0,
        "is_full": false
    }
"""

from rest_framework import status
from rest_framework.response import Response

from PTP.models import DriverToken, DriverTrip
from PTP.services.passenger_count_service import PassengerCountService
from PTP.views.driver_tracking_views import DriverTrackingBaseView


class PassengerCountUpdateView(DriverTrackingBaseView):
    """
    Called by the AI camera service on every enter/exit event.
    Sends the new absolute passenger count for the vehicle.
    """

    def post(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        if driver.vehicle is None:
            return Response(
                {'detail': 'Driver does not have an assigned vehicle.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate input
        raw_count = request.data.get('passenger_count')
        if raw_count is None:
            return Response(
                {'passenger_count': 'This field is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            passenger_count = int(raw_count)
        except (TypeError, ValueError):
            return Response(
                {'passenger_count': 'Must be a non-negative integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if passenger_count < 0:
            return Response(
                {'passenger_count': 'Must be a non-negative integer.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Require an active trip — AI should only run when bus is in service
        trip = DriverTrip.objects.filter(
            driver=driver,
            status='active',
        ).first()

        if trip is None:
            return Response(
                {'detail': 'No active trip found. Start a trip before sending passenger counts.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payload = PassengerCountService.update_count(
                vehicle_id=driver.vehicle.vehicle_id,
                passenger_count=passenger_count,
            )
        except Exception as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(payload, status=status.HTTP_200_OK)


class VehiclePassengerCountView(DriverTrackingBaseView):
    """
    GET current passenger count for the driver's own vehicle.
    Useful for the AI service to sync state on startup.
    """

    def get(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        if driver.vehicle is None:
            return Response(
                {'detail': 'Driver does not have an assigned vehicle.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        vehicle = driver.vehicle
        return Response(
            {
                'vehicle_id': vehicle.vehicle_id,
                'passenger_count': vehicle.passenger_count,
                'capacity': vehicle.capacity,
                'occupancy_percentage': vehicle.occupancy_percentage,
                'is_full': vehicle.is_full,
            },
            status=status.HTTP_200_OK,
        )