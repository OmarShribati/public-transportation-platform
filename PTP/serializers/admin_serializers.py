from rest_framework import serializers

from PTP.models import Driver, Route, Stop, User, Vehicle


class AdminAccountCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=50)
    password = serializers.CharField(write_only=True, min_length=8)
    account_type = serializers.ChoiceField(choices=['passenger', 'driver'])
    id_card_image_1 = serializers.FileField(write_only=True, required=False)
    id_card_image_2 = serializers.FileField(write_only=True, required=False)
    license_image = serializers.FileField(write_only=True, required=False)
    has_vehicle = serializers.BooleanField(required=False)
    vehicle_type = serializers.CharField(max_length=100, required=False, allow_blank=True)
    vehicle_number = serializers.CharField(max_length=50, required=False, allow_blank=True)
    route_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        email = attrs.get('email')
        if User.objects.filter(email=email).exists() or Driver.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'A user with this email already exists.'})

        if attrs.get('account_type') == 'passenger':
            driver_only_fields = [
                'id_card_image_1',
                'id_card_image_2',
                'license_image',
                'has_vehicle',
                'vehicle_type',
                'vehicle_number',
                'route_id',
            ]
            for field in driver_only_fields:
                attrs.pop(field, None)
            return attrs

        required_images = ['id_card_image_1', 'id_card_image_2', 'license_image']
        missing_images = [field for field in required_images if not attrs.get(field)]
        if missing_images:
            raise serializers.ValidationError({
                field: 'This image is required for driver creation.'
                for field in missing_images
            })

        if 'has_vehicle' not in self.initial_data:
            raise serializers.ValidationError({
                'has_vehicle': 'This field is required for driver creation.'
            })

        vehicle_type = attrs.get('vehicle_type')
        vehicle_number = attrs.get('vehicle_number')

        if 'vehicle_id' in self.initial_data:
            raise serializers.ValidationError({
                'vehicle_id': 'Admin driver creation must use vehicle_type and vehicle_number, not vehicle_id.'
            })

        missing_vehicle_fields = []
        for field in ['vehicle_type', 'vehicle_number']:
            if not attrs.get(field):
                missing_vehicle_fields.append(field)
        if missing_vehicle_fields:
            raise serializers.ValidationError({
                field: 'This field is required when admin creates a driver.'
                for field in missing_vehicle_fields
            })
        if Vehicle.objects.filter(vehicle_number=vehicle_number).exists():
            raise serializers.ValidationError({
                'vehicle_number': 'A vehicle with this number already exists.'
            })

        if attrs.get('route_id') and not Route.objects.filter(route_id=attrs.get('route_id')).exists():
            raise serializers.ValidationError({'route_id': 'Route does not exist.'})

        return attrs


class AdminAccountUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    full_name = serializers.CharField(max_length=255, required=False)
    phone = serializers.CharField(max_length=50, required=False)
    password = serializers.CharField(write_only=True, min_length=8, required=False)
    account_status = serializers.ChoiceField(choices=['active', 'inactive'], required=False)
    approval_status = serializers.ChoiceField(choices=['pending', 'approved', 'rejected'], required=False)
    vehicle_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_email(self, value):
        account = self.context['account']
        account_type = self.context['account_type']

        user_query = User.objects.filter(email=value)
        driver_query = Driver.objects.filter(email=value)

        if account_type == 'passenger':
            user_query = user_query.exclude(pk=account.pk)
        else:
            driver_query = driver_query.exclude(pk=account.pk)

        if user_query.exists() or driver_query.exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_vehicle_id(self, value):
        if value is None:
            return value
        account = self.context['account']
        try:
            vehicle = Vehicle.objects.get(vehicle_id=value)
        except Vehicle.DoesNotExist:
            raise serializers.ValidationError('Vehicle does not exist.')
        if getattr(account, 'vehicle_id', None) == value:
            return value
        if vehicle.ownership != 'government':
            raise serializers.ValidationError('Only government-owned vehicles can be assigned to another driver.')
        if vehicle.is_active:
            raise serializers.ValidationError('Only inactive government-owned vehicles can be assigned to another driver.')
        return value

    def validate(self, attrs):
        account_type = self.context['account_type']
        if account_type == 'passenger':
            driver_only_fields = ['approval_status', 'vehicle_id']
            for field in driver_only_fields:
                attrs.pop(field, None)
        return attrs


class AdminStopSerializer(serializers.ModelSerializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-90, max_value=90)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-180, max_value=180)

    class Meta:
        model = Stop
        fields = ['stop_id', 'name', 'latitude', 'longitude', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['stop_id', 'created_at', 'updated_at']

    def validate(self, attrs):
        latitude = attrs.get('latitude', getattr(self.instance, 'latitude', None))
        longitude = attrs.get('longitude', getattr(self.instance, 'longitude', None))

        if latitude is None or longitude is None:
            return attrs

        duplicate_stops = Stop.objects.filter(latitude=latitude, longitude=longitude)
        if self.instance is not None:
            duplicate_stops = duplicate_stops.exclude(pk=self.instance.pk)
        if duplicate_stops.exists():
            raise serializers.ValidationError({
                'coordinates': 'A stop with these coordinates already exists.'
            })

        return attrs
