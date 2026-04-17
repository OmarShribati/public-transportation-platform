import json
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework.authtoken.models import Token

from PTP.models import DriverTrip


class TokenAuthTrackingConsumer(AsyncWebsocketConsumer):
    required_role = None

    async def connect(self):
        self.user = await self._get_user_from_query_token()
        if self.user is None or not await self._is_authorized():
            await self.close(code=4401)
            return

        self.group_name = self.get_group_name()
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def tracking_update(self, event):
        await self.send(text_data=json.dumps(event['payload']))

    async def _get_user_from_query_token(self):
        query = parse_qs(self.scope.get('query_string', b'').decode('utf-8'))
        token = (query.get('token') or [None])[0]
        if not token:
            return None
        return await self._get_user_by_token(token)

    @database_sync_to_async
    def _get_user_by_token(self, token):
        try:
            return Token.objects.select_related('user').get(key=token).user
        except Token.DoesNotExist:
            return None

    async def _is_authorized(self):
        if self.required_role == 'admin':
            return bool(self.user and self.user.is_admin)
        if self.required_role == 'passenger':
            return bool(self.user and not self.user.is_admin and self.user.account_status == 'active')
        return False

    def get_group_name(self):
        raise NotImplementedError


class VehicleTrackingConsumer(TokenAuthTrackingConsumer):
    required_role = 'admin'

    def get_group_name(self):
        return f"vehicle_tracking_{self.scope['url_route']['kwargs']['vehicle_id']}"


class TripTrackingConsumer(TokenAuthTrackingConsumer):
    required_role = 'passenger'

    async def _is_authorized(self):
        if not await super()._is_authorized():
            return False
        trip_id = self.scope['url_route']['kwargs']['trip_id']
        return await self._active_trip_exists(trip_id)

    @database_sync_to_async
    def _active_trip_exists(self, trip_id):
        return DriverTrip.objects.filter(pk=trip_id, status='active', vehicle__is_full=False).exists()

    def get_group_name(self):
        return f"trip_tracking_{self.scope['url_route']['kwargs']['trip_id']}"
