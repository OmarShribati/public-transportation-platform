from rest_framework import serializers

from PTP.models import Driver, User


class PassengerUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    full_name = serializers.CharField(max_length=255, required=False)
    phone = serializers.CharField(max_length=50, required=False)
    password = serializers.CharField(write_only=True, min_length=8, required=False)

    def validate_email(self, value):
        user = self.context['user']
        if User.objects.exclude(pk=user.pk).filter(email=value).exists() or Driver.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value


class DriverUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    full_name = serializers.CharField(max_length=255, required=False)
    phone = serializers.CharField(max_length=50, required=False)
    password = serializers.CharField(write_only=True, min_length=8, required=False)
    id_card_image_1 = serializers.FileField(write_only=True, required=False)
    id_card_image_2 = serializers.FileField(write_only=True, required=False)
    license_image = serializers.FileField(write_only=True, required=False)

    def validate_email(self, value):
        driver = self.context['driver']
        if Driver.objects.exclude(pk=driver.pk).filter(email=value).exists() or User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value