from rest_framework import serializers


class ComplaintCreateSerializer(serializers.Serializer):
    message = serializers.CharField()
    image = serializers.FileField(required=False, allow_null=True)
