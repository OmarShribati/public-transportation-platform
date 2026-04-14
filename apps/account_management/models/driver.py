from django.db import models
from django.core.exceptions import ValidationError
from django.utils.crypto import get_random_string


class Route(models.Model):
    route_id = models.AutoField(primary_key=True, db_column='route_id')
    route_name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'route'

    def __str__(self):
        return self.route_name


class Vehicle(models.Model):
    OWNERSHIP_CHOICES = [
        ('government', 'Government'),
        ('driver', 'Driver'),
    ]

    vehicle_id = models.AutoField(primary_key=True, db_column='vehicle_id')
    vehicle_number = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=100)
    is_full = models.BooleanField(default=False)
    route = models.ForeignKey(Route, null=True, blank=True, on_delete=models.SET_NULL)
    ownership = models.CharField(max_length=20, choices=OWNERSHIP_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicle'

    def __str__(self):
        return f"{self.vehicle_type} - {self.vehicle_number}"


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
