from django.urls import path

from PTP.views.payment_views import (
    # Admin — cards
    AdminPaymentTransactionListView,
    AdminScannerDeviceListCreateView,
    AdminTransportCardDetailView,
    AdminTransportCardListCreateView,
    AdminTransportCardStatusView,
    AdminPassengerCardView,
    # Admin — merchants
    AdminMerchantListCreateView,
    AdminMerchantTransactionHistoryView,
    # Admin — zones & subscriptions
    AdminZoneListCreateView,
    AdminZoneDetailView,
    AdminSubscriptionTransactionListView,
    # Merchant
    MerchantCardLookupView,
    MerchantTopUpHistoryView,
    MerchantTopUpView,
    MerchantZoneSubscriptionView,
    # Bus terminal
    BusCardScanView,
    # Passenger
    PassengerCardTransactionHistoryView,
    PassengerCardView,
    PassengerSubscriptionsView,
    PassengerSubscriptionTransactionHistoryView,
)

urlpatterns = [
    # ── Admin: cards ──────────────────────────────────────────────────────────
    path('cards/', AdminTransportCardListCreateView.as_view(), name='admin-cards'),
    path('cards/lookup/', MerchantCardLookupView.as_view(), name='merchant-card-lookup'),
    path('cards/<int:card_id>/', AdminTransportCardDetailView.as_view(), name='admin-card-detail'),
    path('cards/<int:card_id>/status/', AdminTransportCardStatusView.as_view(), name='admin-card-status'),

    # ── Admin: scanner devices ────────────────────────────────────────────────
    path('devices/', AdminScannerDeviceListCreateView.as_view(), name='admin-devices'),

    # ── Admin: all payment / subscription transactions ───────────────────────
    path('transactions/', AdminPaymentTransactionListView.as_view(), name='admin-transactions'),
    path('subscription-transactions/', AdminSubscriptionTransactionListView.as_view(), name='admin-subscription-transactions'),

    # ── Admin: zone management ────────────────────────────────────────────────
    path('zones/', AdminZoneListCreateView.as_view(), name='admin-zones'),
    path('zones/<int:zone_id>/', AdminZoneDetailView.as_view(), name='admin-zone-detail'),

    # ── Admin: merchant management ────────────────────────────────────────────
    path('merchants/', AdminMerchantListCreateView.as_view(), name='admin-merchants'),
    path('merchants/<int:merchant_id>/transactions/', AdminMerchantTransactionHistoryView.as_view(), name='admin-merchant-transactions'),

    # ── Admin: passenger card details ─────────────────────────────────────────
    path('passengers/<int:passenger_id>/card/', AdminPassengerCardView.as_view(), name='admin-passenger-card'),

    # ── Merchant ──────────────────────────────────────────────────────────────
    path('topup/', MerchantTopUpView.as_view(), name='merchant-topup'),
    path('topup/history/', MerchantTopUpHistoryView.as_view(), name='merchant-topup-history'),
    path('zone-subscription/', MerchantZoneSubscriptionView.as_view(), name='merchant-zone-subscription'),

    # ── Bus terminal ──────────────────────────────────────────────────────────
    path('scan/', BusCardScanView.as_view(), name='bus-card-scan'),

    # ── Passenger ─────────────────────────────────────────────────────────────
    path('my-card/', PassengerCardView.as_view(), name='passenger-card'),
    path('my-card/transactions/', PassengerCardTransactionHistoryView.as_view(), name='passenger-card-transactions'),
    path('my-card/subscriptions/', PassengerSubscriptionsView.as_view(), name='passenger-card-subscriptions'),
    path('my-card/subscription-transactions/', PassengerSubscriptionTransactionHistoryView.as_view(), name='passenger-card-subscription-transactions'),
]
