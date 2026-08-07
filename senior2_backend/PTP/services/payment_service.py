"""
Payment Service
===============

Core business logic for Smart Transport Card system.

Operations:
1. top_up()                — merchant adds cash balance to a card (legacy /
                              non-subscription top-ups, e.g. for future use).
2. purchase_subscription()  — merchant sells a Daily/Weekly/Monthly zone
                              subscription to a passenger (cash payment).
3. pay_fare()                — scanner validates the card's zone subscription
                              when a passenger boards a bus. No money is
                              deducted; this only grants or denies boarding.

Subscription logic:
- Passenger buys a zone subscription from a merchant (cash).
- Scanner checks whether ANY of the passenger's currently active
  subscriptions covers the boarded route's zone.
- Every scan attempt (success or failure) is recorded in
  PaymentTransaction for audit purposes.
"""

import logging
from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from PTP.models.driver_trip import DriverTrip
from PTP.models.payment_transaction import PaymentTransaction
from PTP.models.scanner_device import ScannerDevice
from PTP.models.top_up_transaction import TopUpTransaction
from PTP.models.transport_card import TransportCard
from PTP.models.zone import Zone
from PTP.models.zone_subscription import ZoneSubscription
from PTP.models.subscription_transaction import SubscriptionTransaction
from PTP.services.notification_service import NotificationService


logger = logging.getLogger(__name__)


SUBSCRIPTION_DURATIONS = {
    "daily": 1,
    "weekly": 7,
    "monthly": 30,
}


class PaymentService:

    # ==========================================================
    # Merchant Top Up
    # ==========================================================

    @classmethod
    @transaction.atomic
    def top_up(
        cls,
        *,
        card: TransportCard,
        merchant,
        amount: Decimal
    ) -> TopUpTransaction:

        if amount <= 0:
            raise ValueError(
                "Top-up amount must be greater than zero."
            )

        if card.status == TransportCard.STATUS_BLOCKED:
            raise ValueError(
                "This card is blocked and cannot be recharged."
            )

        balance_before = card.balance

        card.balance += amount

        if card.status == TransportCard.STATUS_INACTIVE:
            card.status = TransportCard.STATUS_ACTIVE

        card.save(
            update_fields=[
                'balance',
                'status',
                'updated_at'
            ]
        )

        tx = TopUpTransaction.objects.create(
            card=card,
            merchant=merchant,
            amount=amount,
            balance_before=balance_before,
            balance_after=card.balance,
        )

        logger.info(
            "TopUp card=%s merchant=%s amount=%s",
            card.card_id,
            merchant.id,
            amount,
        )

        return tx

    # ==========================================================
    # Merchant: Sell / Extend a Zone Subscription
    # ==========================================================

    @classmethod
    @transaction.atomic
    def purchase_subscription(
        cls,
        *,
        card_qr_token: str,
        zone_id: int,
        subscription_type: str,
        merchant,
    ) -> dict:
        """
        Sells (or extends) a zone subscription for a passenger card,
        paid in cash to the merchant. Returns a dict with the resulting
        `subscription` and `transaction` model instances.

        Raises ValueError for any business-rule violation, with a
        human-readable message suitable for returning to the client.
        Raises LookupError if the card or zone does not exist.
        """

        if subscription_type not in SUBSCRIPTION_DURATIONS:
            raise ValueError("Invalid subscription type.")

        duration_days = SUBSCRIPTION_DURATIONS[subscription_type]

        try:
            card = (
                TransportCard.objects
                .select_for_update()
                .get(qr_token=card_qr_token)
            )
        except TransportCard.DoesNotExist:
            raise LookupError("Card not found.")

        if card.status == TransportCard.STATUS_BLOCKED:
            raise ValueError(
                "This card is blocked and cannot purchase a subscription."
            )

        try:
            zone = Zone.objects.get(zone_id=zone_id)
        except Zone.DoesNotExist:
            raise LookupError("Zone not found.")

        price_by_type = {
            "daily": zone.daily_price,
            "weekly": zone.weekly_price,
            "monthly": zone.monthly_price,
        }
        amount = price_by_type[subscription_type]

        if amount is None or amount <= 0:
            raise ValueError(
                f"The {zone.name} zone does not have a "
                f"{subscription_type} price configured."
            )

        now = timezone.now()

        # A card issued to a passenger is dormant until first used.
        # Buying a subscription is a legitimate activation event,
        # mirroring top_up()'s behaviour.
        if card.status == TransportCard.STATUS_INACTIVE:
            card.status = TransportCard.STATUS_ACTIVE
            card.save(update_fields=['status', 'updated_at'])

        # ------------------------------------------------------
        # Create / extend the subscription for this exact zone.
        # Existing subscriptions for OTHER zones on the same card
        # are left untouched (a passenger may hold coverage for
        # more than one zone at a time, e.g. while upgrading).
        # ------------------------------------------------------
        subscription = (
            ZoneSubscription.objects
            .select_for_update()
            .filter(card=card, zone=zone, is_active=True)
            .first()
        )

        if subscription:
            if subscription.end_date < now:
                # Expired — restart the subscription window from now.
                subscription.start_date = now
                subscription.end_date = now + timedelta(days=duration_days)
            else:
                # Still active — extend it.
                subscription.end_date += timedelta(days=duration_days)
            subscription.save(update_fields=['start_date', 'end_date'])
        else:
            subscription = ZoneSubscription.objects.create(
                card=card,
                zone=zone,
                start_date=now,
                end_date=now + timedelta(days=duration_days),
                is_active=True,
            )

        subscription_transaction = SubscriptionTransaction.objects.create(
            card=card,
            merchant=merchant,
            zone=zone,
            amount=amount,
            duration_days=duration_days,
            payment_method=SubscriptionTransaction.CASH,
        )

        logger.info(
            "Subscription sold card=%s zone=%s type=%s amount=%s merchant=%s",
            card.card_id,
            zone.name,
            subscription_type,
            amount,
            merchant.id,
        )

        return {
            "subscription": subscription,
            "transaction": subscription_transaction,
        }

    # ==========================================================
    # Subscription Coverage Lookup
    # ==========================================================

    @staticmethod
    def get_covering_subscription(card: TransportCard, route_zone: Zone):
        """
        Returns the best currently-active subscription on `card` that
        covers `route_zone` (i.e. subscription.zone.level >= route_zone.level),
        or None if no active subscription covers it.

        A passenger may hold several concurrent active subscriptions
        (e.g. while upgrading zones); the one with the broadest coverage
        (highest zone level), tie-broken by the latest expiry, is used.
        """
        return (
            card.zone_subscriptions
            .filter(
                is_active=True,
                end_date__gte=timezone.now(),
                zone__level__gte=route_zone.level,
            )
            .select_related('zone')
            .order_by('-zone__level', '-end_date')
            .first()
        )

    # ==========================================================
    # Bus Scanner Payment / Subscription Validation
    # ==========================================================

    @classmethod
    @transaction.atomic
    def pay_fare(
        cls,
        *,
        device: ScannerDevice,
        qr_token: str
    ) -> dict:

        # ------------------------------------------------------
        # 1. Get Card
        # ------------------------------------------------------

        try:
            card = (
                TransportCard.objects
                .select_for_update()
                .get(qr_token=qr_token)
            )
        except TransportCard.DoesNotExist:
            return cls._result(
                status=PaymentTransaction.STATUS_FAILED,
                message="Invalid QR code - card not found."
            )

        # ------------------------------------------------------
        # 2. Validate Card
        # ------------------------------------------------------

        if not card.is_usable:
            cls._log_attempt(
                card=card,
                device=device,
                status=PaymentTransaction.STATUS_CARD_INACTIVE,
            )
            return cls._result(
                status=PaymentTransaction.STATUS_CARD_INACTIVE,
                message=(
                    f"Card is {card.status} "
                    "and cannot be used."
                ),
                card=card,
            )

        # ------------------------------------------------------
        # 3. Get Active Bus Trip
        # ------------------------------------------------------

        trip = (
            DriverTrip.objects
            .select_related('route', 'vehicle')
            .filter(vehicle=device.vehicle, status='active')
            .first()
        )

        if trip is None:
            cls._log_attempt(
                card=card,
                device=device,
                status=PaymentTransaction.STATUS_FAILED,
            )
            return cls._result(
                status=PaymentTransaction.STATUS_FAILED,
                message=(
                    "No active trip found "
                    "for this bus."
                ),
                card=card,
            )

        # ------------------------------------------------------
        # 4. Check Route Zone
        # ------------------------------------------------------

        route_zone = trip.route.zone

        if route_zone is None:
            cls._log_attempt(
                card=card,
                device=device,
                trip=trip,
                status=PaymentTransaction.STATUS_FAILED,
            )
            return cls._result(
                status=PaymentTransaction.STATUS_FAILED,
                message=(
                    "This route has no zone assigned."
                ),
                card=card,
                trip=trip,
            )

        # ------------------------------------------------------
        # 5. Find the Best Covering Active Subscription
        # ------------------------------------------------------

        subscription = cls.get_covering_subscription(card, route_zone)

        if subscription is None:

            # Distinguish "never subscribed" from "subscription expired /
            # wrong zone" for a more useful audit trail and passenger
            # message.
            has_any_active_subscription = card.zone_subscriptions.filter(
                is_active=True,
                end_date__gte=timezone.now(),
            ).exists()

            if has_any_active_subscription:
                fail_status = PaymentTransaction.STATUS_ZONE_NOT_ALLOWED
                message = (
                    "Your active subscription does not cover "
                    f"this route's zone ({route_zone.name})."
                )
            else:
                has_ever_subscribed = card.zone_subscriptions.exists()
                fail_status = (
                    PaymentTransaction.STATUS_SUBSCRIPTION_EXPIRED
                    if has_ever_subscribed
                    else PaymentTransaction.STATUS_NO_SUBSCRIPTION
                )
                message = (
                    "Your zone subscription has expired."
                    if has_ever_subscribed
                    else "No active zone subscription found."
                )

            cls._log_attempt(
                card=card,
                device=device,
                trip=trip,
                status=fail_status,
            )
            return cls._result(
                status=fail_status,
                message=message,
                card=card,
                trip=trip,
            )

        card_zone = subscription.zone

        # ------------------------------------------------------
        # 6. Create Boarding Transaction
        # ------------------------------------------------------

        tx = PaymentTransaction.objects.create(
            card=card,
            device=device,
            trip=trip,
            route=trip.route,
            amount=0,
            balance_before=card.balance,
            balance_after=card.balance,
            status=PaymentTransaction.STATUS_SUCCESS,
        )

        # ------------------------------------------------------
        # 7. Send Notification
        # ------------------------------------------------------

        NotificationService.send_passenger_notification(
            passenger_id=card.owner.id,
            title="Trip access granted",
            body=(
                f"Your {card_zone.name} subscription "
                f"was accepted on "
                f"{trip.route.route_name}."
            ),
        )

        logger.info(
            "Subscription accepted card=%s route=%s transaction=%s",
            card.card_id,
            trip.route.route_name,
            tx.transaction_id,
        )

        return cls._result(
            status=PaymentTransaction.STATUS_SUCCESS,
            message=(
                "Subscription accepted. "
                "Trip access granted."
            ),
            card=card,
            trip=trip,
            transaction_id=tx.transaction_id,
        )

    # ==========================================================
    # Audit Logging Helper (for rejected scan attempts)
    # ==========================================================

    @staticmethod
    def _log_attempt(*, card, device, status, trip=None):
        """
        Persists a PaymentTransaction record for a rejected scan attempt,
        so failed boarding attempts are auditable (e.g. for disputes,
        fraud analysis, or reporting). trip/route may be null when the
        rejection happened before a trip could be resolved.
        """
        PaymentTransaction.objects.create(
            card=card,
            device=device,
            trip=trip,
            route=trip.route if trip else None,
            amount=0,
            balance_before=card.balance,
            balance_after=card.balance,
            status=status,
        )

    # ==========================================================
    # Response Builder
    # ==========================================================

    @staticmethod
    def _result(
        *,
        status: str,
        message: str,
        card: TransportCard = None,
        trip=None,
        transaction_id: int = None,
    ) -> dict:

        result = {
            "status": status,
            "message": message,
        }

        if card is not None:
            result["card"] = {
                "card_id": card.card_id,
                "owner": card.owner.full_name,
                "balance": str(card.balance),
            }

        if trip is not None:
            result["trip"] = {
                "trip_id": trip.trip_id,
                "route_name": trip.route.route_name,
                "vehicle_id": trip.vehicle_id,
                "zone": (
                    trip.route.zone.name
                    if trip.route.zone
                    else None
                ),
            }

        if transaction_id is not None:
            result["transaction_id"] = transaction_id

        return result
