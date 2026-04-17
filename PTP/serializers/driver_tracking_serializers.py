from rest_framework import serializers


class DriverLocationSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-90, max_value=90)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-180, max_value=180)
    speed_kmh = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=0, required=False)
    heading = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=0, max_value=360, required=False)


class DriverVehicleStatusSerializer(serializers.Serializer):
    is_full = serializers.BooleanField()
