from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import DriverToken


class LogoutView(APIView):
    def post(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Token '):
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token_key = auth_header.split(' ', 1)[1].strip()
        if not token_key:
            return Response(
                {'detail': 'Authentication credentials were not provided.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        deleted_user_tokens, _ = Token.objects.filter(key=token_key).delete()
        deleted_driver_tokens, _ = DriverToken.objects.filter(key=token_key).delete()

        if not deleted_user_tokens and not deleted_driver_tokens:
            return Response(
                {'detail': 'Invalid token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(
            {'detail': 'Logged out successfully.'},
            status=status.HTTP_200_OK,
        )
