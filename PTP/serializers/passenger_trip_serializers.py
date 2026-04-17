from rest_framework import serializers


class PassengerPointSerializer(serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-90, max_value=90, required=False)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-180, max_value=180, required=False)
    place_name = serializers.CharField(max_length=255, required=False, allow_blank=False)

    def validate(self, attrs):
        has_coordinates = 'latitude' in attrs and 'longitude' in attrs
        has_place_name = bool(attrs.get('place_name'))

        if has_coordinates == has_place_name:
            raise serializers.ValidationError('Send either latitude/longitude or place_name.')

        return attrs


class PassengerTripSearchSerializer(serializers.Serializer):
    start = PassengerPointSerializer()
    destination = PassengerPointSerializer()
