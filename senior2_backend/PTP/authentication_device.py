"""
Scanner Device Authentication
==============================
Authenticates bus payment terminals via a secret key in the request header.

Header:
    X-Device-Secret: <secret_key>

Returns (device, None) on success.
Returns None if header is missing (lets other authenticators try).
Raises AuthenticationFailed if header is present but key is invalid/inactive.

Usage in views:
    authentication_classes = [ScannerDeviceAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        device = request.user   # ScannerDevice instance
"""

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from PTP.models.scanner_device import ScannerDevice


class ScannerDeviceAuthentication(BaseAuthentication):

    HEADER = "X-Device-Secret"

    def authenticate(self, request):
        secret_key = request.headers.get(self.HEADER, "").strip()

        if not secret_key:
            return None  # No device header — let other authenticators try

        try:
            device = ScannerDevice.objects.select_related(
                "vehicle__route"
            ).get(secret_key=secret_key)
        except ScannerDevice.DoesNotExist:
            raise AuthenticationFailed("Invalid device secret key.")

        if not device.is_active:
            raise AuthenticationFailed("Scanner device is inactive.")

        return (device, None)
    
    

    def authenticate_header(self, request):
        return self.HEADER