from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
 
from PTP.models import Driver, DriverToken, Route, Vehicle
from PTP.services.notification_service import NotificationService
 
 
# ── Helpers ──────────────────────────────────────────────────────────────────
 
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
 
 
def file_url(request, file_field):
    if not file_field:
        return None
    try:
        return request.build_absolute_uri(file_field.url)
    except ValueError:
        return None
 
 
def driver_document_data(request, driver):
    return {
        'id_card_image_1_url': file_url(request, driver.id_card_image_1),
        'id_card_image_2_url': file_url(request, driver.id_card_image_2),
        'license_image_url': file_url(request, driver.license_image),
    }
 
 
def driver_response_data(request, driver, detail: str) -> dict:
    return {
        'id': driver.driver_id,
        'email': driver.email,
        'account_type': 'driver',
        'approval_status': driver.approval_status,
        'account_status': driver.account_status,
        'vehicle_id': driver.vehicle_id,
        'vehicle': vehicle_data(driver.vehicle),
        **driver_document_data(request, driver),
        'detail': detail,
    }
 
 
# ── View ──────────────────────────────────────────────────────────────────────
 
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
            driver = Driver.objects.select_related('vehicle').get(pk=driver_id)
        except Driver.DoesNotExist:
            return Response(
                {'detail': 'Driver account not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
 
        if driver.approval_status != 'pending':
            return Response(
                {'detail': 'Driver approval decision cannot be changed after it is made.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        # ── APPROVE ──────────────────────────────────────────────────────────
        if action == 'approve':
            vehicle_error = self._handle_vehicle(request, driver)
            if vehicle_error:
                return vehicle_error
 
            driver.approval_status = 'approved'
            driver.account_status = 'active'
 
            try:
                driver.save()
            except DjangoValidationError as exc:
                return Response(exc.message_dict, status=status.HTTP_400_BAD_REQUEST)
 
            # 🔔 Notify driver — DB record saved + Expo push fired
            NotificationService.send_driver_notification(
                driver_id=driver.driver_id,
                title="Account Approved ",
                body="Your driver account has been approved. You can now login.",
            )
 
            return Response(
                driver_response_data(request, driver, 'Driver account approved successfully.'),
                status=status.HTTP_200_OK,
            )
 
        # ── REJECT ───────────────────────────────────────────────────────────
        driver.approval_status = 'rejected'
        driver.account_status = 'inactive'
        driver.save()
 
        # Revoke auth token so any existing session is invalidated
        DriverToken.objects.filter(driver=driver).delete()
 
        # 🔔 Notify driver — DB record saved + Expo push fired
        NotificationService.send_driver_notification(
            driver_id=driver.driver_id,
            title="Account Rejected ",
            body="Your driver registration request has been rejected.",
        )
 
        return Response(
            driver_response_data(request, driver, 'Driver account rejected successfully.'),
            status=status.HTTP_200_OK,
        )
 
    # ── Vehicle handling (extracted for readability) ──────────────────────────
 
    @staticmethod
    def _handle_vehicle(request, driver):
        """
        Assign / activate vehicle on approval.
        Returns a Response on error, None on success (mutates driver.vehicle).
        """
        if driver.vehicle_id:
            # Driver already has a vehicle — just activate it
            unwanted = [
                field for field in ('vehicle_id', 'vehicle_type', 'vehicle_number')
                if request.data.get(field) not in (None, '')
            ]
            if unwanted:
                return Response(
                    {f: 'Do not send vehicle details when the driver already has a vehicle.' for f in unwanted},
                    status=status.HTTP_400_BAD_REQUEST,
                )
 
            driver.vehicle.is_active = True
            route_id = request.data.get('route_id')
            if route_id:
                try:
                    driver.vehicle.route = Route.objects.get(route_id=route_id)
                except Route.DoesNotExist:
                    return Response({'route_id': 'Route does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
                driver.vehicle.save(update_fields=['is_active', 'route'])
            else:
                driver.vehicle.save(update_fields=['is_active'])
 
        else:
            # Driver has no vehicle — assign or create one
            vehicle_id = request.data.get('vehicle_id')
            vehicle_type = request.data.get('vehicle_type')
            vehicle_number = request.data.get('vehicle_number')
            route_id = request.data.get('route_id')
 
            if vehicle_id:
                try:
                    vehicle = Vehicle.objects.get(vehicle_id=vehicle_id)
                except Vehicle.DoesNotExist:
                    return Response({'vehicle_id': 'Vehicle does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
 
                if vehicle.ownership != 'government':
                    return Response(
                        {'vehicle_id': 'Only government-owned vehicles can be assigned to another driver.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if vehicle.is_active:
                    return Response(
                        {'vehicle_id': 'Only inactive government-owned vehicles can be assigned to another driver.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
 
                vehicle.is_active = True
                vehicle.save(update_fields=['is_active'])
                driver.vehicle = vehicle
 
            else:
                if not vehicle_type or not vehicle_number:
                    return Response(
                        {
                            'vehicle_type': 'Required when approving a driver without a vehicle.',
                            'vehicle_number': 'Required when approving a driver without a vehicle.',
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
                        return Response({'route_id': 'Route does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
 
                driver.vehicle = Vehicle.objects.create(
                    vehicle_type=vehicle_type,
                    vehicle_number=vehicle_number,
                    ownership='government',
                    route=route,
                )
 
        return None  # No error