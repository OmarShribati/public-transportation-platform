from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import Driver, DriverTrip, Vehicle


def vehicle_data(vehicle):
    active_trip = (
        DriverTrip.objects.filter(vehicle=vehicle, status='active')
        .select_related('driver', 'route')
        .first()
    )
    driver = Driver.objects.filter(vehicle=vehicle).first()
    latest_location = active_trip.locations.order_by('-recorded_at').first() if active_trip else None

    return {
        'vehicle_id': vehicle.vehicle_id,
        'vehicle_number': vehicle.vehicle_number,
        'vehicle_type': vehicle.vehicle_type,
        'ownership': vehicle.ownership,
        'is_active': vehicle.is_active,
        'is_full': vehicle.is_full,
        'route_id': vehicle.route_id,
        'route_name': vehicle.route.route_name if vehicle.route else None,
        'driver': (
            {
                'driver_id': driver.driver_id,
                'full_name': driver.full_name,
                'email': driver.email,
                'phone': driver.phone,
                'approval_status': driver.approval_status,
                'account_status': driver.account_status,
            }
            if driver
            else None
        ),
        'active_trip': (
            {
                'trip_id': active_trip.trip_id,
                'driver_id': active_trip.driver_id,
                'route_id': active_trip.route_id,
                'status': active_trip.status,
                'started_at': active_trip.started_at,
            }
            if active_trip
            else None
        ),
        'latest_location': (
            {
                'location_id': latest_location.location_id,
                'latitude': latest_location.latitude,
                'longitude': latest_location.longitude,
                'speed_kmh': latest_location.speed_kmh,
                'heading': latest_location.heading,
                'distance_to_route_meters': latest_location.distance_to_route_meters,
                'is_off_route': latest_location.is_off_route,
                'recorded_at': latest_location.recorded_at,
            }
            if latest_location
            else None
        ),
        'created_at': vehicle.created_at,
    }


class AdminVehiclesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        vehicles = Vehicle.objects.select_related('route').order_by('vehicle_id')
        return Response(
            {
                'vehicles': [vehicle_data(vehicle) for vehicle in vehicles],
            },
            status=status.HTTP_200_OK,
        )


class AdminVehicleDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, vehicle_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            vehicle = Vehicle.objects.select_related('route').get(pk=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'vehicle': vehicle_data(vehicle)}, status=status.HTTP_200_OK)


class AdminVehicleTrackingView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, vehicle_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            vehicle = Vehicle.objects.select_related('route').get(pk=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

        active_trip = (
            DriverTrip.objects.filter(vehicle=vehicle, status='active')
            .select_related('driver', 'route')
            .first()
        )
        if active_trip is None:
            return Response(
                {
                    'vehicle_id': vehicle.vehicle_id,
                    'vehicle_number': vehicle.vehicle_number,
                    'is_tracking_active': False,
                    'trip': None,
                    'latest_location': None,
                },
                status=status.HTTP_200_OK,
            )

        latest_location = active_trip.locations.order_by('-recorded_at').first()
        return Response(
            {
                'vehicle_id': vehicle.vehicle_id,
                'vehicle_number': vehicle.vehicle_number,
                'is_tracking_active': True,
                'trip': {
                    'trip_id': active_trip.trip_id,
                    'driver_id': active_trip.driver_id,
                    'driver_name': active_trip.driver.full_name,
                    'route_id': active_trip.route_id,
                    'route_name': active_trip.route.route_name,
                    'started_at': active_trip.started_at,
                },
                'latest_location': (
                    {
                        'location_id': latest_location.location_id,
                        'latitude': latest_location.latitude,
                        'longitude': latest_location.longitude,
                        'speed_kmh': latest_location.speed_kmh,
                        'heading': latest_location.heading,
                        'distance_to_route_meters': latest_location.distance_to_route_meters,
                        'is_off_route': latest_location.is_off_route,
                        'recorded_at': latest_location.recorded_at,
                    }
                    if latest_location
                    else None
                ),
            },
            status=status.HTTP_200_OK,
        )
