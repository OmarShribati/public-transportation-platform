from django.db import transaction
from django.contrib.auth.hashers import make_password

from PTP.models import Driver, Route, Vehicle
from PTP.models.user import User


class AccountService:
    @transaction.atomic
    def register_user(
        self,
        email,
        full_name,
        phone,
        password,
        account_type,
        id_card_image_1=None,
        id_card_image_2=None,
        license_image=None,
        has_vehicle=False,
        vehicle_type=None,
        vehicle_number=None,
        route_id=None,
    ):
        if account_type == 'driver':
            vehicle = None
            if has_vehicle:
                route = None
                if route_id:
                    route = Route.objects.get(route_id=route_id)
                vehicle = Vehicle.objects.create(
                    vehicle_type=vehicle_type,
                    vehicle_number=vehicle_number,
                    ownership='driver',
                    route=route,
                )

            return Driver.objects.create(
                full_name=full_name,
                email=email,
                phone=phone,
                password=make_password(password),
                id_card_image_1=id_card_image_1,
                id_card_image_2=id_card_image_2,
                license_image=license_image,
                vehicle=vehicle,
            )

        user = User.objects.create_user(
            email=email,
            full_name=full_name,
            phone=phone,
            password=password,
            is_admin=False,
        )

        return user
