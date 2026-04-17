from django.db import models

from PTP.models.driver import Driver
from PTP.models.driver_trip import DriverTrip
from PTP.models.vehicle import Vehicle


class VehicleLocation(models.Model):
    location_id = models.AutoField(primary_key=True, db_column='location_id')
    trip = models.ForeignKey(DriverTrip, related_name='locations', on_delete=models.CASCADE)
    driver = models.ForeignKey(Driver, related_name='locations', on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, related_name='locations', on_delete=models.CASCADE)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    speed_kmh = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    heading = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    distance_to_route_meters = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    is_off_route = models.BooleanField(default=False)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicle_location'
        ordering = ['-recorded_at']

    def __str__(self):
        return f"{self.vehicle} @ {self.recorded_at}"
