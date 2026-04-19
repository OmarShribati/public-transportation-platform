from django.db import transaction
from rest_framework import serializers

from PTP.models import Driver, Route, RouteStop, Stop, User, Vehicle
from PTP.services import RoutePathService, RoutePathServiceError


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
        if duplicate_stops.filter(is_active=True).exists():
            raise serializers.ValidationError({
                'coordinates': 'An active stop with these coordinates already exists.'
            })

        return attrs

    def create(self, validated_data):
        inactive_stop = Stop.objects.filter(
            latitude=validated_data['latitude'],
            longitude=validated_data['longitude'],
            is_active=False,
        ).first()
        if inactive_stop is not None:
            inactive_stop.name = validated_data['name']
            inactive_stop.is_active = True
            inactive_stop.save(update_fields=['name', 'is_active', 'updated_at'])
            return inactive_stop

        return super().create(validated_data)


class AdminRouteSerializer(serializers.ModelSerializer):
    start_latitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-90, max_value=90)
    start_longitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-180, max_value=180)
    end_latitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-90, max_value=90)
    end_longitude = serializers.DecimalField(max_digits=9, decimal_places=6, min_value=-180, max_value=180)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0)
    stop_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=True,
        allow_empty=False,
    )
    stops = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Route
        fields = [
            'route_id',
            'route_name',
            'start_latitude',
            'start_longitude',
            'end_latitude',
            'end_longitude',
            'price',
            'path',
            'is_active',
            'stop_ids',
            'stops',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['route_id', 'path', 'stops', 'created_at', 'updated_at']

    def get_stops(self, route):
        route_stops = route.route_stops.select_related('stop').order_by('stop_order')
        return [
            {
                'stop_id': route_stop.stop.stop_id,
                'name': route_stop.stop.name,
                'latitude': str(route_stop.stop.latitude),
                'longitude': str(route_stop.stop.longitude),
                'is_active': route_stop.stop.is_active,
                'order': route_stop.stop_order,
            }
            for route_stop in route_stops
        ]

    def validate_stop_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError('Stop ids must not contain duplicates.')

        existing_stop_ids = set(Stop.objects.filter(stop_id__in=value, is_active=True).values_list('stop_id', flat=True))
        missing_stop_ids = [stop_id for stop_id in value if stop_id not in existing_stop_ids]
        if missing_stop_ids:
            raise serializers.ValidationError(f'Active stops not found: {missing_stop_ids}.')

        return value

    def validate_route_name(self, value):
        route_query = Route.objects.filter(route_name=value)
        if self.instance is not None:
            route_query = route_query.exclude(pk=self.instance.pk)
        if route_query.exists():
            raise serializers.ValidationError('A route with this name already exists.')
        return value

    def validate(self, attrs):
        route_identity_fields = {
            'start_latitude',
            'start_longitude',
            'end_latitude',
            'end_longitude',
            'stop_ids',
        }
        if self.instance is not None and not route_identity_fields.intersection(attrs):
            return attrs

        start_latitude = attrs.get('start_latitude', getattr(self.instance, 'start_latitude', None))
        start_longitude = attrs.get('start_longitude', getattr(self.instance, 'start_longitude', None))
        end_latitude = attrs.get('end_latitude', getattr(self.instance, 'end_latitude', None))
        end_longitude = attrs.get('end_longitude', getattr(self.instance, 'end_longitude', None))

        if 'stop_ids' in attrs:
            stop_ids = attrs['stop_ids']
        elif self.instance is not None:
            stop_ids = list(self.instance.route_stops.order_by('stop_order').values_list('stop_id', flat=True))
        else:
            stop_ids = []

        if all(value is not None for value in [start_latitude, start_longitude, end_latitude, end_longitude]) and stop_ids:
            duplicate_routes = Route.objects.filter(
                start_latitude=start_latitude,
                start_longitude=start_longitude,
                end_latitude=end_latitude,
                end_longitude=end_longitude,
            ).prefetch_related('route_stops')
            if self.instance is not None:
                duplicate_routes = duplicate_routes.exclude(pk=self.instance.pk)

            for route in duplicate_routes:
                route_stop_ids = list(route.route_stops.order_by('stop_order').values_list('stop_id', flat=True))
                if route_stop_ids == stop_ids:
                    raise serializers.ValidationError({
                        'route': 'A route with the same start point, end point, and stop order already exists.'
                    })

        return attrs

    def create(self, validated_data):
        stop_ids = validated_data.pop('stop_ids', [])
        with transaction.atomic():
            route = Route.objects.create(**validated_data)
            self._sync_stops_and_path(route, stop_ids)
        return route

    def update(self, instance, validated_data):
        stop_ids = validated_data.pop('stop_ids', None)
        should_sync_path = bool(
            {
                'start_latitude',
                'start_longitude',
                'end_latitude',
                'end_longitude',
            }.intersection(validated_data)
            or stop_ids is not None
        )

        with transaction.atomic():
            for field, value in validated_data.items():
                setattr(instance, field, value)
            instance.save()

            if should_sync_path:
                if stop_ids is None:
                    stop_ids = list(instance.route_stops.order_by('stop_order').values_list('stop_id', flat=True))
                self._sync_stops_and_path(instance, stop_ids)
        return instance

    def _sync_stops_and_path(self, route, stop_ids):
        stops_by_id = {
            stop.stop_id: stop
            for stop in Stop.objects.filter(stop_id__in=stop_ids)
        }
        try:
            route.path = RoutePathService().build_path(route, stop_ids, stops_by_id)
        except RoutePathServiceError as exc:
            raise serializers.ValidationError({'path': str(exc)}) from exc

        RouteStop.objects.filter(route=route).delete()
        route_stops = [
            RouteStop(route=route, stop=stops_by_id[stop_id], stop_order=index)
            for index, stop_id in enumerate(stop_ids, start=1)
        ]
        RouteStop.objects.bulk_create(route_stops)
        route.save(update_fields=['path', 'updated_at'])
