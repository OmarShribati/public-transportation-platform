import requests

from config import API_URL, DEVICE_SECRET


def validate_card(card_token):

    headers = {
        "X-Device-Secret": DEVICE_SECRET
    }

    data = {
        "card_token": card_token
    }

    try:
        response = requests.post(
            API_URL,
            json=data,
            headers=headers,
            timeout=10
        )

        try:
            result = response.json()
        except ValueError:
            result = {
                "message": response.text
            }

        return response.status_code, result

    except requests.RequestException as error:
        return None, {
            "error": str(error)
        }