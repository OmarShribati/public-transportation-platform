from django.db import models

from PTP.models.route import Route


class Vehicle(models.Model):
    OWNERSHIP_CHOICES = [
        ('government', 'Government'),
        ('driver', 'Driver'),
    ]

    vehicle_id = models.AutoField(primary_key=True, db_column='vehicle_id')
    vehicle_number = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=100)
    is_full = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    route = models.ForeignKey(Route, null=True, blank=True, on_delete=models.SET_NULL)
    ownership = models.CharField(max_length=20, choices=OWNERSHIP_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicle'

    def __str__(self):
        return f"{self.vehicle_type} - {self.vehicle_number}"
