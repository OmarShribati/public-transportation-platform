from django.db import models

from PTP.models.scanner_device import ScannerDevice
from PTP.models.transport_card import TransportCard
from PTP.models.driver_trip import DriverTrip
from PTP.models.route import Route


class PaymentTransaction(models.Model):
    """
    Records every bus card validation/payment attempt.
    Can represent subscription-based access or fare deduction.
    """

    STATUS_SUCCESS        = 'success'
    STATUS_FAILED         = 'failed'
    STATUS_INSUFFICIENT   = 'insufficient_balance'
    STATUS_CARD_INACTIVE  = 'card_inactive'
    STATUS_SUBSCRIPTION_EXPIRED = 'subscription_expired'
    STATUS_ZONE_NOT_ALLOWED = 'zone_not_allowed'
    STATUS_NO_SUBSCRIPTION = 'no_subscription'

    STATUS_CHOICES = [
        (STATUS_SUCCESS,       'Success'),
        (STATUS_FAILED,        'Failed'),
        (STATUS_INSUFFICIENT,  'Insufficient Balance'),
        (STATUS_CARD_INACTIVE, 'Card Inactive'),
        (STATUS_SUBSCRIPTION_EXPIRED, 'Subscription Expired'),
        (STATUS_ZONE_NOT_ALLOWED, 'Zone Not Allowed'),
        (STATUS_NO_SUBSCRIPTION, 'No Subscription'),
    ]

    transaction_id = models.AutoField(primary_key=True, db_column='transaction_id')

    card = models.ForeignKey(
        TransportCard,
        on_delete=models.CASCADE,
        related_name='payment_transactions',
    )

    device = models.ForeignKey(
        ScannerDevice,
        on_delete=models.CASCADE,
        related_name='payment_transactions',
        help_text="The bus payment terminal that scanned the card.",
    )

    trip = models.ForeignKey(
        DriverTrip,
        on_delete=models.SET_NULL,
        related_name='payment_transactions',
        null=True,
        blank=True,
        help_text=(
            "The active trip during which the scan occurred. "
            "Null for attempts rejected before a trip could be resolved "
            "(e.g. card not found, card inactive)."
        ),
    )

    route = models.ForeignKey(
        Route,
        on_delete=models.SET_NULL,
        related_name='payment_transactions',
        null=True,
        blank=True,
        help_text="The route whose zone was checked. Null if no trip was resolved.",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Transaction amount. Zero for subscription-based rides.",
    )

    balance_before = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    balance_after = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    status = models.CharField(
    max_length=30,
    choices=STATUS_CHOICES,
    default=STATUS_SUCCESS,
)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payment_transaction'
        ordering = ['-created_at']

    def __str__(self):
        return (
            f"Payment #{self.transaction_id} — "
            f"Card {self.card_id} -{self.amount} on Trip {self.trip_id} [{self.status}]"
        )