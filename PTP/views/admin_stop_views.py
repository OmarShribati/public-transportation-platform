from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import Stop
from PTP.serializers import AdminStopSerializer


class AdminStopsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        stops = Stop.objects.all().order_by('name')
        serializer = AdminStopSerializer(stops, many=True)
        return Response({'stops': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AdminStopSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        stop = serializer.save()
        return Response(
            {
                'stop': AdminStopSerializer(stop).data,
                'detail': 'Stop created successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


class AdminStopDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def _get_stop_or_response(self, stop_id):
        try:
            return Stop.objects.get(pk=stop_id), None
        except Stop.DoesNotExist:
            return None, Response({'detail': 'Stop not found.'}, status=status.HTTP_404_NOT_FOUND)

    def _set_stop_active_status(self, stop, is_active):
        stop.is_active = is_active
        stop.save(update_fields=['is_active', 'updated_at'])
        return Response(
            {
                'stop': AdminStopSerializer(stop).data,
                'detail': f"Stop {'activated' if is_active else 'deactivated'} successfully.",
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, stop_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        stop, error_response = self._get_stop_or_response(stop_id)
        if error_response:
            return error_response

        serializer = AdminStopSerializer(stop, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        stop = serializer.save()
        return Response(
            {
                'stop': AdminStopSerializer(stop).data,
                'detail': 'Stop updated successfully.',
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request, stop_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        action = request.data.get('action')
        if action not in ('activate', 'deactivate'):
            return Response(
                {'detail': 'action must be activate or deactivate.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        stop, error_response = self._get_stop_or_response(stop_id)
        if error_response:
            return error_response

        return self._set_stop_active_status(stop, action == 'activate')
