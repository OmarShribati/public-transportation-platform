from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import Complaint, FavoriteTrip, Route
from PTP.serializers import ComplaintCreateSerializer, PassengerUpdateSerializer
from PTP.services import PassengerRouteService


class PassengerAccessMixin(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def _get_passenger_or_response(self, request, detail):
        if request.user.is_admin:
            return None, Response({'detail': detail}, status=status.HTTP_403_FORBIDDEN)
        if request.user.account_status != 'active':
            return None, Response({'detail': 'Passenger account is inactive.'}, status=status.HTTP_403_FORBIDDEN)
        return request.user, None


class PassengerProfileView(PassengerAccessMixin):

    def get(self, request):
        passenger, error_response = self._get_passenger_or_response(request, 'Only passenger accounts can view this profile.')
        if error_response:
            return error_response

        return Response(
            {
                'id': passenger.id,
                'email': passenger.email,
                'full_name': passenger.full_name,
                'phone': passenger.phone,
                'account_type': 'passenger',
                'account_status': passenger.account_status,
                'created_at': passenger.created_at,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        passenger, error_response = self._get_passenger_or_response(request, 'Only passenger accounts can update this profile.')
        if error_response:
            return error_response

        serializer = PassengerUpdateSerializer(
            data=request.data,
            context={'user': passenger},
            partial=True,
        )
        if serializer.is_valid():
            user = passenger
            if 'email' in serializer.validated_data:
                user.email = serializer.validated_data['email']
            if 'full_name' in serializer.validated_data:
                user.full_name = serializer.validated_data['full_name']
            if 'phone' in serializer.validated_data:
                user.phone = serializer.validated_data['phone']
            if 'password' in serializer.validated_data:
                user.set_password(serializer.validated_data['password'])
            user.save()
            return Response(
                {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'phone': user.phone,
                    'account_type': 'passenger',
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PassengerFavoriteTripsView(PassengerAccessMixin):
    def get(self, request):
        passenger, error_response = self._get_passenger_or_response(request, 'Only passenger accounts can view favorite trips.')
        if error_response:
            return error_response

        favorites = FavoriteTrip.objects.filter(passenger=passenger).select_related('route').prefetch_related('route__route_stops__stop').order_by('-created_at')
        route_service = PassengerRouteService()
        return Response(
            {
                'favorites': [
                    {
                        'favorite_trip_id': favorite.favorite_trip_id,
                        'created_at': favorite.created_at,
                        'route': route_service.route_details(favorite.route),
                    }
                    for favorite in favorites
                ],
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        passenger, error_response = self._get_passenger_or_response(request, 'Only passenger accounts can add favorite trips.')
        if error_response:
            return error_response

        route_id = request.data.get('route_id')
        if route_id in (None, ''):
            return Response({'route_id': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            route = Route.objects.prefetch_related('route_stops__stop').get(pk=route_id, is_active=True)
        except Route.DoesNotExist:
            return Response({'route_id': 'Active route does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        favorite, created = FavoriteTrip.objects.get_or_create(passenger=passenger, route=route)
        route_service = PassengerRouteService()
        return Response(
            {
                'favorite_trip_id': favorite.favorite_trip_id,
                'created_at': favorite.created_at,
                'route': route_service.route_details(route),
                'detail': (
                    'Route added to favorites successfully.'
                    if created
                    else 'Route is already in favorites.'
                ),
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class PassengerFavoriteTripDetailView(PassengerAccessMixin):
    def delete(self, request, route_id):
        passenger, error_response = self._get_passenger_or_response(request, 'Only passenger accounts can remove favorite trips.')
        if error_response:
            return error_response

        try:
            favorite = FavoriteTrip.objects.select_related('route').prefetch_related('route__route_stops__stop').get(
                passenger=passenger,
                route_id=route_id,
            )
        except FavoriteTrip.DoesNotExist:
            return Response({'detail': 'Favorite route not found.'}, status=status.HTTP_404_NOT_FOUND)

        route_data = PassengerRouteService().route_details(favorite.route)
        favorite.delete()
        return Response(
            {
                'route': route_data,
                'detail': 'Route removed from favorites successfully.',
            },
            status=status.HTTP_200_OK,
        )


class PassengerComplaintsView(PassengerAccessMixin):
    def post(self, request):
        passenger, error_response = self._get_passenger_or_response(request, 'Only passenger accounts can send complaints.')
        if error_response:
            return error_response

        serializer = ComplaintCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        complaint = Complaint.objects.create(
            passenger=passenger,
            message=serializer.validated_data['message'],
            image=serializer.validated_data.get('image'),
        )

        return Response(
            {
                'complaint_id': complaint.complaint_id,
                'message': complaint.message,
                'image_url': request.build_absolute_uri(complaint.image.url) if complaint.image else None,
                'created_at': complaint.created_at,
                'detail': 'Complaint sent successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


class PassengerDeactivateView(PassengerAccessMixin):

    def post(self, request):
        passenger, error_response = self._get_passenger_or_response(request, 'Only passenger accounts can be deactivated here.')
        if error_response:
            return error_response

        passenger.account_status = 'inactive'
        passenger.save()
        Token.objects.filter(user=passenger).delete()
        return Response(
            {
                'id': passenger.id,
                'email': passenger.email,
                'account_status': passenger.account_status,
                'detail': 'Passenger account deactivated successfully.',
            },
            status=status.HTTP_200_OK,
        )
