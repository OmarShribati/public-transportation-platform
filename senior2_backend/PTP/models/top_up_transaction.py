from django.db import models
from django.contrib.auth import get_user_model

from PTP.models.transport_card import TransportCard

User = get_user_model()


class TopUpTransaction(models.Model):
    """
    Records every balance recharge performed by a merchant on a transport card.
    Immutable after creation — never updated, only created.
    """

    transaction_id = models.AutoField(primary_key=True, db_column='transaction_id')

    card = models.ForeignKey(
        TransportCard,
        on_delete=models.CASCADE,
        related_name='top_up_transactions',
    )

    merchant = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='top_up_transactions',
        help_text="The merchant/kiosk operator who performed the recharge.",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount added to the card balance.",
    )

    balance_before = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Card balance before this top-up.",
    )

    balance_after = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Card balance after this top-up.",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'top_up_transaction'
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"TopUp #{self.transaction_id} — "
            f"Card {self.card_id} +{self.amount} by Merchant {self.merchant_id}"
        )