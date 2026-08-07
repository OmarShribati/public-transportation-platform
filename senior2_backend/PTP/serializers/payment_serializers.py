from decimal import Decimal

from rest_framework import serializers

from PTP.models.payment_transaction import PaymentTransaction
from PTP.models.top_up_transaction import TopUpTransaction
from PTP.models.transport_card import TransportCard


from PTP.models.zone_subscription import ZoneSubscription
from PTP.models.zone import Zone
from PTP.models.subscription_transaction import SubscriptionTransaction


# ── Admin ─────────────────────────────────────────────────────────────────────

class TransportCardCreateSerializer(serializers.Serializer):
    """Admin creates a card for a passenger."""
    owner_id = serializers.IntegerField()


class TransportCardStatusSerializer(serializers.Serializer):
    """Admin activates / blocks / deactivates a card."""
    status = serializers.ChoiceField(choices=[
        TransportCard.STATUS_ACTIVE,
        TransportCard.STATUS_INACTIVE,
        TransportCard.STATUS_BLOCKED,
    ])


# ── Merchant ──────────────────────────────────────────────────────────────────

class TopUpSerializer(serializers.Serializer):
    """Merchant recharges a card by scanning its QR token."""
    qr_token = serializers.CharField(max_length=20)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0.01"))


# ── Scanner Device ────────────────────────────────────────────────────────────

class CardScanSerializer(serializers.Serializer):
    """Bus payment terminal scans a passenger QR code."""
    card_token = serializers.CharField(max_length=20)


# ── Response / Read ───────────────────────────────────────────────────────────

class TransportCardSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)

    class Meta:
        model = TransportCard
        fields = [
            'card_id',
            'card_number',
            'qr_token',
            'owner_id',
            'owner_name',
            'owner_email',
            'balance',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class TopUpTransactionSerializer(serializers.ModelSerializer):
    merchant_name = serializers.CharField(source='merchant.full_name', read_only=True)
    card_number = serializers.CharField(source='card.card_number', read_only=True)

    class Meta:
        model = TopUpTransaction
        fields = [
            'transaction_id',
            'card_id',
            'card_number',
            'merchant_id',
            'merchant_name',
            'amount',
            'balance_before',
            'balance_after',
            'created_at',
        ]
        read_only_fields = fields


class PaymentTransactionSerializer(serializers.ModelSerializer):
    card_number = serializers.CharField(
        source='card.card_number',
        read_only=True
    )

    route_name = serializers.CharField(
        source='route.route_name',
        read_only=True
    )

    device_code = serializers.CharField(
        source='device.device_code',
        read_only=True
    )

    subscription = serializers.SerializerMethodField()
    zone = serializers.SerializerMethodField()
    payment = serializers.SerializerMethodField()


    class Meta:
        model = PaymentTransaction
        fields = [
            'transaction_id',

            'card_id',
            'card_number',

            'device_id',
            'device_code',

            'trip_id',

            'route_id',
            'route_name',

            'zone',
            'subscription',

            'payment',

            'status',
            'created_at',
        ]

        read_only_fields = fields


    def get_zone(self, obj):
        if not obj.route or not hasattr(obj.route, 'zone'):
            return None

        zone = obj.route.zone

        return {
            "zone_id": zone.zone_id,
            "zone_name": zone.name,
            "zone_level": zone.level,
        }


    def get_subscription(self, obj):
        """
        Find subscription that allowed this ride.
        """

        if not obj.route:
            return None

        if not hasattr(obj.route, 'zone'):
            return None


        zone = obj.route.zone


        subscription = (
            obj.card.zone_subscriptions
            .filter(
                zone=zone
            )
            .order_by('-end_date')
            .first()
        )


        if not subscription:
            return None


        from django.utils import timezone

        is_expired = subscription.end_date < timezone.now()


        subscription_type = None


        try:
            transaction = (
                obj.card.subscription_transactions
                .filter(
                    zone=zone
                )
                .order_by('-created_at')
                .first()
            )


            if transaction:
                if transaction.duration_days == 1:
                    subscription_type = "daily"

                elif transaction.duration_days == 7:
                    subscription_type = "weekly"

                elif transaction.duration_days >= 30:
                    subscription_type = "monthly"

        except Exception:
            pass


        return {
            "subscription_id": subscription.subscription_id,
            "zone_id": zone.zone_id,
            "zone_name": zone.name,
            "zone_level": zone.level,

            "subscription_type": subscription_type,

            "start_date": subscription.start_date,
            "end_date": subscription.end_date,

            "is_active": subscription.is_active,
            "is_expired": is_expired,
        }


    def get_payment(self, obj):

        return {
            "amount": str(obj.amount),
            "method": "subscription"
        }
        
        
class ZoneSerializer(serializers.ModelSerializer):
    """Read/list representation of a Zone, including subscription prices."""

    class Meta:
        model = Zone
        fields = [
            'zone_id',
            'name',
            'level',
            'description',
            'daily_price',
            'weekly_price',
            'monthly_price',
        ]
        read_only_fields = ['zone_id']


class ZoneCreateUpdateSerializer(serializers.ModelSerializer):
    """Admin create/update of a Zone and its subscription prices."""

    daily_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0"))
    weekly_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0"))
    monthly_price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal("0"))

    class Meta:
        model = Zone
        fields = [
            'zone_id',
            'name',
            'level',
            'description',
            'daily_price',
            'weekly_price',
            'monthly_price',
        ]
        read_only_fields = ['zone_id']


class ZoneSubscriptionCreateSerializer(serializers.Serializer):

    qr_token = serializers.CharField()

    zone_id = serializers.IntegerField()

    subscription_type = serializers.ChoiceField(
        choices=[
            "daily",
            "weekly",
            "monthly",
        ]
    )


class PassengerCardSubscriptionDetailSerializer(serializers.ModelSerializer):
    """
    Full subscription detail used by AdminPassengerCardView to embed
    a card's zone subscriptions (including the best-effort inferred
    subscription_type, derived from the matching SubscriptionTransaction).
    """

    zone_id = serializers.IntegerField(source='zone.zone_id', read_only=True)
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    zone_level = serializers.IntegerField(source='zone.level', read_only=True)
    subscription_type = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = ZoneSubscription
        fields = [
            'subscription_id',
            'zone_id',
            'zone_name',
            'zone_level',
            'subscription_type',
            'start_date',
            'end_date',
            'is_active',
            'is_expired',
        ]
        read_only_fields = fields

    _DURATION_TO_TYPE = {1: 'daily', 7: 'weekly', 30: 'monthly'}

    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.end_date < timezone.now()

    def get_subscription_type(self, obj):
        """
        ZoneSubscription itself has no subscription_type field — it is
        inferred from the most recent SubscriptionTransaction for the
        same card/zone. Returns None if no matching purchase is found
        (e.g. the subscription predates the transaction record).
        """
        latest_tx = (
            SubscriptionTransaction.objects
            .filter(card_id=obj.card_id, zone_id=obj.zone_id)
            .order_by('-created_at')
            .first()
        )
        if latest_tx is None:
            return None
        return self._DURATION_TO_TYPE.get(latest_tx.duration_days)


class ZoneSubscriptionSerializer(serializers.ModelSerializer):

    zone_id = serializers.IntegerField(source='zone.zone_id', read_only=True)
    zone_name = serializers.CharField(
        source='zone.name',
        read_only=True
    )
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = ZoneSubscription
        fields = [
            'subscription_id',
            'card_id',
            'zone_id',
            'zone_name',
            'start_date',
            'end_date',
            'is_active',
            'is_expired',
        ]
        read_only_fields = fields

    def get_is_expired(self, obj):
        from django.utils import timezone
        return obj.end_date < timezone.now()
class SubscriptionTransactionSerializer(serializers.ModelSerializer):

    merchant_name = serializers.CharField(
        source='merchant.full_name',
        read_only=True
    )

    card_number = serializers.CharField(
        source='card.card_number',
        read_only=True
    )

    zone_name = serializers.CharField(
        source='zone.name',
        read_only=True
    )


    class Meta:
        model = SubscriptionTransaction

        fields = [
            'transaction_id',
            'card_id',
            'card_number',
            'merchant_id',
            'merchant_name',
            'zone_id',
            'zone_name',
            'amount',
            'duration_days',
            'payment_method',
            'created_at',
        ]

        read_only_fields = fields