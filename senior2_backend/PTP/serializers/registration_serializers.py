from rest_framework import serializers

from PTP.models import Driver, Route, User, Vehicle


class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, min_length=8)
    account_type = serializers.ChoiceField(choices=['passenger', 'driver'])
    expo_push_token = serializers.CharField(required=False, allow_blank=True)

    # Driver-only
    id_card_image_1 = serializers.FileField(write_only=True, required=False)
    id_card_image_2 = serializers.FileField(write_only=True, required=False)
    license_image = serializers.FileField(write_only=True, required=False)
    has_vehicle = serializers.BooleanField(required=False)
    vehicle_type = serializers.CharField(max_length=100, required=False, allow_blank=True)
    vehicle_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    route_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        email = attrs.get('email')
        account_type = attrs.get('account_type')

        if User.objects.filter(email=email).exists() or Driver.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'A user with this email already exists.'})

        if account_type == 'driver':
            if 'has_vehicle' not in self.initial_data:
                raise serializers.ValidationError({
                    'has_vehicle': 'This field is required for driver registration.'
                })

            required_images = ['id_card_image_1', 'id_card_image_2', 'license_image']
            missing_images = [f for f in required_images if not attrs.get(f)]
            if missing_images:
                raise serializers.ValidationError({
                    f: 'This image is required for driver registration.'
                    for f in missing_images
                })

            if attrs.get('has_vehicle'):
                missing_vehicle_fields = [
                    f for f in ['vehicle_type', 'vehicle_number'] if not attrs.get(f)
                ]
                if missing_vehicle_fields:
                    raise serializers.ValidationError({
                        f: 'This field is required when has_vehicle is true.'
                        for f in missing_vehicle_fields
                    })
                if Vehicle.objects.filter(vehicle_number=attrs.get('vehicle_number')).exists():
                    raise serializers.ValidationError({
                        'vehicle_number': 'A vehicle with this number already exists.'
                    })
                if attrs.get('route_id') and not Route.objects.filter(
                    route_id=attrs.get('route_id')
                ).exists():
                    raise serializers.ValidationError({'route_id': 'Route does not exist.'})

        else:
            # Passenger — strip driver-only fields
            for field in ['id_card_image_1', 'id_card_image_2', 'license_image',
                          'vehicle_type', 'vehicle_number', 'route_id']:
                attrs.pop(field, None)
            attrs['has_vehicle'] = False

        return attrs