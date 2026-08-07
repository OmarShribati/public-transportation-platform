import json
import logging

import requests
from django.db import transaction

from PTP.models.expo_push_token import ExpoPushToken
from PTP.models.notification import Notification

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
EXPO_PUSH_TIMEOUT = 5


class NotificationService:

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------

    @classmethod
    def send_driver_notification(cls, *, driver_id: int, title: str, body: str) -> Notification:
        if driver_id is None:
            raise ValueError("driver_id must not be None.")
        return cls._send(
            user_type='driver',
            driver_id=driver_id,
            passenger_id=None,
            title=title,
            body=body,
        )

    @classmethod
    def send_passenger_notification(cls, *, passenger_id: int, title: str, body: str) -> Notification:
        if passenger_id is None:
            raise ValueError("passenger_id must not be None.")
        return cls._send(
            user_type='passenger',
            driver_id=None,
            passenger_id=passenger_id,
            title=title,
            body=body,
        )

    @classmethod
    def send_broadcast_to_passengers(cls, *, title: str, body: str):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        passengers = User.objects.filter(role='passenger')
        notifications = []
        for passenger in passengers:
            notification = cls.send_passenger_notification(
                passenger_id=passenger.id,
                title=title,
                body=body,
            )
            notifications.append(notification)
        return notifications

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    @classmethod
    @transaction.atomic
    def _send(
        cls,
        *,
        user_type: str,
        driver_id,
        passenger_id,
        title: str,
        body: str,
    ) -> Notification:
        # 1. Persist to DB first — always
        notification = Notification.objects.create(
            user_type=user_type,
            driver_id=driver_id,
            passenger_id=passenger_id,
            title=title,
            body=body,
            status='unread',
            push_sent=False,
        )
        

        # 2. Fetch Expo token from DB
        token = cls._get_token(
            user_type=user_type,
            driver_id=driver_id,
            passenger_id=passenger_id,
        )

        if token is None:
            logger.warning(
                "No Expo token found for %s id=%s — notification id=%s saved but not pushed.",
                user_type,
                driver_id or passenger_id,
                notification.pk,
            )
        else:
            # 3. Fire Expo push notification
            push_sent, push_error = cls._push(token=token, title=title, body=body)
            Notification.objects.filter(pk=notification.pk).update(
                push_sent=push_sent,
                push_error=push_error,
            )
            notification.push_sent = push_sent
            notification.push_error = push_error

        # 4. Broadcast via WebSocket — NEW STEP
        # Runs after DB commit so the client can immediately query
        # the notification via REST if needed.
        cls._broadcast_ws(notification=notification)

        return notification

    # ------------------------------------------------------------------
    # WebSocket broadcast — NEW
    # ------------------------------------------------------------------

    @staticmethod
    def _broadcast_ws(*, notification: Notification) -> None:
        """
        Push the new notification to the connected WebSocket client.

        Group naming must match NotificationConsumer:
            notifications_driver_{driver_id}
            notifications_passenger_{passenger_id}
        """
        try:
            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer

            channel_layer = get_channel_layer()
            if channel_layer is None:
                logger.warning(
                    "No channel layer configured — WebSocket notification skipped."
                )
                return

            # Build group name
            if notification.user_type == 'driver':
                group_name = f"notifications_driver_{notification.driver_id}"
            else:
                group_name = f"notifications_passenger_{notification.passenger_id}"

            # Payload sent to the consumer's notification_new() handler
            payload = {
                "type": "notification_new",     # maps to consumer method
                "data": {
                    "id": notification.pk,
                    "title": notification.title,
                    "body": notification.body,
                    "status": notification.status,
                    "created_at": notification.created_at.isoformat(),
                },
            }

            async_to_sync(channel_layer.group_send)(group_name, payload)

            logger.info(
                "WS notification broadcast → group=%s notification_id=%s",
                group_name,
                notification.pk,
            )

        except Exception as exc:
            # Never let a WebSocket failure break the notification flow
            logger.exception(
                "Failed to broadcast WS notification for id=%s: %s",
                notification.pk,
                exc,
            )

    # ------------------------------------------------------------------
    # Expo helpers — unchanged
    # ------------------------------------------------------------------

    @staticmethod
    def _get_token(*, user_type: str, driver_id, passenger_id) -> str | None:
        try:
            if user_type == 'driver':
                obj = ExpoPushToken.objects.get(
                    driver_id=driver_id, user_type='driver'
                )
            else:
                obj = ExpoPushToken.objects.get(
                    user_id=passenger_id, user_type='passenger'
                )
            return obj.token
        except ExpoPushToken.DoesNotExist:
            return None

    @staticmethod
    def _push(*, token: str, title: str, body: str) -> tuple[bool, str | None]:
        payload = {
            "to": token,
            "title": title,
            "body": body,
            "sound": "default",
        }
        try:
            response = requests.post(
                EXPO_PUSH_URL,
                json=payload,
                timeout=EXPO_PUSH_TIMEOUT,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            )
            data = response.json()
            expo_data = data.get("data")

            if isinstance(expo_data, list):
                result = expo_data[0] if expo_data else {}
            elif isinstance(expo_data, dict):
                result = expo_data
            else:
                result = {}

            if result.get("status") == "error":
                error_msg = result.get("message", "Unknown Expo error")
                logger.error("Expo push error for token %s: %s", token, error_msg)
                return False, error_msg

            return True, None

        except requests.Timeout:
            msg = "Expo push timed out."
            logger.error(msg)
            return False, msg

        except Exception as exc:
            msg = str(exc)
            logger.exception("Unexpected error sending Expo push: %s", msg)
            return False, msg
        
