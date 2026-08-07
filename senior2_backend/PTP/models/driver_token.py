from django.db import models
from django.utils.crypto import get_random_string

from PTP.models.driver import Driver


class DriverToken(models.Model):
    key = models.CharField(max_length=40, primary_key=True)
    driver = models.OneToOneField(Driver, related_name='auth_token', on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'driver_token'

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = get_random_string(40)
        return super().save(*args, **kwargs)