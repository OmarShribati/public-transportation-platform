from django.contrib import admin
from PTP.models.user import User, MerchantProfile
from PTP.models import (
    Driver, DriverTrip, Route, RouteStop, Stop, Vehicle, VehicleLocation,
    Zone, TransportCard, ZoneSubscription, SubscriptionTransaction,
    PaymentTransaction, TopUpTransaction, ScannerDevice,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'phone', 'is_admin', 'account_status', 'created_at')
    list_filter = ('is_admin', 'account_status', 'created_at')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'phone', 'vehicle', 'approval_status', 'account_status', 'deactivation_requested', 'deactivation_request_status', 'created_at')
    list_filter = ('approval_status', 'account_status', 'deactivation_requested', 'deactivation_request_status', 'created_at')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle_number', 'vehicle_type', 'ownership', 'route', 'is_full', 'is_active', 'created_at')
    list_filter = ('ownership', 'is_full', 'is_active', 'route', 'created_at')
    search_fields = ('vehicle_number', 'vehicle_type')
    ordering = ('-created_at',)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('route_name', 'price', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('route_name',)
    ordering = ('route_name',)


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('name',)
    ordering = ('name',)


@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    list_display = ('route', 'stop', 'stop_order', 'created_at')
    list_filter = ('route', 'created_at')
    search_fields = ('route__route_name', 'stop__name')
    ordering = ('route', 'stop_order')


@admin.register(DriverTrip)
class DriverTripAdmin(admin.ModelAdmin):
    list_display = ('trip_id', 'driver', 'vehicle', 'route', 'status', 'started_at', 'ended_at')
    list_filter = ('status', 'route', 'started_at', 'ended_at')
    search_fields = ('driver__email', 'driver__full_name', 'vehicle__vehicle_number', 'route__route_name')
    ordering = ('-started_at',)


@admin.register(VehicleLocation)
class VehicleLocationAdmin(admin.ModelAdmin):
    list_display = ('location_id', 'trip', 'driver', 'vehicle', 'latitude', 'longitude', 'speed_kmh', 'heading', 'distance_to_route_meters', 'is_off_route', 'recorded_at')
    list_filter = ('vehicle', 'driver', 'is_off_route', 'recorded_at')
    search_fields = ('driver__email', 'driver__full_name', 'vehicle__vehicle_number')
    ordering = ('-recorded_at',)


@admin.register(MerchantProfile)
class MerchantProfileAdmin(admin.ModelAdmin):
    list_display = ('merchant', 'address', 'created_at')
    search_fields = ('merchant__email', 'merchant__full_name', 'address')
    ordering = ('-created_at',)


# ── Zone Subscription System ────────────────────────────────────────────────

@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('zone_id', 'name', 'level', 'daily_price', 'weekly_price', 'monthly_price')
    ordering = ('level', 'name')
    search_fields = ('name',)


@admin.register(TransportCard)
class TransportCardAdmin(admin.ModelAdmin):
    list_display = ('card_id', 'card_number', 'owner', 'balance', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('card_number', 'qr_token', 'owner__email', 'owner__full_name')
    ordering = ('-created_at',)
    raw_id_fields = ('owner',)


@admin.register(ZoneSubscription)
class ZoneSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('subscription_id', 'card', 'zone', 'start_date', 'end_date', 'is_active')
    list_filter = ('zone', 'is_active', 'end_date')
    search_fields = ('card__card_number', 'card__owner__email')
    ordering = ('-end_date',)
    raw_id_fields = ('card',)


@admin.register(SubscriptionTransaction)
class SubscriptionTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'card', 'zone', 'merchant', 'amount', 'duration_days', 'created_at')
    list_filter = ('zone', 'payment_method', 'created_at')
    search_fields = ('card__card_number', 'merchant__email')
    ordering = ('-created_at',)
    raw_id_fields = ('card', 'merchant')


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'card', 'device', 'trip', 'route', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('card__card_number',)
    ordering = ('-created_at',)
    raw_id_fields = ('card', 'device', 'trip', 'route')


@admin.register(TopUpTransaction)
class TopUpTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_id', 'card', 'merchant', 'amount', 'balance_before', 'balance_after', 'created_at')
    search_fields = ('card__card_number', 'merchant__email')
    ordering = ('-created_at',)
    raw_id_fields = ('card', 'merchant')


@admin.register(ScannerDevice)
class ScannerDeviceAdmin(admin.ModelAdmin):
    list_display = ('device_id', 'device_code', 'vehicle', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('device_code', 'vehicle__vehicle_number')
    ordering = ('-created_at',)
