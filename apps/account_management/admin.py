from django.contrib import admin
from apps.account_management.models.user import User
from apps.account_management.models.driver import Driver, Route, Vehicle


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'phone', 'is_admin', 'account_status', 'created_at')
    list_filter = ('is_admin', 'account_status', 'created_at')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'phone', 'vehicle', 'approval_status', 'created_at')
    list_filter = ('approval_status', 'created_at')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('vehicle_number', 'vehicle_type', 'ownership', 'route', 'is_full', 'created_at')
    list_filter = ('ownership', 'is_full', 'route', 'created_at')
    search_fields = ('vehicle_number', 'vehicle_type')
    ordering = ('-created_at',)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('route_name', 'created_at')
    search_fields = ('route_name',)
    ordering = ('route_name',)
