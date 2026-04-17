from django.db import models


class Route(models.Model):
    route_id = models.AutoField(primary_key=True, db_column='route_id')
    route_name = models.CharField(max_length=255, unique=True)
    start_latitude = models.DecimalField(max_digits=9, decimal_places=6, default=0)
    start_longitude = models.DecimalField(max_digits=9, decimal_places=6, default=0)
    end_latitude = models.DecimalField(max_digits=9, decimal_places=6, default=0)
    end_longitude = models.DecimalField(max_digits=9, decimal_places=6, default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    path = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'route'

    def __str__(self):
        return self.route_name
