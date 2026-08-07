from django.db import models


class Zone(models.Model):

    DAMASCUS = 'damascus'
    SUBURBS = 'suburbs'
    RURAL = 'rural'
    OUT_DAMASCUS = 'out_damascus'

    ZONE_CHOICES = [
        (DAMASCUS, 'Damascus'),
        (SUBURBS, 'Damascus Suburbs'),
        (RURAL, 'Damascus Rural'),
        (OUT_DAMASCUS, 'out_damascus')
    ]

    zone_id = models.AutoField(primary_key=True)

    name = models.CharField(
        max_length=50,
        choices=ZONE_CHOICES,
        unique=True
    )

    level = models.PositiveIntegerField(
        default=1,
        help_text="Higher level subscription covers lower levels."
    )

    description = models.TextField(
        blank=True,
        null=True
    )
    
    monthly_price = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    default=0
)

    weekly_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    daily_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    class Meta:
        db_table = "zone"

    def __str__(self):
        return self.name