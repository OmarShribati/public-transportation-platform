from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.serializers import PassengerUpdateSerializer


class PassengerProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_admin:
            return Response(
                {'detail': 'Only passenger accounts can view this profile.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(
            {
                'id': request.user.id,
                'email': request.user.email,
                'full_name': request.user.full_name,
                'phone': request.user.phone,
                'account_type': 'passenger',
                'account_status': request.user.account_status,
                'created_at': request.user.created_at,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        if request.user.is_admin:
            return Response(
                {'detail': 'Only passenger accounts can update this profile.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PassengerUpdateSerializer(
            data=request.data,
            context={'user': request.user},
            partial=True,
        )
        if serializer.is_valid():
            user = request.user
            if 'email' in serializer.validated_data:
                user.email = serializer.validated_data['email']
            if 'full_name' in serializer.validated_data:
                user.full_name = serializer.validated_data['full_name']
            if 'phone' in serializer.validated_data:
                user.phone = serializer.validated_data['phone']
            if 'password' in serializer.validated_data:
                user.set_password(serializer.validated_data['password'])
            user.save()
            return Response(
                {
                    'id': user.id,
                    'email': user.email,
                    'full_name': user.full_name,
                    'phone': user.phone,
                    'account_type': 'passenger',
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PassengerDeactivateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.is_admin:
            return Response(
                {'detail': 'Only passenger accounts can be deactivated here.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        request.user.account_status = 'inactive'
        request.user.save()
        Token.objects.filter(user=request.user).delete()
        return Response(
            {
                'id': request.user.id,
                'email': request.user.email,
                'account_status': request.user.account_status,
                'detail': 'Passenger account deactivated successfully.',
            },
            status=status.HTTP_200_OK,
        )