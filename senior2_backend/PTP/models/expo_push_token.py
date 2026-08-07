from django.db import models
from django.contrib.auth import get_user_model
 
User = get_user_model()
 
USER_TYPE_CHOICES = (
    ('passenger', 'Passenger'),
    ('driver', 'Driver'),
)
 
 
class ExpoPushToken(models.Model):
    """
    Unified Expo push token table for both passengers and drivers.
 
    Rules:
    - user_id is NEVER null for passengers (enforced at model level)
    - driver_id is NEVER null for drivers (enforced at model level)
    - Exactly one of (user, driver) must be set — enforced in clean()
    - One token per user/driver — upsert logic in the service layer
    - updated_at tracks every login refresh
    """
 
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='expo_push_token',
        db_column='user_id',
    )
    driver = models.OneToOneField(
        'PTP.Driver',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='expo_push_token_obj',
        db_column='driver_id',
    )
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    token = models.CharField(max_length=255)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = 'expo_push_token'
        constraints = [
            # Ensures token string is unique across the table
            models.UniqueConstraint(fields=['token'], name='unique_expo_token'),
        ]
 
    def clean(self):
        from django.core.exceptions import ValidationError
 
        if self.user_type == 'passenger':
            if self.user_id is None:
                raise ValidationError({'user': 'user_id is required for passenger tokens.'})
            if self.driver_id is not None:
                raise ValidationError({'driver': 'driver_id must be null for passenger tokens.'})
 
        elif self.user_type == 'driver':
            if self.driver_id is None:
                raise ValidationError({'driver': 'driver_id is required for driver tokens.'})
            if self.user_id is not None:
                raise ValidationError({'user': 'user_id must be null for driver tokens.'})
 
        else:
            raise ValidationError({'user_type': f'Unknown user_type: {self.user_type}'})
 
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
 
    def __str__(self):
        if self.user_type == 'passenger':
            return f'Passenger({self.user_id}) → {self.token}'
        return f'Driver({self.driver_id}) → {self.token}'