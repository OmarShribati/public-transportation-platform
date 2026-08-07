from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
 
from PTP.models import DriverToken
 
 
class DriverTokenAuthentication(BaseAuthentication):
    """
    Authenticate a Driver via the DriverToken model.
 
    Header format (same as DRF TokenAuthentication):
        Authorization: Token <key>
 
    Returns (driver, token) on success, None if the header is absent
    or not a driver token (lets the next authentication class try).
    """
 
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
 
        if not auth_header.startswith("Token "):
            return None  # Let other authenticators try
 
        key = auth_header.split(" ", 1)[1].strip()
        if not key:
            return None
 
        try:
            token = DriverToken.objects.select_related("driver").get(key=key)
        except DriverToken.DoesNotExist:
            # Don't raise here — fall through to TokenAuthentication.
            # If BOTH fail, DRF raises 401 automatically.
            return None
 
        driver = token.driver
        if driver.account_status != 'active':
            raise AuthenticationFailed("Driver account is not active.")
 
        return (driver, token)
 
    def authenticate_header(self, request):
        return "Token"