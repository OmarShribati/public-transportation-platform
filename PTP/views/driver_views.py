from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import DriverToken
from PTP.serializers import AdminRouteSerializer, DriverUpdateSerializer


def driver_route_data(driver):
    if driver.vehicle is None or driver.vehicle.route is None:
        return None
    return AdminRouteSerializer(driver.vehicle.route).data


class DriverProfileView(APIView):
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

    def get(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        return Response(
            {
                'id': driver.driver_id,
                'email': driver.email,
                'full_name': driver.full_name,
                'phone': driver.phone,
                'account_type': 'driver',
                'approval_status': driver.approval_status,
                'account_status': driver.account_status,
                'deactivation_requested': driver.deactivation_requested,
                'deactivation_request_status': driver.deactivation_request_status,
                'vehicle_id': driver.vehicle_id,
                'route': driver_route_data(driver),
                'created_at': driver.created_at,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        serializer = DriverUpdateSerializer(
            data=request.data,
            context={'driver': driver},
            partial=True,
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if 'email' in serializer.validated_data:
            driver.email = serializer.validated_data['email']
        if 'full_name' in serializer.validated_data:
            driver.full_name = serializer.validated_data['full_name']
        if 'phone' in serializer.validated_data:
            driver.phone = serializer.validated_data['phone']
        if 'password' in serializer.validated_data:
            driver.password = make_password(serializer.validated_data['password'])
        if 'id_card_image_1' in serializer.validated_data:
            driver.id_card_image_1 = serializer.validated_data['id_card_image_1']
        if 'id_card_image_2' in serializer.validated_data:
            driver.id_card_image_2 = serializer.validated_data['id_card_image_2']
        if 'license_image' in serializer.validated_data:
            driver.license_image = serializer.validated_data['license_image']

        driver.save()
        return Response(
            {
                'id': driver.driver_id,
                'email': driver.email,
                'full_name': driver.full_name,
                'phone': driver.phone,
                'account_type': 'driver',
                'approval_status': driver.approval_status,
                'account_status': driver.account_status,
                'deactivation_requested': driver.deactivation_requested,
                'deactivation_request_status': driver.deactivation_request_status,
                'vehicle_id': driver.vehicle_id,
                'route': driver_route_data(driver),
            },
            status=status.HTTP_200_OK,
        )


class DriverDeactivateRequestView(DriverProfileView):
    def post(self, request):
        driver, error_response = self._get_active_driver_or_response(request)
        if error_response:
            return error_response

        if not driver.deactivation_requested:
            driver.deactivation_requested = True
        driver.deactivation_request_status = 'pending'
        driver.save(update_fields=['deactivation_requested', 'deactivation_request_status'])

        return Response(
            {
                'id': driver.driver_id,
                'email': driver.email,
                'account_status': driver.account_status,
                'deactivation_requested': driver.deactivation_requested,
                'deactivation_request_status': driver.deactivation_request_status,
                'detail': 'Driver deactivation request submitted successfully.',
            },
            status=status.HTTP_200_OK,
        )
