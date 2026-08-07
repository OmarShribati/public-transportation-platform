from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import Route
from PTP.serializers import PassengerTripSearchSerializer
from PTP.services import GeocodingService, GeocodingServiceError, PassengerRouteService


class PassengerOnlyMixin:
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def _passenger_error_response(self, request):
        if request.user.is_admin:
            return Response({'detail': 'Only passenger accounts can use this endpoint.'}, status=status.HTTP_403_FORBIDDEN)
        if request.user.account_status != 'active':
            return Response({'detail': 'Passenger account is inactive.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class PassengerTripSearchView(PassengerOnlyMixin, APIView):
    def post(self, request):
        error_response = self._passenger_error_response(request)
        if error_response:
            return error_response

        serializer = PassengerTripSearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        geocoding_service = GeocodingService()
        try:
            start = geocoding_service.resolve_point(serializer.validated_data['start'])
            destination = geocoding_service.resolve_point(serializer.validated_data['destination'])
        except GeocodingServiceError as exc:
            return Response({'location': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        routes = PassengerRouteService().find_available_routes(start, destination)
        return Response(
            {
                'start': start,
                'destination': destination,
                'routes': routes,
            },
            status=status.HTTP_200_OK,
        )


class PassengerRouteDetailView(PassengerOnlyMixin, APIView):
    def get(self, request, route_id):
        error_response = self._passenger_error_response(request)
        if error_response:
            return error_response

        try:
            route = Route.objects.prefetch_related('route_stops__stop').get(pk=route_id, is_active=True)
        except Route.DoesNotExist:
            return Response({'detail': 'Route not found.'}, status=status.HTTP_404_NOT_FOUND)

        route_data = PassengerRouteService().route_details(route)
        return Response({'route': route_data}, status=status.HTTP_200_OK)


class PassengerRouteTrackingView(PassengerOnlyMixin, APIView):
    def get(self, request, route_id):
        error_response = self._passenger_error_response(request)
        if error_response:
            return error_response

        try:
            route = Route.objects.get(pk=route_id, is_active=True)
        except Route.DoesNotExist:
            return Response({'detail': 'Route not found.'}, status=status.HTTP_404_NOT_FOUND)

        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        if latitude is None or longitude is None:
            return Response(
                {'detail': 'Passenger latitude and longitude are required for route tracking.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = PassengerRouteService()
        coordinates = service._get_route_coordinates(route)
        if not coordinates:
            return Response({'detail': 'Route path is not available.'}, status=status.HTTP_400_BAD_REQUEST)

        boarding_match = service._nearest_point_on_route(latitude, longitude, coordinates)
        active_buses = service.route_tracking(route, boarding_match=boarding_match)
        return Response(
            {
                'route_id': route.route_id,
                'route_name': route.route_name,
                'boarding_filter_applied': True,
                'active_buses': active_buses,
            },
            status=status.HTTP_200_OK,
        )


class PassengerTripTrackingView(PassengerOnlyMixin, APIView):
    def get(self, request, trip_id):
        error_response = self._passenger_error_response(request)
        if error_response:
            return error_response

        service = PassengerRouteService()
        trip_data = service.trip_tracking(trip_id)
        if trip_data is None:
            return Response({'detail': 'Active trip not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'trip': trip_data}, status=status.HTTP_200_OK)
