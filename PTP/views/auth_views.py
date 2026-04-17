from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import Driver, DriverToken
from PTP.serializers import UserLoginSerializer, UserRegistrationSerializer
from PTP.services.account_service import AccountService


class RegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
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
                    'account_type': 'admin' if user.is_admin else 'passenger',
                    'token': token.key,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                request,
                username=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
            )
            if user is None:
                try:
                    driver = Driver.objects.get(email=serializer.validated_data['email'])
                except Driver.DoesNotExist:
                    driver = None

                if (
                    driver is None
                    or driver.approval_status != 'approved'
                    or driver.account_status != 'active'
                    or not check_password(serializer.validated_data['password'], driver.password)
                ):
                    return Response(
                        {'detail': 'Invalid email or password.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                token, _ = DriverToken.objects.get_or_create(driver=driver)
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

            if user.account_status != 'active':
                return Response(
                    {'detail': 'Invalid email or password.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    'id': user.id,
                    'email': user.email,
                    'account_type': 'admin' if user.is_admin else 'passenger',
                    'is_admin': user.is_admin,
                    'token': token.key,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)