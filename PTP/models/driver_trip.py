from django.db import models

from PTP.models.driver import Driver
from PTP.models.route import Route
from PTP.models.vehicle import Vehicle


class DriverTrip(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    trip_id = models.AutoField(primary_key=True, db_column='trip_id')
    driver = models.ForeignKey(Driver, related_name='trips', on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, related_name='trips', on_delete=models.CASCADE)
    route = models.ForeignKey(Route, related_name='trips', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'driver_trip'

    def __str__(self):
        return f"{self.driver} - {self.route} ({self.status})"
