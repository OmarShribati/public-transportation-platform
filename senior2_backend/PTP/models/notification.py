from django.db import models
 
 
USER_TYPE_CHOICES = (
    ('passenger', 'Passenger'),
    ('driver', 'Driver'),
)
 
NOTIFICATION_STATUS_CHOICES = (
    ('unread', 'Unread'),
    ('read', 'Read'),
)
 
 
class Notification(models.Model):
    """
    Persisted notification record.
 
    user_id / driver_id are raw integers (not FK) intentionally —
    the two user tables are separate (User vs Driver), so a generic
    integer + user_type pair is the cleanest cross-table reference
    without a polymorphic FK library.
 
    The notification service always creates a DB record BEFORE
    attempting the Expo push, so every notification is auditable
    even when the push fails.
    """
 
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
 
    # Exactly one of these is set — validated in clean()
    passenger_id = models.IntegerField(null=True, blank=True, db_index=True)
    driver_id = models.IntegerField(null=True, blank=True, db_index=True)
 
    title = models.CharField(max_length=255)
    body = models.TextField()
 
    status = models.CharField(
        max_length=10,
        choices=NOTIFICATION_STATUS_CHOICES,
        default='unread',
        db_index=True,
    )
 
    # Tracks whether the Expo push was delivered successfully
    push_sent = models.BooleanField(default=False)
    push_error = models.TextField(null=True, blank=True)
 
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'notification'
        ordering = ['-created_at']
 
    def clean(self):
        from django.core.exceptions import ValidationError
 
        if self.user_type == 'passenger':
            if self.passenger_id is None:
                raise ValidationError({'passenger_id': 'passenger_id required for passenger notifications.'})
            if self.driver_id is not None:
                raise ValidationError({'driver_id': 'driver_id must be null for passenger notifications.'})
 
        elif self.user_type == 'driver':
            if self.driver_id is None:
                raise ValidationError({'driver_id': 'driver_id required for driver notifications.'})
            if self.passenger_id is not None:
                raise ValidationError({'passenger_id': 'passenger_id must be null for driver notifications.'})
 
        else:
            raise ValidationError({'user_type': f'Unknown user_type: {self.user_type}'})
 
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
 
    def __str__(self):
        recipient = f'Driver({self.driver_id})' if self.user_type == 'driver' else f'Passenger({self.passenger_id})'
        return f'[{self.status}] {recipient} — {self.title}'