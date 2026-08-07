from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import Driver, DriverToken
from PTP.serializers import UserLoginSerializer, UserRegistrationSerializer
from PTP.services.account_service import AccountService
from PTP.services.expo_token_service import ExpoTokenService


def _user_account_type(user) -> str:
    """Resolve the correct account_type string for a User instance."""
    if user.is_admin:
        return 'admin'
    if user.is_merchant:
        return 'merchant'
    return 'passenger'


class RegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = AccountService().register_user(
            email=serializer.validated_data['email'],
            full_name=serializer.validated_data['full_name'],
            phone=serializer.validated_data['phone'],
            password=serializer.validated_data['password'],
            account_type=serializer.validated_data['account_type'],
            id_card_image_1=serializer.validated_data.get('id_card_image_1'),
            id_card_image_2=serializer.validated_data.get('id_card_image_2'),
            license_image=serializer.validated_data.get('license_image'),
            has_vehicle=serializer.validated_data.get('has_vehicle', False),
            vehicle_type=serializer.validated_data.get('vehicle_type'),
            vehicle_number=serializer.validated_data.get('vehicle_number'),
            route_id=serializer.validated_data.get('route_id'),
            expo_push_token=serializer.validated_data.get('expo_push_token'),
            address=serializer.validated_data.get('address'),
        )

        if serializer.validated_data['account_type'] == 'driver':
            return Response(
                {
                    'id': user.driver_id,
                    'email': user.email,
                    'account_type': 'driver',
                    'approval_status': user.approval_status,
                    'account_status': user.account_status,
                    'vehicle_id': user.vehicle_id,
                    'detail': 'Driver account is pending admin approval.',
                },
                status=status.HTTP_201_CREATED,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                'id': user.id,
                'email': user.email,
                'account_type': _user_account_type(user),
                'token': token.key,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        expo_push_token = serializer.validated_data.get('expo_push_token', '').strip()

        # ── Try passenger / merchant / admin auth ─────────────────────────────
        user = authenticate(request, username=email, password=password)

        if user is None:
            # ── Try driver auth ───────────────────────────────────────────────
            try:
                driver = Driver.objects.get(email=email)
            except Driver.DoesNotExist:
                driver = None

            if (
                driver is None
                or driver.approval_status != 'approved'
                or driver.account_status != 'active'
                or not check_password(password, driver.password)
            ):
                return Response(
                    {'detail': 'Invalid email or password.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token, _ = DriverToken.objects.get_or_create(driver=driver)

            if expo_push_token:
                ExpoTokenService.upsert_driver_token(
                    driver_id=driver.driver_id,
                    token=expo_push_token,
                )

            return Response(
                {
                    'id': driver.driver_id,
                    'email': driver.email,
                    'account_type': 'driver',
                    'approval_status': driver.approval_status,
                    'account_status': driver.account_status,
                    'vehicle_id': driver.vehicle_id,
                    'is_admin': False,
                    'token': token.key,
                },
                status=status.HTTP_200_OK,
            )

        # ── User (passenger / merchant / admin) ───────────────────────────────
        if user.account_status != 'active':
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)

        if expo_push_token:
            ExpoTokenService.upsert_passenger_token(
                user_id=user.id,
                token=expo_push_token,
            )

        return Response(
            {
                'id': user.id,
                'email': user.email,
                'account_type': _user_account_type(user),
                'is_admin': user.is_admin,
                'token': token.key,
            },
            status=status.HTTP_200_OK,
        )