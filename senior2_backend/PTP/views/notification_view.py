from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
 
from PTP.models import Driver, DriverToken, Notification
from PTP.services.notification_service import NotificationService
from PTP.authentication import DriverTokenAuthentication
 
# ── Auth helper ───────────────────────────────────────────────────────────────
 
def get_authenticated_user(request):
    """
    Returns (user_id, user_type) for the current request.
    Checks DriverToken first, then falls back to Django session/Token user.
    Returns (None, None) if unauthenticated.
    """
    auth_header = request.headers.get('Authorization', '')
    token_key = auth_header.replace('Token ', '').strip()
 
    if token_key:
        try:
            driver_token = DriverToken.objects.select_related('driver').get(key=token_key)
            return driver_token.driver.driver_id, 'driver'
        except DriverToken.DoesNotExist:
            pass
 
    if request.user.is_authenticated:
        return request.user.id, 'passenger'
 
    return None, None
 
 
# ── Views ─────────────────────────────────────────────────────────────────────
 
class NotificationListView(APIView):

    authentication_classes = [
        DriverTokenAuthentication,
        TokenAuthentication,
    ]

    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        user_id, user_type = get_authenticated_user(request)
 
        if not user_id:
            return Response({'detail': 'Unauthorized.'}, status=401)
 
        # Filter on the correct column based on user_type
        if user_type == 'driver':
            notifications = Notification.objects.filter(
                driver_id=user_id,
                user_type='driver',
            ).order_by('-created_at')
        else:
            notifications = Notification.objects.filter(
                passenger_id=user_id,
                user_type='passenger',
            ).order_by('-created_at')
 
        return Response([
            {
                'id': n.id,
                'title': n.title,
                'body': n.body,
                'status': n.status,
                'created_at': n.created_at,
            }
            for n in notifications
        ])
 
 
class MarkNotificationReadView(APIView):
    authentication_classes = [
        DriverTokenAuthentication,
        TokenAuthentication
        ]
    permission_classes = [IsAuthenticated]
 
    def post(self, request, notification_id):
        user_id, user_type = get_authenticated_user(request)
 
        if not user_id:
            return Response({'detail': 'Unauthorized.'}, status=401)
 
        # Look up on the correct column
        filter_kwargs = (
            {'driver_id': user_id, 'user_type': 'driver'}
            if user_type == 'driver'
            else {'passenger_id': user_id, 'user_type': 'passenger'}
        )
 
        try:
            notification = Notification.objects.get(id=notification_id, **filter_kwargs)
        except Notification.DoesNotExist:
            return Response({'detail': 'Notification not found.'}, status=404)
 
        notification.status = 'read'
        notification.save(update_fields=['status'])
        
        _broadcast_unread_count(user_id, user_type)
 
        return Response({'detail': 'Marked as read.'})
 
 
class AdminSendNotificationView(APIView):
    """
    Admin-only endpoint to manually push a notification to a driver or passenger.
 
    POST body:
        {
            "user_id": <int>,
            "user_type": "driver" | "passenger",
            "title": "...",
            "body": "..."
        }
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        if not request.user.is_admin:
            return Response({'detail': 'Forbidden.'}, status=403)
 
        user_id = request.data.get('user_id')
        user_type = request.data.get('user_type')
        title = request.data.get('title', '').strip()
        body = request.data.get('body', '').strip()
 
        # Validate
        errors = {}
        if not user_id:
            errors['user_id'] = 'This field is required.'
        if user_type not in ('driver', 'passenger'):
            errors['user_type'] = "Must be 'driver' or 'passenger'."
        if not title:
            errors['title'] = 'This field is required.'
        if not body:
            errors['body'] = 'This field is required.'
        if errors:
            return Response(errors, status=400)
 
        # Verify target exists
        if user_type == 'driver':
            if not Driver.objects.filter(driver_id=user_id).exists():
                return Response({'detail': 'Driver not found.'}, status=404)
 
            NotificationService.send_driver_notification(
                driver_id=user_id,
                title=title,
                body=body,
            )
 
        else:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            if not User.objects.filter(id=user_id).exists():
                return Response({'detail': 'Passenger not found.'}, status=404)
 
            NotificationService.send_passenger_notification(
                passenger_id=user_id,
                title=title,
                body=body,
            )
 
        return Response({'detail': 'Notification sent successfully.'})
    
class AdminBroadcastPassengerNotificationView(APIView):
        """
        Admin sends notification to all passengers.
        """

        authentication_classes = [TokenAuthentication]
        permission_classes = [IsAuthenticated]

        def post(self, request):

            if not request.user.is_admin:
                return Response(
                    {'detail': 'Forbidden.'},
                    status=403
                )

            title = request.data.get('title', '').strip()
            body = request.data.get('body', '').strip()

            errors = {}

            if not title:
                errors['title'] = 'This field is required.'

            if not body:
                errors['body'] = 'This field is required.'

            if errors:
                return Response(
                    errors,
                    status=400
                )

            notifications = NotificationService.send_broadcast_to_passengers(
                title=title,
                body=body,
            )

            return Response(
                {
                    'detail': 'Notification sent successfully.',
                    'sent_count': len(notifications),
                },
                status=200,
            )
            
class MarkAllNotificationsReadView(APIView):
    authentication_classes = [
        DriverTokenAuthentication,
        TokenAuthentication,
        
    ]
    permission_classes = [IsAuthenticated]

    def post(self, request):

        user_id, user_type = get_authenticated_user(request)

        if not user_id:
            return Response(
                {'detail': 'Unauthorized.'},
                status=401
            )

        if user_type == 'driver':
            updated_count = Notification.objects.filter(
                driver_id=user_id,
                user_type='driver',
                status='unread'
            ).update(
                status='read'
            )

        else:
            updated_count = Notification.objects.filter(
                passenger_id=user_id,
                user_type='passenger',
                status='unread'
            ).update(
                status='read'
            )
            
        _broadcast_unread_count(user_id, user_type)

        return Response({
            'detail': 'All notifications marked as read.',
            'updated_count': updated_count,
        })
        
def _broadcast_unread_count(user_id: int, user_type: str) -> None:
    """Push updated unread count to connected WebSocket client."""
    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer

        channel_layer = get_channel_layer()
        if channel_layer is None:
            return

        if user_type == 'driver':
            count = Notification.objects.filter(
                driver_id=user_id, user_type='driver', status='unread'
            ).count()
            group_name = f"notifications_driver_{user_id}"
        else:
            count = Notification.objects.filter(
                passenger_id=user_id, user_type='passenger', status='unread'
            ).count()
            group_name = f"notifications_passenger_{user_id}"

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "notification_unread_count",
                "count": count,
            },
        )
    except Exception:
        pass
    
class NotificationUnreadCountView(APIView):

    authentication_classes = [
        DriverTokenAuthentication,
        TokenAuthentication,
    ]

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user_id, user_type = get_authenticated_user(request)

        if not user_id:
            return Response(
                {'detail': 'Unauthorized.'},
                status=401
            )

        if user_type == 'driver':
            count = Notification.objects.filter(
                driver_id=user_id,
                user_type='driver',
                status='unread'
            ).count()

        else:
            count = Notification.objects.filter(
                passenger_id=user_id,
                user_type='passenger',
                status='unread'
            ).count()

        return Response({
            "unread_count": count
        })
        
        