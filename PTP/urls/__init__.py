from .account_urls import urlpatterns as account_urlpatterns
from .admin_account_urls import urlpatterns as admin_account_urlpatterns
from .admin_route_urls import urlpatterns as admin_route_urlpatterns
from .admin_stop_urls import urlpatterns as admin_stop_urlpatterns
from .admin_vehicle_urls import urlpatterns as admin_vehicle_urlpatterns
from .auth_urls import urlpatterns as auth_urlpatterns
from .driver_urls import urlpatterns as driver_urlpatterns
from .passenger_urls import urlpatterns as passenger_urlpatterns

__all__ = [
    'account_urlpatterns',
    'admin_account_urlpatterns',
    'admin_route_urlpatterns',
    'admin_stop_urlpatterns',
    'admin_vehicle_urlpatterns',
    'auth_urlpatterns',
    'driver_urlpatterns',
    'passenger_urlpatterns',
]
