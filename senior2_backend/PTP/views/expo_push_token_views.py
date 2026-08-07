from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
 
from PTP.authentication import DriverTokenAuthentication   # see note below
from PTP.services.expo_token_service import ExpoTokenService
 
 
class SaveExpoPushTokenView(APIView):
    """
    Upsert endpoint — always authenticated, never anonymous.
    user_id / driver_id is taken from the verified token, NOT from the body.
    """
    authentication_classes = [TokenAuthentication, DriverTokenAuthentication]
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        expo_token = request.data.get("expo_push_token", "").strip()
        user_type = request.data.get("user_type", "").strip()
 
        # --- Validate inputs ---
        errors = {}
        if not expo_token:
            errors["expo_push_token"] = "This field is required."
        if user_type not in ("passenger", "driver"):
            errors["user_type"] = "Must be 'passenger' or 'driver'."
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
 
        # --- Upsert via service ---
        try:
            if user_type == "driver":
                # request.user is the Driver object when DriverTokenAuthentication is used
                driver = request.user
                ExpoTokenService.upsert_driver_token(
                    driver_id=driver.driver_id,
                    token=expo_token,
                )
            else:
                user = request.user
                ExpoTokenService.upsert_passenger_token(
                    user_id=user.id,
                    token=expo_token,
                )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
 
        return Response(
            {"detail": "Expo push token saved successfully."},
            status=status.HTTP_200_OK,
        )