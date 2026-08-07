"""
Payment Views
=============

Endpoints by role:

ADMIN
  POST   /api/payment/cards/                          — create card for passenger
  GET    /api/payment/cards/                          — list all cards
  GET    /api/payment/cards/<card_id>/                — card detail
  PATCH  /api/payment/cards/<card_id>/status/         — activate / block card
  POST   /api/payment/devices/                        — register scanner device
  GET    /api/payment/devices/                        — list devices
  GET    /api/payment/transactions/                   — all boarding/payment transactions
  GET    /api/payment/subscription-transactions/      — all subscription sales
  GET    /api/payment/zones/                          — list zones (with prices)
  POST   /api/payment/zones/                          — create a zone
  PATCH  /api/payment/zones/<zone_id>/                — update a zone's prices/level

MERCHANT
  POST   /api/payment/topup/                          — recharge card by QR token
  GET    /api/payment/topup/history/                  — merchant's recharge history
  GET    /api/payment/cards/lookup/?token=...          — look up card info by QR token
  POST   /api/payment/zone-subscription/               — sell/extend a zone subscription

SCANNER DEVICE (bus terminal)
  POST   /api/payment/scan/                            — scan QR, validate zone subscription

PASSENGER
  GET    /api/payment/my-card/                         — own card info + balance
  GET    /api/payment/my-card/transactions/             — own boarding history
  GET    /api/payment/my-card/subscriptions/            — own active/past zone subscriptions
  GET    /api/payment/my-card/subscription-transactions/ — own subscription purchase history
"""


from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.utils import timezone

from PTP.models.zone import Zone
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiResponse,
)


from PTP.authentication_device import ScannerDeviceAuthentication
from PTP.models.payment_transaction import PaymentTransaction
from PTP.models.scanner_device import ScannerDevice
from PTP.models.top_up_transaction import TopUpTransaction
from PTP.models.transport_card import TransportCard
from PTP.models.vehicle import Vehicle
from PTP.models.subscription_transaction import SubscriptionTransaction
from PTP.models.zone_subscription import ZoneSubscription
from PTP.serializers.payment_serializers import (
    CardScanSerializer,
    PaymentTransactionSerializer,
    TopUpSerializer,
    TopUpTransactionSerializer,
    TransportCardCreateSerializer,
    TransportCardSerializer,
    TransportCardStatusSerializer,
    ZoneSubscriptionCreateSerializer,
    ZoneSubscriptionSerializer,
    SubscriptionTransactionSerializer,
    ZoneSerializer,
    ZoneCreateUpdateSerializer,
    PassengerCardSubscriptionDetailSerializer,
)
from PTP.services.payment_service import PaymentService

User = get_user_model()


# ── Mixins ────────────────────────────────────────────────────────────────────

class AdminRequiredMixin:
    def _check_admin(self, request):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        return None


class MerchantRequiredMixin:
    def _check_merchant(self, request):
        if not getattr(request.user, 'is_merchant', False):
            return Response({'detail': 'Merchant access required.'}, status=status.HTTP_403_FORBIDDEN)
        return None


# ── Admin: Transport Card Management ─────────────────────────────────────────

class AdminTransportCardListCreateView(AdminRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Admin'],
        summary='List all transport cards',
        description='Admin endpoint to retrieve all transport cards.',
        responses=TransportCardSerializer(many=True),
    )
    def get(self, request):
        err = self._check_admin(request)
        if err:
            return err

        cards = TransportCard.objects.select_related(
            'owner'
        ).order_by('-created_at')

        return Response(
            TransportCardSerializer(cards, many=True).data
        )

    @extend_schema(
        tags=['Payment - Admin'],
        summary='Create transport card',
        description=(
            'Admin creates a transport card for a passenger. '
            'Each passenger can have only one transport card.'
        ),
        request=TransportCardCreateSerializer,
        responses={
            201: TransportCardSerializer,
            400: OpenApiResponse(
                description='Invalid passenger or passenger already has a card.'
            ),
            404: OpenApiResponse(
                description='User not found.'
            ),
        },
    )
    def post(self, request):
        err = self._check_admin(request)
        if err:
            return err

        serializer = TransportCardCreateSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        owner_id = serializer.validated_data['owner_id']

        try:
            owner = User.objects.get(pk=owner_id)
        except User.DoesNotExist:
            return Response(
                {'owner_id': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if owner.is_admin or owner.is_merchant:
            return Response(
                {
                    'owner_id':
                    'Cards can only be issued to passengers.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if hasattr(owner, 'transport_card'):
            return Response(
                {
                    'owner_id':
                    'This passenger already has a transport card.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        card = TransportCard.objects.create(
            owner=owner
        )

        return Response(
            TransportCardSerializer(card).data,
            status=status.HTTP_201_CREATED
        )

class AdminTransportCardDetailView(AdminRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Admin'],
        summary='Get transport card details',
        description='Admin retrieves detailed information about a specific transport card.',
        responses={
            200: TransportCardSerializer,
            404: OpenApiResponse(
                description='Card not found.'
            ),
        },
    )
    def get(self, request, card_id):
        err = self._check_admin(request)

        if err:
            return err

        try:
            card = TransportCard.objects.select_related(
                'owner'
            ).get(pk=card_id)

        except TransportCard.DoesNotExist:
            return Response(
                {
                    'detail': 'Card not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            TransportCardSerializer(card).data
        )



class AdminTransportCardStatusView(AdminRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Admin'],
        summary='Update transport card status',
        description='Activate, deactivate, or block a transport card.',
        request=TransportCardStatusSerializer,
        responses={
            200: OpenApiResponse(
                description='Card status updated successfully.'
            ),
            400: OpenApiResponse(
                description='Invalid status.'
            ),
            404: OpenApiResponse(
                description='Card not found.'
            ),
        },
    )
    def patch(self, request, card_id):
        err = self._check_admin(request)
        if err:
            return err

        try:
            card = TransportCard.objects.get(pk=card_id)
        except TransportCard.DoesNotExist:
            return Response(
                {'detail': 'Card not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TransportCardStatusSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        card.status = serializer.validated_data['status']
        card.save(update_fields=['status', 'updated_at'])

        return Response({
            'detail': f'Card status updated to {card.status}.',
            'card': TransportCardSerializer(card).data,
        })


# ── Admin: Scanner Device Management ─────────────────────────────────────────

class AdminScannerDeviceListCreateView(AdminRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        err = self._check_admin(request)

        if err:
            return err

        devices = ScannerDevice.objects.select_related(
            'vehicle'
        ).order_by('-created_at')

        data = [
            {
                'device_id': d.device_id,
                'device_code': d.device_code,
                'vehicle_id': d.vehicle_id,
                'vehicle_number': d.vehicle.vehicle_number,
                'secret_key': d.secret_key,
                'status': d.status,
                'created_at': d.created_at,
            }
            for d in devices
        ]

        return Response(data)

    @extend_schema(
        tags=['Payment - Admin'],
        summary='Register scanner device',
        description=(
            'Admin registers a payment scanner device and assigns it to a vehicle.'
        ),
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'device_code': {
                        'type': 'string',
                        'example': 'BUS-SCANNER-001',
                    },
                    'vehicle_id': {
                        'type': 'integer',
                        'example': 1,
                    },
                },
                'required': [
                    'device_code',
                    'vehicle_id',
                ],
            }
        },
        responses={
            201: OpenApiResponse(
                description='Scanner device registered successfully.'
            ),
            400: OpenApiResponse(
                description='Invalid data or device already exists.'
            ),
            404: OpenApiResponse(
                description='Vehicle not found.'
            ),
        },
    )
    def post(self, request):
        err = self._check_admin(request)

        if err:
            return err

        device_code = request.data.get('device_code', '').strip()
        vehicle_id = request.data.get('vehicle_id')

        if not device_code or not vehicle_id:
            return Response(
                {
                    'detail': 'device_code and vehicle_id are required.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ScannerDevice.objects.filter(
            device_code=device_code
        ).exists():
            return Response(
                {
                    'device_code':
                    'A device with this code already exists.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            vehicle = Vehicle.objects.get(pk=vehicle_id)

        except Vehicle.DoesNotExist:
            return Response(
                {
                    'vehicle_id': 'Vehicle not found.'
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if hasattr(vehicle, 'scanner_device'):
            return Response(
                {
                    'vehicle_id':
                    'This vehicle already has a scanner device.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        device = ScannerDevice.objects.create(
            device_code=device_code,
            vehicle=vehicle
        )

        return Response(
            {
                'device_id': device.device_id,
                'device_code': device.device_code,
                'vehicle_id': device.vehicle_id,
                'secret_key': device.secret_key,
                'status': device.status,
                'created_at': device.created_at,
                'detail':
                'Scanner device registered. Save the secret_key — it is shown only once.',
            },
            status=status.HTTP_201_CREATED,
        )

# ── Admin: Zone Management ────────────────────────────────────────────────────

class AdminZoneListCreateView(AdminRequiredMixin, MerchantRequiredMixin, APIView):
    """
    GET  /api/payment/zones/   — list all zones (with subscription prices)
                                  Allowed for: Admin, Merchant
                                  (merchants need this to pick a zone when
                                  selling a subscription)
    POST /api/payment/zones/   — create a zone
                                  Allowed for: Admin only

    Zones must exist (with daily/weekly/monthly prices set) before routes
    can be assigned to them and before merchants can sell subscriptions.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Admin', 'Payment - Merchant'],
        summary='List all zones',
        description='Accessible by Admin and Merchant users. Merchants use this to choose a zone when selling a subscription.',
        responses=ZoneSerializer(many=True),
    )
    def get(self, request):
        if not (request.user.is_admin or getattr(request.user, 'is_merchant', False)):
            return Response(
                {'detail': 'Admin or Merchant access required.'},
                status=status.HTTP_403_FORBIDDEN
            )

        zones = Zone.objects.all().order_by('level', 'name')
        return Response(ZoneSerializer(zones, many=True).data)

    @extend_schema(
        tags=['Payment - Admin'],
        summary='Create a zone',
        request=ZoneCreateUpdateSerializer,
        responses={
            201: ZoneSerializer,
            400: OpenApiResponse(description='Invalid data or zone already exists.'),
        },
    )
    def post(self, request):
        err = self._check_admin(request)
        if err:
            return err

        serializer = ZoneCreateUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        zone = serializer.save()
        return Response(
            ZoneSerializer(zone).data,
            status=status.HTTP_201_CREATED
        )


class AdminZoneDetailView(AdminRequiredMixin, APIView):
    """
    PATCH /api/payment/zones/<zone_id>/   — update a zone's level/prices/description
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Admin'],
        summary='Update a zone',
        request=ZoneCreateUpdateSerializer,
        responses={
            200: ZoneSerializer,
            400: OpenApiResponse(description='Invalid data.'),
            404: OpenApiResponse(description='Zone not found.'),
        },
    )
    def patch(self, request, zone_id):
        err = self._check_admin(request)
        if err:
            return err

        try:
            zone = Zone.objects.get(pk=zone_id)
        except Zone.DoesNotExist:
            return Response({'detail': 'Zone not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ZoneCreateUpdateSerializer(zone, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        zone = serializer.save()
        return Response(ZoneSerializer(zone).data)


# ── Admin: All Transactions ───────────────────────────────────────────────────

class AdminPaymentTransactionListView(AdminRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    @extend_schema(
        tags=['Payment - Admin'],
        summary='List all payment transactions',
        description='Admin retrieves all payment transactions made using transport cards.',
        responses=PaymentTransactionSerializer(many=True),
    )

    def get(self, request):
        err = self._check_admin(request)
        if err:
            return err
        txs = PaymentTransaction.objects.select_related(
            'card__owner', 'device', 'trip', 'route'
        ).order_by('-created_at')
        return Response(PaymentTransactionSerializer(txs, many=True).data)


class AdminSubscriptionTransactionListView(AdminRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Admin'],
        summary='List all zone subscription sales',
        description='Admin retrieves every zone subscription purchase made by any merchant.',
        responses=SubscriptionTransactionSerializer(many=True),
    )
    def get(self, request):
        err = self._check_admin(request)
        if err:
            return err
        txs = SubscriptionTransaction.objects.select_related(
            'card__owner', 'merchant', 'zone'
        ).order_by('-created_at')
        return Response(SubscriptionTransactionSerializer(txs, many=True).data)


class AdminPassengerCardView(AdminRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, passenger_id):
        err = self._check_admin(request)

        if err:
            return err

        try:
            passenger = User.objects.get(pk=passenger_id)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Passenger not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if passenger.is_admin or passenger.is_merchant:
            return Response(
                {'detail': 'This user is not a passenger.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            card = TransportCard.objects.get(owner=passenger)
        except TransportCard.DoesNotExist:
            return Response(
                {'detail': 'This passenger does not have a transport card.'},
                status=status.HTTP_404_NOT_FOUND
            )

        card_data = TransportCardSerializer(card).data

        subscriptions = (
            card.zone_subscriptions
            .select_related('zone')
            .order_by('-end_date')
        )
        card_data['subscriptions'] = PassengerCardSubscriptionDetailSerializer(
            subscriptions, many=True
        ).data

        return Response({
            'passenger': {
                'id': passenger.id,
                'full_name': passenger.full_name,
                'email': passenger.email,
            },
            'card': card_data,
        })


# ── Merchant: Card Lookup + Top-Up ───────────────────────────────────────────

class MerchantCardLookupView(MerchantRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Merchant'],
        summary='Lookup transport card',
        description='Retrieve card information using the QR token, including its zone subscriptions.',
        parameters=[
            OpenApiParameter(
                name='token',
                type=str,
                location=OpenApiParameter.QUERY,
                required=True,
                description='QR token printed/encoded on the passenger card.',
            ),
        ],
        responses=TransportCardSerializer,
    )
    def get(self, request):
        err = self._check_merchant(request)
        if err:
            return err

        token = request.query_params.get('token', '').strip()
        if not token:
            return Response({'detail': 'token query parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            card = TransportCard.objects.select_related('owner').get(qr_token=token)
        except TransportCard.DoesNotExist:
            return Response({'detail': 'Card not found.'}, status=status.HTTP_404_NOT_FOUND)

        card_data = TransportCardSerializer(card).data

        subscriptions = (
            card.zone_subscriptions
            .select_related('zone')
            .order_by('-end_date')
        )
        card_data['subscriptions'] = PassengerCardSubscriptionDetailSerializer(
            subscriptions, many=True
        ).data

        return Response(card_data)


class MerchantTopUpView(MerchantRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Merchant'],
        summary='Recharge transport card',
        description='Merchant adds balance to a passenger transport card.',
        request=TopUpSerializer,
        responses={
            200: OpenApiResponse(
                description='Card successfully recharged.'
            ),
            400: OpenApiResponse(
                description='Invalid amount or blocked card.'
            ),
            404: OpenApiResponse(
                description='Card not found.'
            ),
        },
    )
    def post(self, request):
        err = self._check_merchant(request)
        if err:
            return err

        serializer = TopUpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        qr_token = serializer.validated_data['qr_token']
        amount = serializer.validated_data['amount']

        try:
            card = TransportCard.objects.select_related('owner').get(qr_token=qr_token)
        except TransportCard.DoesNotExist:
            return Response({'detail': 'Card not found — invalid QR token.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            tx = PaymentService.top_up(card=card, merchant=request.user, amount=amount)
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'detail': 'Card recharged successfully.',
            'transaction': TopUpTransactionSerializer(tx).data,
            'card': TransportCardSerializer(card).data,
        }, status=status.HTTP_200_OK)


class MerchantTopUpHistoryView(MerchantRequiredMixin, APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Merchant'],
        summary='Get merchant top-up history',
        description='Returns all card recharge transactions performed by the authenticated merchant.',
        responses=TopUpTransactionSerializer(many=True),
    )
    def get(self, request):
        err = self._check_merchant(request)

        if err:
            return err

        txs = TopUpTransaction.objects.filter(
            merchant=request.user
        ).select_related(
            'card__owner'
        ).order_by('-created_at')

        return Response(
            TopUpTransactionSerializer(txs, many=True).data
        )
        
class MerchantZoneSubscriptionView(MerchantRequiredMixin, APIView):
    """
    Merchant sells (or extends) a zone subscription for a passenger card.
    All business logic lives in PaymentService.purchase_subscription();
    this view only validates the request shape and translates service
    exceptions into HTTP responses.
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Merchant'],
        summary='Sell / extend a zone subscription',
        description=(
            'Merchant sells a Daily, Weekly, or Monthly zone subscription '
            'to a passenger, paid in cash. If the card already holds an '
            'unexpired subscription for the same zone, it is extended; '
            'otherwise a new subscription is created.'
        ),
        request=ZoneSubscriptionCreateSerializer,
        responses={
            201: OpenApiResponse(description='Subscription created/extended successfully.'),
            400: OpenApiResponse(description='Invalid input, blocked card, or zone has no price configured.'),
            404: OpenApiResponse(description='Card or zone not found.'),
        },
    )
    def post(self, request):

        err = self._check_merchant(request)
        if err:
            return err

        serializer = ZoneSubscriptionCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = PaymentService.purchase_subscription(
                card_qr_token=serializer.validated_data['qr_token'],
                zone_id=serializer.validated_data['zone_id'],
                subscription_type=serializer.validated_data['subscription_type'],
                merchant=request.user,
            )
        except LookupError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "detail": "Subscription created successfully.",
                "subscription": ZoneSubscriptionSerializer(
                    result["subscription"]
                ).data,
                "payment": SubscriptionTransactionSerializer(
                    result["transaction"]
                ).data,
            },
            status=status.HTTP_201_CREATED
        )


# ── Bus Terminal: Card Scan ───────────────────────────────────────────────────

class BusCardScanView(APIView):
    """
    Called by the bus payment terminal hardware.

    Verifies the passenger's zone subscription instead of deducting a
    balance: the card must be active, hold a non-expired subscription,
    and that subscription's zone must cover the boarded route's zone.

    Auth: X-Device-Secret header (ScannerDeviceAuthentication)
    request.user → ScannerDevice instance
    """

    authentication_classes = [ScannerDeviceAuthentication]
    permission_classes = [IsAuthenticated]

    # Maps PaymentTransaction status -> HTTP status code returned to the
    # scanner terminal.
    _STATUS_HTTP_MAP = {
        PaymentTransaction.STATUS_SUCCESS: status.HTTP_200_OK,
        PaymentTransaction.STATUS_CARD_INACTIVE: status.HTTP_403_FORBIDDEN,
        PaymentTransaction.STATUS_NO_SUBSCRIPTION: status.HTTP_402_PAYMENT_REQUIRED,
        PaymentTransaction.STATUS_SUBSCRIPTION_EXPIRED: status.HTTP_402_PAYMENT_REQUIRED,
        PaymentTransaction.STATUS_ZONE_NOT_ALLOWED: status.HTTP_403_FORBIDDEN,
        PaymentTransaction.STATUS_FAILED: status.HTTP_400_BAD_REQUEST,
    }

    @extend_schema(
        tags=['Payment - Bus Scanner'],
        summary='Scan passenger card and validate zone subscription',
        description=(
            'The bus scanner sends the QR token of the passenger card. '
            'The system verifies the card is active, resolves the active '
            'trip of the bus, and checks whether the card holds a '
            'non-expired zone subscription covering the route\'s zone. '
            'No balance is deducted — this only grants or denies boarding.'
        ),
        request=CardScanSerializer,
        parameters=[
            OpenApiParameter(
                name='X-Device-Secret',
                type=str,
                location=OpenApiParameter.HEADER,
                required=True,
                description='Secret key of the registered bus scanner device.',
            ),
        ],
        responses={
            200: OpenApiResponse(description='Subscription accepted. Trip access granted.'),
            402: OpenApiResponse(description='No active / expired zone subscription.'),
            403: OpenApiResponse(description='Card inactive/blocked, or subscription zone does not cover the route.'),
            400: OpenApiResponse(description='Invalid card, no active trip, or route has no zone assigned.'),
        },
    )
    def post(self, request):
        serializer = CardScanSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        device = request.user

        card_token = serializer.validated_data['card_token']

        result = PaymentService.pay_fare(
            device=device,
            qr_token=card_token
        )

        http_status = self._STATUS_HTTP_MAP.get(
            result['status'],
            status.HTTP_400_BAD_REQUEST
        )

        return Response(
            result,
            status=http_status
        )


# ── Passenger: Own Card ───────────────────────────────────────────────────────

class PassengerCardView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    @extend_schema(
    tags=['Payment - Passenger'],
    summary='Get my transport card',
    description='Returns the authenticated passenger transport card and current balance.',
    responses=TransportCardSerializer,
)

    def get(self, request):
        try:
            card = TransportCard.objects.select_related('owner').get(owner=request.user)
        except TransportCard.DoesNotExist:
            return Response(
                {'detail': 'You do not have a transport card yet. Contact admin to get one.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(TransportCardSerializer(card).data)


class PassengerCardTransactionHistoryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    @extend_schema(
    tags=['Payment - Passenger'],
    summary='Get my payment transactions',
    description='Returns the authenticated passenger payment history.',
    responses=PaymentTransactionSerializer(many=True),
)

    def get(self, request):
        try:
            card = TransportCard.objects.get(owner=request.user)
        except TransportCard.DoesNotExist:
            return Response({'detail': 'No transport card found.'}, status=status.HTTP_404_NOT_FOUND)

        txs = PaymentTransaction.objects.filter(
            card=card
        ).select_related(
            'route',
            'route__zone',
            'device',
            'trip'
        ).prefetch_related(
            'card__zone_subscriptions'
        ).order_by('-created_at')

        return Response(PaymentTransactionSerializer(txs, many=True).data)


class PassengerSubscriptionsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Passenger'],
        summary='Get my zone subscriptions',
        description='Returns all zone subscriptions (active and expired) held by the authenticated passenger.',
        responses=ZoneSubscriptionSerializer(many=True),
    )
    def get(self, request):
        try:
            card = TransportCard.objects.get(owner=request.user)
        except TransportCard.DoesNotExist:
            return Response({'detail': 'No transport card found.'}, status=status.HTTP_404_NOT_FOUND)

        subscriptions = ZoneSubscription.objects.filter(
            card=card
        ).select_related('zone').order_by('-end_date')

        return Response(ZoneSubscriptionSerializer(subscriptions, many=True).data)


class PassengerSubscriptionTransactionHistoryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Payment - Passenger'],
        summary='Get my subscription purchase history',
        description='Returns all zone subscription purchases (cash payments to merchants) made for the authenticated passenger\'s card.',
        responses=SubscriptionTransactionSerializer(many=True),
    )
    def get(self, request):
        try:
            card = TransportCard.objects.get(owner=request.user)
        except TransportCard.DoesNotExist:
            return Response({'detail': 'No transport card found.'}, status=status.HTTP_404_NOT_FOUND)

        txs = SubscriptionTransaction.objects.filter(
            card=card
        ).select_related('zone', 'merchant').order_by('-created_at')

        return Response(SubscriptionTransactionSerializer(txs, many=True).data)

    # ── Admin: Merchant Management ────────────────────────────────────────────────

class AdminMerchantListCreateView(AdminRequiredMixin, APIView):
    """
    GET  /api/admin/merchants/   — list all merchants
    POST /api/admin/merchants/   — create a merchant account (admin only)
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        err = self._check_admin(request)
        if err:
            return err

        merchants = User.objects.filter(
            role=User.ROLE_MERCHANT
        ).select_related('merchant_profile').order_by('-created_at')

        data = [
            {
                'id': m.id,
                'full_name': m.full_name,
                'email': m.email,
                'phone': m.phone,
                'account_status': m.account_status,
                'address': m.merchant_profile.address if hasattr(m, 'merchant_profile') else '',
                'created_at': m.created_at,
            }
            for m in merchants
        ]
        return Response(data)

    def post(self, request):
        err = self._check_admin(request)
        if err:
            return err

        email = request.data.get('email', '').strip()
        full_name = request.data.get('full_name', '').strip()
        phone = request.data.get('phone', '').strip()
        password = request.data.get('password', '').strip()
        address = request.data.get('address', '').strip()

        errors = {}
        if not email:
            errors['email'] = 'This field is required.'
        if not full_name:
            errors['full_name'] = 'This field is required.'
        if not phone:
            errors['phone'] = 'This field is required.'
        if not password or len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters.'
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response(
                {'email': 'A user with this email already exists.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from PTP.services.account_service import AccountService
        try:
            user = AccountService().register_user(
                email=email,
                full_name=full_name,
                phone=phone,
                password=password,
                account_type='merchant',
                address=address,
            )
        except Exception as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        from rest_framework.authtoken.models import Token
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
                'account_status': user.account_status,
                'address': address,
                'token': token.key,
                'detail': 'Merchant account created successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


class AdminMerchantTransactionHistoryView(AdminRequiredMixin, APIView):
    """
    GET /api/admin/merchants/<merchant_id>/transactions/
    Returns all top-up transactions performed by a specific merchant,
    ordered chronologically (newest first).
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, merchant_id):
        err = self._check_admin(request)
        if err:
            return err

        try:
            merchant = User.objects.get(pk=merchant_id, role=User.ROLE_MERCHANT)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Merchant not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        transactions = TopUpTransaction.objects.filter(
            merchant=merchant
        ).select_related(
            'card__owner',
        ).order_by('-created_at')

        data = [
            {
                'transaction_id': tx.transaction_id,
                'type': 'top_up',
                'card_id': tx.card_id,
                'card_number': tx.card.card_number,
                'passenger_name': tx.card.owner.full_name,
                'passenger_email': tx.card.owner.email,
                'merchant_id': merchant.id,
                'merchant_name': merchant.full_name,
                'amount': str(tx.amount),
                'balance_before': str(tx.balance_before),
                'balance_after': str(tx.balance_after),
                'created_at': tx.created_at,
            }
            for tx in transactions
        ]
        return Response({
            'merchant_id': merchant.id,
            'merchant_name': merchant.full_name,
            'total_transactions': len(data),
            'transactions': data,
        })