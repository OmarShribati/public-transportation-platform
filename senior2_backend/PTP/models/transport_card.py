import secrets
import string

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
User = get_user_model()


def _generate_qr_token():
    """
    Generates a unique, opaque QR token.
    Format: PTP-CARD-XXXXXXXX  (8 uppercase alphanumeric chars)
    Example: PTP-CARD-X8K92A3B

    The token is printed as a QR code on the physical card.
    It contains NO balance, user info, or PII — the DB is the source of truth.
    """
    alphabet = string.ascii_uppercase + string.digits
    unique_part = ''.join(secrets.choice(alphabet) for _ in range(8))
    return f"PTP-CARD-{unique_part}"


def _generate_card_number():
    """
    Generates a 16-digit card number in groups of 4.
    Format: XXXX XXXX XXXX XXXX
    Example: 2026 000142 5678 9012
    """
    digits = ''.join(secrets.choice(string.digits) for _ in range(16))
    return f"{digits[0:4]} {digits[4:8]} {digits[8:12]} {digits[12:16]}"


class TransportCard(models.Model):

    STATUS_ACTIVE    = 'active'
    STATUS_INACTIVE  = 'inactive'
    STATUS_BLOCKED   = 'blocked'

    STATUS_CHOICES = [
        (STATUS_ACTIVE,   'Active'),
        (STATUS_INACTIVE, 'Inactive'),
        (STATUS_BLOCKED,  'Blocked'),
    ]

    card_id = models.AutoField(primary_key=True, db_column='card_id')

    card_number = models.CharField(
        max_length=20,
        unique=True,
        default=_generate_card_number,
        help_text="16-digit card number printed on the physical card.",
    )

    qr_token = models.CharField(
        max_length=20,
        unique=True,
        default=_generate_qr_token,
        help_text="Opaque token encoded in the QR code. Contains NO user data.",
    )

    owner = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='transport_card',
        help_text="The passenger this card belongs to.",
    )

    balance = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Current prepaid balance in local currency.",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_INACTIVE,  # Admin activates after issuing
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transport_card'

    def __str__(self):
        return f"{self.card_number} — {self.owner.full_name} (balance: {self.balance})"

    @property
    def is_usable(self) -> bool:
        return self.status == self.STATUS_ACTIVE


    @property
    def active_subscriptions(self):
        """
        All currently-in-force zone subscriptions for this card
        (a passenger may hold subscriptions for more than one zone
        at the same time, e.g. while upgrading).
        """
        return (
            self.zone_subscriptions
            .filter(
                is_active=True,
                start_date__lte=timezone.now(),
                end_date__gte=timezone.now(),
            )
            .select_related('zone')
        )

    @property
    def active_subscription(self):
        """
        The single "best" active subscription: the one with the highest
        zone level (i.e. the broadest coverage). Ties are broken by the
        subscription that expires last.

        NOTE: this represents the best subscription overall, not
        necessarily one that covers a specific route zone — for boarding
        validation against a specific route, use
        PaymentService.get_covering_subscription() instead.
        """
        return (
            self.active_subscriptions
            .order_by('-zone__level', '-end_date')
            .first()
        )