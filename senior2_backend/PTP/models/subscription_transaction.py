from django.db import models

from PTP.models.transport_card import TransportCard
from PTP.models.zone import Zone
from PTP.models.user import User


class SubscriptionTransaction(models.Model):

    CASH = "cash"

    PAYMENT_METHODS = [
        (CASH, "Cash"),
    ]

    transaction_id = models.AutoField(primary_key=True)

    card = models.ForeignKey(
        TransportCard,
        on_delete=models.CASCADE,
        related_name="subscription_transactions"
    )

    merchant = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="subscription_sales"
    )

    zone = models.ForeignKey(
        Zone,
        on_delete=models.PROTECT,
        related_name="subscription_transactions"
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    duration_days = models.PositiveIntegerField()

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        default=CASH
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )


    class Meta:
        db_table = "subscription_transaction"


    def __str__(self):
        return (
            f"{self.card.card_number} - "
            f"{self.zone.name} - "
            f"{self.amount}"
        )