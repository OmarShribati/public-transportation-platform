from rest_framework import serializers
 
 
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
 
    # Optional — sent by frontend on every login to refresh the device token.
    # If not provided, login still works normally, push token is just not updated.
    expo_push_token = serializers.CharField(
        required=False,
        allow_blank=True,
        default='',
    )