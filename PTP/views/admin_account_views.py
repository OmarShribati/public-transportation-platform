from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import Driver, DriverToken, Route, User, Vehicle
from PTP.serializers import AdminAccountCreateSerializer, AdminAccountUpdateSerializer
from PTP.services.account_service import AccountService


def vehicle_data(vehicle):
    if vehicle is None:
        return None
    return {
        'id': vehicle.vehicle_id,
        'vehicle_type': vehicle.vehicle_type,
        'vehicle_number': vehicle.vehicle_number,
        'ownership': vehicle.ownership,
        'is_active': vehicle.is_active,
        'route_id': vehicle.route_id,
    }


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
                'deactivation_requested': driver.deactivation_requested,
                'deactivation_request_status': driver.deactivation_request_status,
                'vehicle_id': driver.vehicle_id,
                'vehicle': vehicle_data(driver.vehicle),
                'created_at': driver.created_at,
            }
            for driver in Driver.objects.select_related('vehicle').order_by('-created_at')
        ]

        return Response({'passengers': passengers, 'drivers': drivers}, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_admin:
            return Response(
                {'detail': 'Admin access is required.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AdminAccountCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if serializer.validated_data['account_type'] == 'passenger':
            account = AccountService().register_user(
                email=serializer.validated_data['email'],
                full_name=serializer.validated_data['full_name'],
                phone=serializer.validated_data['phone'],
                password=serializer.validated_data['password'],
                account_type='passenger',
            )
            return Response(
                {
                    'id': account.id,
                    'email': account.email,
                    'full_name': account.full_name,
                    'phone': account.phone,
                    'account_type': 'passenger',
                    'account_status': account.account_status,
                    'detail': 'Passenger account created successfully.',
                },
                status=status.HTTP_201_CREATED,
            )

        route = None
        if serializer.validated_data.get('route_id'):
            route = Route.objects.get(route_id=serializer.validated_data['route_id'])
        vehicle = Vehicle.objects.create(
            vehicle_type=serializer.validated_data['vehicle_type'],
            vehicle_number=serializer.validated_data['vehicle_number'],
            ownership='driver' if serializer.validated_data['has_vehicle'] else 'government',
            route=route,
        )

        account = Driver.objects.create(
            full_name=serializer.validated_data['full_name'],
            email=serializer.validated_data['email'],
            phone=serializer.validated_data['phone'],
            password=make_password(serializer.validated_data['password']),
            id_card_image_1=serializer.validated_data['id_card_image_1'],
            id_card_image_2=serializer.validated_data['id_card_image_2'],
            license_image=serializer.validated_data['license_image'],
            vehicle=vehicle,
            approval_status='approved',
            account_status='active',
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
                'deactivation_requested': account.deactivation_requested,
                'deactivation_request_status': account.deactivation_request_status,
                'vehicle_id': account.vehicle_id,
                'vehicle': vehicle_data(vehicle),
                'detail': 'Driver account created and approved successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


class AdminAccountUpdateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, account_type, account_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

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
            return Response({'detail': 'account_type must be passenger or driver.'}, status=status.HTTP_400_BAD_REQUEST)

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
                account.password = make_password(serializer.validated_data['password'])

        if account_type == 'passenger':
            if 'account_status' in serializer.validated_data:
                account.account_status = serializer.validated_data['account_status']
        else:
            if 'approval_status' in serializer.validated_data:
                account.approval_status = serializer.validated_data['approval_status']
            if 'account_status' in serializer.validated_data:
                account.account_status = serializer.validated_data['account_status']
                account.deactivation_requested = False
                account.deactivation_request_status = 'none'
                if account.vehicle:
                    if account.account_status == 'inactive':
                        account.vehicle.is_active = False
                        account.vehicle.save(update_fields=['is_active'])
                    elif account.account_status == 'active':
                        account.vehicle.is_active = True
                        account.vehicle.save(update_fields=['is_active'])
            if 'vehicle_id' in serializer.validated_data:
                account.vehicle_id = serializer.validated_data['vehicle_id']
                if account.vehicle_id:
                    Vehicle.objects.filter(vehicle_id=account.vehicle_id).update(is_active=True)

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
                'deactivation_requested': account.deactivation_requested,
                'deactivation_request_status': account.deactivation_request_status,
                'vehicle_id': account.vehicle_id,
                'vehicle': vehicle_data(account.vehicle),
            },
            status=status.HTTP_200_OK,
        )


class AdminAccountStatusView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, account_type, account_id, action):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)
        if action not in ('activate', 'deactivate', 'approve-deactivation', 'reject-deactivation'):
            return Response(
                {'detail': 'action must be activate, deactivate, approve-deactivation, or reject-deactivation.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_status = 'active' if action == 'activate' else 'inactive'

        if account_type == 'passenger':
            if action in ('approve-deactivation', 'reject-deactivation'):
                if action == 'approve-deactivation':
                    return Response(
                        {'detail': 'approve-deactivation is only available for driver accounts.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                return Response(
                    {'detail': 'reject-deactivation is only available for driver accounts.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
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
            if action == 'reject-deactivation':
                if not account.deactivation_requested:
                    return Response(
                        {'detail': 'Driver does not have a pending deactivation request.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                account.deactivation_requested = False
                account.deactivation_request_status = 'rejected'
                account.save(update_fields=['deactivation_requested', 'deactivation_request_status'])
                return Response(
                    {
                        'id': account.driver_id,
                        'email': account.email,
                        'account_type': 'driver',
                        'approval_status': account.approval_status,
                        'account_status': account.account_status,
                        'deactivation_requested': account.deactivation_requested,
                        'deactivation_request_status': account.deactivation_request_status,
                        'vehicle_id': account.vehicle_id,
                        'vehicle': vehicle_data(account.vehicle),
                        'detail': 'Driver deactivation request rejected successfully.',
                    },
                    status=status.HTTP_200_OK,
                )
            if action == 'approve-deactivation':
                if not account.deactivation_requested:
                    return Response(
                        {'detail': 'Driver does not have a pending deactivation request.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            account.account_status = new_status
            account.deactivation_requested = False
            account.deactivation_request_status = 'none'
            if account.vehicle:
                if new_status == 'inactive':
                    account.vehicle.is_active = False
                    account.vehicle.save(update_fields=['is_active'])
                elif new_status == 'active':
                    account.vehicle.is_active = True
                    account.vehicle.save(update_fields=['is_active'])
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
                    'deactivation_requested': account.deactivation_requested,
                    'deactivation_request_status': account.deactivation_request_status,
                    'vehicle_id': account.vehicle_id,
                    'vehicle': vehicle_data(account.vehicle),
                    'detail': (
                        'Driver deactivation request approved successfully.'
                        if action == 'approve-deactivation'
                        else 'Driver account status updated successfully.'
                    ),
                },
                status=status.HTTP_200_OK,
            )

        return Response({'detail': 'account_type must be passenger or driver.'}, status=status.HTTP_400_BAD_REQUEST)


class AdminDriverRequestsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        account_creation_requests = [
            {
                'id': driver.driver_id,
                'email': driver.email,
                'full_name': driver.full_name,
                'phone': driver.phone,
                'account_type': 'driver',
                'approval_status': driver.approval_status,
                'account_status': driver.account_status,
                'vehicle_id': driver.vehicle_id,
                'vehicle': vehicle_data(driver.vehicle),
                'created_at': driver.created_at,
            }
            for driver in Driver.objects.select_related('vehicle').filter(approval_status='pending').order_by('-created_at')
        ]

        deactivation_requests = [
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
                'vehicle': vehicle_data(driver.vehicle),
                'created_at': driver.created_at,
            }
            for driver in Driver.objects.select_related('vehicle')
            .filter(deactivation_requested=True, deactivation_request_status='pending')
            .order_by('-created_at')
        ]

        return Response(
            {
                'account_creation_requests': account_creation_requests,
                'deactivation_requests': deactivation_requests,
            },
            status=status.HTTP_200_OK,
        )
