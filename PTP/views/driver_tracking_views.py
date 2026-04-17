from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import DriverToken, DriverTrip, VehicleLocation
from PTP.serializers import DriverLocationSerializer, DriverVehicleStatusSerializer
from PTP.services import RouteDeviationService, TrackingBroadcastService


def trip_data(trip):
    return {
        'trip_id': trip.trip_id,
        'driver_id': trip.driver_id,
        'vehicle_id': trip.vehicle_id,
        'route_id': trip.route_id,
        'status': trip.status,
        'started_at': trip.started_at,
        'ended_at': trip.ended_at,
    }


class DriverTrackingBaseView(APIView):
    def _get_driver_from_token(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Token '):
            return None
        token_key = auth_header.split(' ', 1)[1].strip()
        try:
            return DriverToken.objects.select_related('driver__vehicle__route').get(key=token_key).driver
        except DriverToken.DoesNotExist:
            return None

    def _get_active_driver_or_response(self, request):
        driver = self._get_driver_from_token(request)
        if (
            driver is None
            or driver.approval_status != 'approved'
            or driver.account_status != 'active'
        ):
            return None, Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return driver, None


class DriverTripStatusView(DriverTrackingBaseView):
    def get(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        trip = DriverTrip.objects.filter(driver=driver, status='active').select_related('vehicle', 'route').first()
        return Response(
            {
                'is_tracking_active': trip is not None,
                'trip': trip_data(trip) if trip else None,
                'vehicle_id': driver.vehicle_id,
                'route_id': driver.vehicle.route_id if driver.vehicle else None,
            },
            status=status.HTTP_200_OK,
        )


class DriverTripStartView(DriverTrackingBaseView):
    def post(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        if driver.vehicle is None:
            return Response({'detail': 'Driver does not have an assigned vehicle.'}, status=status.HTTP_400_BAD_REQUEST)
        if driver.vehicle.route is None:
            return Response({'detail': 'Driver vehicle does not have an assigned route.'}, status=status.HTTP_400_BAD_REQUEST)

        trip = DriverTrip.objects.filter(driver=driver, status='active').select_related('vehicle', 'route').first()
        if trip is not None:
            return Response(
                {
                    'trip': trip_data(trip),
                    'detail': 'Vehicle tracking is already active.',
                },
                status=status.HTTP_200_OK,
            )

        trip = DriverTrip.objects.create(
            driver=driver,
            vehicle=driver.vehicle,
            route=driver.vehicle.route,
        )
        driver.vehicle.is_active = True
        driver.vehicle.save(update_fields=['is_active'])

        return Response(
            {
                'trip': trip_data(trip),
                'detail': 'Vehicle tracking activated successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


class DriverTripStopView(DriverTrackingBaseView):
    def post(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        trip = DriverTrip.objects.filter(driver=driver, status='active').select_related('vehicle', 'route').first()
        if trip is None:
            return Response({'detail': 'There is no active vehicle tracking session.'}, status=status.HTTP_400_BAD_REQUEST)

        trip.status = 'completed'
        trip.ended_at = timezone.now()
        trip.save(update_fields=['status', 'ended_at'])

        return Response(
            {
                'trip': trip_data(trip),
                'detail': 'Vehicle tracking stopped successfully.',
            },
            status=status.HTTP_200_OK,
        )


class DriverLocationUpdateView(DriverTrackingBaseView):
    def post(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        trip = DriverTrip.objects.filter(driver=driver, status='active').select_related('vehicle', 'route').first()
        if trip is None:
            return Response({'detail': 'Start vehicle tracking before sending GPS locations.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = DriverLocationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        route_check = RouteDeviationService().check_location(
            trip.route,
            serializer.validated_data['latitude'],
            serializer.validated_data['longitude'],
        )
        location = VehicleLocation.objects.create(
            trip=trip,
            driver=driver,
            vehicle=trip.vehicle,
            latitude=serializer.validated_data['latitude'],
            longitude=serializer.validated_data['longitude'],
            speed_kmh=serializer.validated_data.get('speed_kmh'),
            heading=serializer.validated_data.get('heading'),
            distance_to_route_meters=route_check['distance_to_route_meters'],
            is_off_route=route_check['is_off_route'],
        )
        TrackingBroadcastService().broadcast_location(location, alert=route_check['alert'])

        return Response(
            {
                'location': {
                    'location_id': location.location_id,
                    'trip_id': location.trip_id,
                    'driver_id': location.driver_id,
                    'vehicle_id': location.vehicle_id,
                    'latitude': location.latitude,
                    'longitude': location.longitude,
                    'speed_kmh': location.speed_kmh,
                    'heading': location.heading,
                    'distance_to_route_meters': location.distance_to_route_meters,
                    'is_off_route': location.is_off_route,
                    'recorded_at': location.recorded_at,
                },
                'alert': route_check['alert'],
                'detail': 'GPS location recorded successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


class DriverVehicleStatusView(DriverTrackingBaseView):
    def patch(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        if driver.vehicle is None:
            return Response({'detail': 'Driver does not have an assigned vehicle.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = DriverVehicleStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        driver.vehicle.is_full = serializer.validated_data['is_full']
        driver.vehicle.save(update_fields=['is_full'])
        return Response(
            {
                'vehicle': {
                    'vehicle_id': driver.vehicle.vehicle_id,
                    'vehicle_number': driver.vehicle.vehicle_number,
                    'is_full': driver.vehicle.is_full,
                    'route_id': driver.vehicle.route_id,
                },
                'detail': 'Vehicle status updated successfully.',
            },
            status=status.HTTP_200_OK,
        )
