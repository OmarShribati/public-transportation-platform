import json
import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from PTP.models.notification import Notification

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Single WebSocket endpoint for both passengers and drivers.

    URL:
        ws://<host>/ws/notifications/?token=<TOKEN>

    The token can be either:
        - A Django REST Framework Token  → resolves to a User (passenger/merchant/admin)
        - A DriverToken                  → resolves to a Driver

    On connect:
        1. Authenticate token → identify user_type + user_id
        2. Join personal notification group: notifications_driver_{id}
                                          or notifications_passenger_{id}
        3. Send initial unread count

    On new notification (pushed by NotificationService):
        → Receives channel message → forwards to WebSocket client
    """

    async def connect(self):
        # ── Authenticate ──────────────────────────────────────────────
        result = await self._authenticate()

        if result is None:
            await self.close(code=4401)
            return

        self.user_type, self.user_id = result

        # ── Join personal group ───────────────────────────────────────
        self.group_name = f"notifications_{self.user_type}_{self.user_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        logger.info(
            "NotificationConsumer connected: %s id=%s group=%s",
            self.user_type, self.user_id, self.group_name,
        )

        # ── Send initial unread count ─────────────────────────────────
        count = await self._get_unread_count()
        await self.send(text_data=json.dumps({
            "type": "unread_count",
            "count": count,
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )
            logger.info(
                "NotificationConsumer disconnected: %s id=%s",
                self.user_type, self.user_id,
            )

    async def receive(self, text_data=None, bytes_data=None):
        """
        We don't expect messages from the client.
        This slot is here for future use (e.g. client-side ping).
        """
        pass

    # ── Channel layer event handlers ──────────────────────────────────
    # These are called by NotificationService via channel_layer.group_send()

    async def notification_new(self, event):
        """
        Triggered when a new notification is created.
        Sends the notification data + updated unread count.
        """
        await self.send(text_data=json.dumps({
            "type": "notification",
            "data": event["data"],
        }))

        # Also send updated unread count immediately after
        count = await self._get_unread_count()
        await self.send(text_data=json.dumps({
            "type": "unread_count",
            "count": count,
        }))

    async def notification_unread_count(self, event):
        """
        Triggered when unread count changes (e.g. after mark-as-read).
        """
        await self.send(text_data=json.dumps({
            "type": "unread_count",
            "count": event["count"],
        }))

    # ── Authentication ────────────────────────────────────────────────

    async def _authenticate(self):
        """
        Resolves the token from ?token=<TOKEN> query string.

        Checks DriverToken first, then DRF Token.
        Returns (user_type, user_id) or None if invalid.
        """
        query = parse_qs(
            self.scope.get('query_string', b'').decode('utf-8')
        )
        token_key = (query.get('token') or [None])[0]

        if not token_key:
            logger.warning("NotificationConsumer: no token in query string.")
            return None

        return await self._resolve_token(token_key)

    @database_sync_to_async
    def _resolve_token(self, token_key: str):
        """
        Tries DriverToken first, then DRF Token.
        Returns (user_type, user_id) or None.
        """
        # ── Try DriverToken ───────────────────────────────────────────
        from PTP.models.driver_token import DriverToken
        try:
            driver_token = DriverToken.objects.select_related('driver').get(
                key=token_key
            )
            driver = driver_token.driver
            if driver.account_status != 'active':
                logger.warning(
                    "NotificationConsumer: driver %s account not active.",
                    driver.driver_id,
                )
                return None
            return ('driver', driver.driver_id)
        except DriverToken.DoesNotExist:
            pass

        # ── Try DRF Token (passenger / merchant / admin) ──────────────
        from rest_framework.authtoken.models import Token
        try:
            token = Token.objects.select_related('user').get(key=token_key)
            user = token.user
            if user.account_status != 'active':
                logger.warning(
                    "NotificationConsumer: user %s account not active.",
                    user.id,
                )
                return None
            return ('passenger', user.id)
        except Token.DoesNotExist:
            pass

        logger.warning(
            "NotificationConsumer: token not found in DriverToken or Token."
        )
        return None

    # ── Database helpers ──────────────────────────────────────────────

    @database_sync_to_async
    def _get_unread_count(self) -> int:
        """Returns the number of unread notifications for this user."""
        if self.user_type == 'driver':
            return Notification.objects.filter(
                driver_id=self.user_id,
                user_type='driver',
                status='unread',
            ).count()
        else:
            return Notification.objects.filter(
                passenger_id=self.user_id,
                user_type='passenger',
                status='unread',
            ).count()