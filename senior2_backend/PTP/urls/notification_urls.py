from django.urls import path

from PTP.views import (
    NotificationListView,
    MarkNotificationReadView,
    AdminSendNotificationView,
    AdminBroadcastPassengerNotificationView,
    MarkAllNotificationsReadView,
    NotificationUnreadCountView
)

from PTP.views.expo_push_token_views import SaveExpoPushTokenView


urlpatterns = [

    path(
        'expo/token',
        SaveExpoPushTokenView.as_view(),
        name='save-expo-push-token'
    ),

    path(
        'broadcast/passengers/',
        AdminBroadcastPassengerNotificationView.as_view(),
        name='admin-broadcast-passengers'
    ),
    path(
        '',
        NotificationListView.as_view(),
        name='notification-list'
    ),
    path(
        '<int:notification_id>/read/',
        MarkNotificationReadView.as_view(),
        name='mark-notification-read'
    ),
    
    path(
        'read-all/',
        MarkAllNotificationsReadView.as_view(),
        name='notifications-read-all'
    ),
    
    path(
        'unread-count/',
        NotificationUnreadCountView.as_view(),
        name='notification-unread-count'
    ),
    
]