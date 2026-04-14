from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.account_management.models.driver import Driver, DriverToken, Route, Vehicle
from apps.account_management.models.user import User
from apps.account_management.serializers.user_serializers import (
    AdminAccountUpdateSerializer,
    DriverUpdateSerializer,
    PassengerUpdateSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
)
from apps.account_management.services.account_service import AccountService


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


class PassengerProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        if request.user.is_admin:
            return Response(
                {'detail': 'Only passenger accounts can update this profile.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PassengerUpdateSerializer(
            data=request.data,
            context={'user': request.user},
            partial=True,
        )
        if serializer.is_valid():
            user = request.user
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


class PassengerDeactivateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.is_admin:
            return Response(
                {'detail': 'Only passenger accounts can be deactivated here.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        request.user.account_status = 'inactive'
        request.user.save()
        Token.objects.filter(user=request.user).delete()
        return Response(
            {
                'id': request.user.id,
                'email': request.user.email,
                'account_status': request.user.account_status,
                'detail': 'Passenger account deactivated successfully.',
            },
            status=status.HTTP_200_OK,
        )


class DriverProfileView(APIView):
    def _get_driver_from_token(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Token '):
            return None
        token_key = auth_header.split(' ', 1)[1].strip()
        try:
            return DriverToken.objects.select_related('driver').get(key=token_key).driver
        except DriverToken.DoesNotExist:
            return None

    def patch(self, request):
        driver = self._get_driver_from_token(request)
        if (
            driver is None
            or driver.approval_status != 'approved'
            or driver.account_status != 'active'
        ):
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

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
            from django.contrib.auth.hashers import make_password
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
                'vehicle_id': driver.vehicle_id,
            },
            status=status.HTTP_200_OK,
        )


class AdminAccountsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response(
                {'detail': 'Admin access is required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        passengers = [
            {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'phone': user.phone,
                'account_type': 'passenger',
                'account_status': user.account_status,
                'created_at': user.created_at,
            }
            for user in request.user.__class__.objects.filter(is_admin=False).order_by('-created_at')
        ]
        drivers = [
            {
                'id': driver.driver_id,
                'email': driver.email,
                'full_name': driver.full_name,
                'phone': driver.phone,
                'account_type': 'driver',
                'approval_status': driver.approval_status,
                'account_status': driver.account_status,
                'vehicle_id': driver.vehicle_id,
                'created_at': driver.created_at,
            }
            for driver in Driver.objects.select_related('vehicle').order_by('-created_at')
        ]

        return Response(
            {
                'passengers': passengers,
                'drivers': drivers,
            },
            status=status.HTTP_200_OK,
        )


class AdminAccountUpdateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, account_type, account_id):
        if not request.user.is_admin:
            return Response(
                {'detail': 'Admin access is required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if account_type == 'passenger':
            try:
                account = User.objects.get(pk=account_id, is_admin=False)
            except User.DoesNotExist:
                return Response({'detail': 'Passenger account not found.'}, status=status.HTTP_404_NOT_FOUND)
        elif account_type == 'driver':
            try:
                account = Driver.objects.get(pk=account_id)
            except Driver.DoesNotExist:
                return Response({'detail': 'Driver account not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(
                {'detail': 'account_type must be passenger or driver.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AdminAccountUpdateSerializer(
            data=request.data,
            context={'account': account, 'account_type': account_type},
            partial=True,
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if 'email' in serializer.validated_data:
            account.email = serializer.validated_data['email']
        if 'full_name' in serializer.validated_data:
            account.full_name = serializer.validated_data['full_name']
        if 'phone' in serializer.validated_data:
            account.phone = serializer.validated_data['phone']
        if 'password' in serializer.validated_data:
            if account_type == 'passenger':
                account.set_password(serializer.validated_data['password'])
            else:
                from django.contrib.auth.hashers import make_password
                account.password = make_password(serializer.validated_data['password'])

        if account_type == 'passenger':
            if 'account_status' in serializer.validated_data:
                account.account_status = serializer.validated_data['account_status']
        else:
            if 'approval_status' in serializer.validated_data:
                account.approval_status = serializer.validated_data['approval_status']
            if 'account_status' in serializer.validated_data:
                account.account_status = serializer.validated_data['account_status']
            if 'vehicle_id' in serializer.validated_data:
                account.vehicle_id = serializer.validated_data['vehicle_id']

        try:
            account.save()
        except DjangoValidationError as exc:
            return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)

        if account_type == 'passenger':
            return Response(
                {
                    'id': account.id,
                    'email': account.email,
                    'full_name': account.full_name,
                    'phone': account.phone,
                    'account_type': 'passenger',
                    'account_status': account.account_status,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                'id': account.driver_id,
                'email': account.email,
                'full_name': account.full_name,
                'phone': account.phone,
                'account_type': 'driver',
                'approval_status': account.approval_status,
                'account_status': account.account_status,
                'vehicle_id': account.vehicle_id,
            },
            status=status.HTTP_200_OK,
        )


class AdminAccountStatusView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, account_type, account_id, action):
        if not request.user.is_admin:
            return Response(
                {'detail': 'Admin access is required.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if action not in ('activate', 'deactivate'):
            return Response(
                {'detail': 'action must be activate or deactivate.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_status = 'active' if action == 'activate' else 'inactive'

        if account_type == 'passenger':
            try:
                account = User.objects.get(pk=account_id, is_admin=False)
            except User.DoesNotExist:
                return Response({'detail': 'Passenger account not found.'}, status=status.HTTP_404_NOT_FOUND)
            account.account_status = new_status
            account.save()
            if new_status == 'inactive':
                Token.objects.filter(user=account).delete()
            return Response(
                {
                    'id': account.id,
                    'email': account.email,
                    'account_type': 'passenger',
                    'account_status': account.account_status,
                },
                status=status.HTTP_200_OK,
            )

        if account_type == 'driver':
            try:
                account = Driver.objects.get(pk=account_id)
            except Driver.DoesNotExist:
                return Response({'detail': 'Driver account not found.'}, status=status.HTTP_404_NOT_FOUND)
            if account.approval_status != 'approved':
                return Response(
                    {'detail': 'Driver account must be approved before it can be activated or deactivated.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            account.account_status = new_status
            account.save()
            if new_status == 'inactive':
                DriverToken.objects.filter(driver=account).delete()
            return Response(
                {
                    'id': account.driver_id,
                    'email': account.email,
                    'account_type': 'driver',
                    'approval_status': account.approval_status,
                    'account_status': account.account_status,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {'detail': 'account_type must be passenger or driver.'},
            status=status.HTTP_400_BAD_REQUEST,
        )


class AdminDriverApprovalView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, driver_id, action):
        if not request.user.is_admin:
            return Response(
                {'detail': 'Admin access is required.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if action not in ('approve', 'reject'):
            return Response(
                {'detail': 'action must be approve or reject.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            driver = Driver.objects.get(pk=driver_id)
        except Driver.DoesNotExist:
            return Response({'detail': 'Driver account not found.'}, status=status.HTTP_404_NOT_FOUND)

        if driver.approval_status != 'pending':
            return Response(
                {'detail': 'Driver approval decision cannot be changed after it is made.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action == 'approve':
            if driver.vehicle_id is None:
                vehicle_id = request.data.get('vehicle_id')
                vehicle_type = request.data.get('vehicle_type')
                vehicle_number = request.data.get('vehicle_number')
                route_id = request.data.get('route_id')

                if vehicle_id:
                    try:
                        driver.vehicle = Vehicle.objects.get(vehicle_id=vehicle_id)
                    except Vehicle.DoesNotExist:
                        return Response(
                            {'vehicle_id': 'Vehicle does not exist.'},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                else:
                    if not vehicle_type or not vehicle_number:
                        return Response(
                            {
                                'vehicle_type': 'This field is required when approving a driver without a vehicle.',
                                'vehicle_number': 'This field is required when approving a driver without a vehicle.',
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    if Vehicle.objects.filter(vehicle_number=vehicle_number).exists():
                        return Response(
                            {'vehicle_number': 'A vehicle with this number already exists.'},
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                    route = None
                    if route_id:
                        try:
                            route = Route.objects.get(route_id=route_id)
                        except Route.DoesNotExist:
                            return Response(
                                {'route_id': 'Route does not exist.'},
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                    driver.vehicle = Vehicle.objects.create(
                        vehicle_type=vehicle_type,
                        vehicle_number=vehicle_number,
                        ownership='government',
                        route=route,
                    )

            driver.approval_status = 'approved'
            driver.account_status = 'active'
            try:
                driver.save()
            except DjangoValidationError as exc:
                return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)
            return Response(
                {
                    'id': driver.driver_id,
                    'email': driver.email,
                    'account_type': 'driver',
                    'approval_status': driver.approval_status,
                    'account_status': driver.account_status,
                    'vehicle_id': driver.vehicle_id,
                    'detail': 'Driver account approved successfully.',
                },
                status=status.HTTP_200_OK,
            )

        driver.approval_status = 'rejected'
        driver.account_status = 'inactive'
        driver.save()
        DriverToken.objects.filter(driver=driver).delete()
        return Response(
            {
                'id': driver.driver_id,
                'email': driver.email,
                'account_type': 'driver',
                'approval_status': driver.approval_status,
                'account_status': driver.account_status,
                'vehicle_id': driver.vehicle_id,
                'detail': 'Driver account rejected successfully.',
            },
            status=status.HTTP_200_OK,
        )


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
