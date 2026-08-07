import secrets

from django.db import models

from PTP.models.vehicle import Vehicle


def _generate_secret_key():
    """Generates a secure 40-character hex secret key for device authentication."""
    return secrets.token_hex(20)


class ScannerDevice(models.Model):

    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_INACTIVE, 'Inactive'),
    ]

    device_id = models.AutoField(
        primary_key=True,
        db_column='device_id'
    )

    device_code = models.CharField(
        max_length=50,
        unique=True,
        help_text="Human-readable device identifier. Example: BUS_DEVICE_01",
    )

    vehicle = models.OneToOneField(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='scanner_device',
        help_text="The bus this payment terminal is installed in.",
    )

    secret_key = models.CharField(
        max_length=40,
        unique=True,
        default=_generate_secret_key,
        help_text="Secret key sent in X-Device-Secret header for authentication.",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scanner_device'

    def __str__(self):
        return f"{self.device_code} → Vehicle {self.vehicle_id}"

    @property
    def is_active(self) -> bool:
        return self.status == self.STATUS_ACTIVE

    @property
    def is_authenticated(self) -> bool:
        return True