from django.core.exceptions import ValidationError
from django.db import models

from PTP.models.vehicle import Vehicle


class Driver(models.Model):
    driver_id = models.AutoField(primary_key=True, db_column='driver_id')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50)
    password = models.CharField(max_length=128, db_column='password_hash')
    id_card_image_1 = models.FileField(upload_to='drivers/id_cards/')
    id_card_image_2 = models.FileField(upload_to='drivers/id_cards/')
    license_image = models.FileField(upload_to='drivers/licenses/')
    vehicle = models.ForeignKey(Vehicle, null=True, blank=True, on_delete=models.SET_NULL)
    approval_status = models.CharField(max_length=50, default='pending')
    account_status = models.CharField(max_length=50, default='active')
    deactivation_requested = models.BooleanField(default=False)
    deactivation_request_status = models.CharField(max_length=50, default='none')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'driver'

    def clean(self):
        if self.approval_status == 'approved' and self.vehicle_id is None:
            raise ValidationError({
                'vehicle': 'Approved drivers must have an assigned vehicle.'
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.email})"
