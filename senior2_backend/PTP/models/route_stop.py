from django.db import models

from PTP.models.route import Route
from PTP.models.stop import Stop


class RouteStop(models.Model):
    route_stop_id = models.AutoField(primary_key=True, db_column='route_stop_id')
    route = models.ForeignKey(Route, related_name='route_stops', on_delete=models.CASCADE)
    stop = models.ForeignKey(Stop, related_name='route_stops', on_delete=models.CASCADE)
    stop_order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'route_stop'
        ordering = ['stop_order']
        constraints = [
            models.UniqueConstraint(fields=['route', 'stop'], name='unique_route_stop'),
            models.UniqueConstraint(fields=['route', 'stop_order'], name='unique_route_stop_order'),
        ]

    def __str__(self):
        return f"{self.route} - {self.stop} ({self.stop_order})"
