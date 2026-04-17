from django.contrib import admin
from PTP.models.user import User
from PTP.models import Driver, DriverTrip, Route, RouteStop, Stop, Vehicle, VehicleLocation


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
