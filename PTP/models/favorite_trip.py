from django.db import models

from PTP.models.route import Route
from PTP.models.user import User


class FavoriteTrip(models.Model):
    favorite_trip_id = models.AutoField(primary_key=True, db_column='favorite_trip_id')
    passenger = models.ForeignKey(User, related_name='favorite_trips', on_delete=models.CASCADE)
    route = models.ForeignKey(Route, related_name='favorite_trips', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorite_trip'
        constraints = [
            models.UniqueConstraint(fields=['passenger', 'route'], name='unique_passenger_favorite_trip'),
        ]

    def __str__(self):
        return f"{self.passenger_id} -> {self.route_id}"
