# import logging
 
# from django.db import transaction
 
# from PTP.models.expo_push_token import ExpoPushToken
 
# logger = logging.getLogger(__name__)
 
 
# class ExpoTokenService:
 
#     @classmethod
#     @transaction.atomic
#     def upsert_passenger_token(cls, *, user_id: int, token: str) -> ExpoPushToken:
#         """
#         Save or update the Expo push token for a passenger (User).
#         Raises ValueError if user_id is None.
#         """
#         if user_id is None:
#             raise ValueError("user_id must not be None when saving a passenger token.")
#         if not token:
#             raise ValueError("token must not be empty.")
 
#         obj, created = ExpoPushToken.objects.update_or_create(
#             user_id=user_id,
#             user_type='passenger',
#             defaults={
#                 'token': token,
#                 'driver': None,
#             },
#         )
 
#         logger.info(
#             "%s passenger Expo token for user_id=%s",
#             "Created" if created else "Updated",
#             user_id,
#         )
#         return obj
 
#     @classmethod
#     @transaction.atomic
#     def upsert_driver_token(cls, *, driver_id: int, token: str) -> ExpoPushToken:
#         """
#         Save or update the Expo push token for a driver.
#         Raises ValueError if driver_id is None.
#         """
#         if driver_id is None:
#             raise ValueError("driver_id must not be None when saving a driver token.")
#         if not token:
#             raise ValueError("token must not be empty.")
 
#         obj, created = ExpoPushToken.objects.update_or_create(
#             driver_id=driver_id,
#             user_type='driver',
#             defaults={
#                 'token': token,
#                 'user': None,
#             },
#         )
 
#         logger.info(
#             "%s driver Expo token for driver_id=%s",
#             "Created" if created else "Updated",
#             driver_id,
#         )
#         return obj 

import logging

from django.db import transaction

from PTP.models.expo_push_token import ExpoPushToken

logger = logging.getLogger(__name__)


class ExpoTokenService:

    @classmethod
    @transaction.atomic
    def upsert_passenger_token(cls, *, user_id: int, token: str) -> ExpoPushToken:

        if user_id is None:
            raise ValueError("user_id must not be None when saving a passenger token.")

        if not token:
            raise ValueError("token must not be empty.")

        # إذا التوكين موجود مسبقاً
        existing = ExpoPushToken.objects.filter(token=token).first()

        if existing:
            existing.user_id = user_id
            existing.driver = None
            existing.user_type = 'passenger'
            existing.save()

            logger.info(
                "Updated existing passenger Expo token for user_id=%s",
                user_id,
            )

            return existing

        # إذا مو موجود اعمل create/update طبيعي
        obj, created = ExpoPushToken.objects.update_or_create(
            user_id=user_id,
            user_type='passenger',
            defaults={
                'token': token,
                'driver': None,
            },
        )

        logger.info(
            "%s passenger Expo token for user_id=%s",
            "Created" if created else "Updated",
            user_id,
        )

        return obj

    @classmethod
    @transaction.atomic
    def upsert_driver_token(cls, *, driver_id: int, token: str) -> ExpoPushToken:

        if driver_id is None:
            raise ValueError("driver_id must not be None when saving a driver token.")

        if not token:
            raise ValueError("token must not be empty.")

        # إذا التوكين موجود مسبقاً
        existing = ExpoPushToken.objects.filter(token=token).first()

        if existing:
            existing.driver_id = driver_id
            existing.user = None
            existing.user_type = 'driver'
            existing.save()

            logger.info(
                "Updated existing driver Expo token for driver_id=%s",
                driver_id,
            )

            return existing

        # إذا مو موجود اعمل create/update طبيعي
        obj, created = ExpoPushToken.objects.update_or_create(
            driver_id=driver_id,
            user_type='driver',
            defaults={
                'token': token,
                'user': None,
            },
        )

        logger.info(
            "%s driver Expo token for driver_id=%s",
            "Created" if created else "Updated",
            driver_id,
        )

        return obj