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

    def patch(self, request, stop_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            stop = Stop.objects.get(pk=stop_id)
        except Stop.DoesNotExist:
            return Response({'detail': 'Stop not found.'}, status=status.HTTP_404_NOT_FOUND)

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

    def delete(self, request, stop_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            stop = Stop.objects.get(pk=stop_id)
        except Stop.DoesNotExist:
            return Response({'detail': 'Stop not found.'}, status=status.HTTP_404_NOT_FOUND)

        stop.is_active = False
        stop.save(update_fields=['is_active', 'updated_at'])
        return Response(
            {
                'stop': AdminStopSerializer(stop).data,
                'detail': 'Stop deactivated successfully.',
            },
            status=status.HTTP_200_OK,
        )
