from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from PTP.models import Route, Vehicle
from PTP.serializers import AdminRouteSerializer


class AdminRoutesView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        routes = Route.objects.prefetch_related('route_stops__stop').order_by('route_id')
        serializer = AdminRouteSerializer(routes, many=True)
        return Response({'routes': serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AdminRouteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        route = serializer.save()
        return Response(
            {
                'route': AdminRouteSerializer(route).data,
                'detail': 'Route created successfully.',
            },
            status=status.HTTP_201_CREATED,
        )


class AdminRouteDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, route_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            route = Route.objects.prefetch_related('route_stops__stop').get(pk=route_id)
        except Route.DoesNotExist:
            return Response({'detail': 'Route not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminRouteSerializer(route, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        route = serializer.save()
        return Response(
            {
                'route': AdminRouteSerializer(route).data,
                'detail': 'Route updated successfully.',
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, route_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            route = Route.objects.get(pk=route_id)
        except Route.DoesNotExist:
            return Response({'detail': 'Route not found.'}, status=status.HTTP_404_NOT_FOUND)

        route.is_active = False
        route.save(update_fields=['is_active', 'updated_at'])
        return Response(
            {
                'route': AdminRouteSerializer(route).data,
                'detail': 'Route deactivated successfully.',
            },
            status=status.HTTP_200_OK,
        )


class AdminVehicleRouteAssignmentView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, vehicle_id):
        if not request.user.is_admin:
            return Response({'detail': 'Admin access is required.'}, status=status.HTTP_403_FORBIDDEN)

        route_id = request.data.get('route_id')
        if route_id in (None, ''):
            return Response({'route_id': 'This field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vehicle = Vehicle.objects.get(pk=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response({'detail': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            route = Route.objects.get(pk=route_id, is_active=True)
        except Route.DoesNotExist:
            return Response({'route_id': 'Active route does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        vehicle.route = route
        vehicle.save(update_fields=['route'])

        return Response(
            {
                'vehicle': {
                    'id': vehicle.vehicle_id,
                    'vehicle_type': vehicle.vehicle_type,
                    'vehicle_number': vehicle.vehicle_number,
                    'ownership': vehicle.ownership,
                    'is_active': vehicle.is_active,
                    'route_id': vehicle.route_id,
                },
                'route': AdminRouteSerializer(route).data,
                'detail': 'Route assigned to vehicle successfully.',
            },
            status=status.HTTP_200_OK,
        )
