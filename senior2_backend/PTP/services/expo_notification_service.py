import requests


class ExpoNotificationService:

    EXPO_URL = "https://exp.host/--/api/v2/push/send"

    @staticmethod
    def send_push_notification(token, title, body, data=None):
        payload = {
            "to": token,
            "title": title,
            "body": body,
            "sound": "default",
            "data": data or {},
        }

        response = requests.post(ExpoNotificationService.EXPO_URL, json=payload)

        return response.json()