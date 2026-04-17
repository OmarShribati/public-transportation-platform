from django.db import models


class Route(models.Model):
    route_id = models.AutoField(primary_key=True, db_column='route_id')
    route_name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'route'

    def __str__(self):
        return self.route_name