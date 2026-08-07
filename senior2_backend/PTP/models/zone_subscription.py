from django.db import models
from django.utils import timezone

from PTP.models.transport_card import TransportCard
from PTP.models.zone import Zone


class ZoneSubscription(models.Model):

    subscription_id = models.AutoField(primary_key=True)

    card = models.ForeignKey(
        TransportCard,
        on_delete=models.CASCADE,
        related_name="zone_subscriptions"
    )

    zone = models.ForeignKey(
        Zone,
        on_delete=models.PROTECT,
        related_name="subscriptions"
    )

    start_date = models.DateTimeField(default=timezone.now)

    end_date = models.DateTimeField()

    is_active = models.BooleanField(default=True)


    class Meta:
        db_table = "zone_subscription"


    def __str__(self):
        return f"{self.card.card_number} - {self.zone.name}"