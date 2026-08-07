"""
django_api_client.py
====================
HTTP client that communicates with the Django backend.

On startup, fetches the driver's active trip to resolve vehicle_id
automatically — no hardcoded VEHICLE_ID in config.

Responsibilities:
- fetch_active_trip()  → resolves vehicle_id + trip_id from the backend
- send_count()         → POSTs absolute passenger count to backend
- Retry logic with exponential backoff
- Never crashes the AI service on failure
"""

import logging
import time

import requests

import config

logger = logging.getLogger(__name__)

_HEADERS = {
    "Authorization": f"Token {config.DRIVER_AUTH_TOKEN}",
    "Content-Type": "application/json",
}

_TRIP_STATUS_URL  = f"{config.DJANGO_API_BASE_URL}/api/driver/trip/status"
_COUNT_UPDATE_URL = f"{config.DJANGO_API_BASE_URL}/api/driver/passenger-count/update"


class DjangoAPIClient:
    """
    Communicates with the Django backend.

    Usage:
        client = DjangoAPIClient()

        # Step 1 — resolve vehicle from the driver's active trip
        trip_info = client.fetch_active_trip()
        # trip_info = {"trip_id": 5, "vehicle_id": 2, "route_id": 1, ...}
        # Returns None if no active trip exists.

        # Step 2 — send counts during operation
        client.send_count(12)
    """

    def __init__(self):
        self._session = requests.Session()
        self._session.headers.update(_HEADERS)

    # ── Public API ────────────────────────────────────────────────────────────

    def fetch_active_trip(self) -> dict | None:
        """
        Call GET /api/driver/trip/status and return the active trip dict.

        Returns:
            dict with keys: trip_id, vehicle_id, route_id, status, started_at
            None if there is no active trip or the request fails.
        """
        logger.info("Fetching active trip from backend …")
        try:
            response = self._session.get(_TRIP_STATUS_URL, timeout=10)

            if response.status_code != 200:
                logger.error(
                    "trip/status returned %d: %s",
                    response.status_code, response.text[:200],
                )
                return None

            data = response.json()

            if not data.get("is_tracking_active"):
                logger.warning(
                    "No active trip found. "
                    "Please start a trip from the driver app before running the AI service."
                )
                return None

            trip = data.get("trip")
            if not trip:
                logger.error("trip/status response missing 'trip' key: %s", data)
                return None

            logger.info(
                "Active trip resolved — trip_id=%s  vehicle_id=%s  route_id=%s",
                trip.get("trip_id"),
                trip.get("vehicle_id"),
                trip.get("route_id"),
            )
            return trip

        except requests.ConnectionError:
            logger.error(
                "Cannot connect to Django at %s. Is the server running?",
                config.DJANGO_API_BASE_URL,
            )
            return None
        except requests.Timeout:
            logger.error("trip/status request timed out.")
            return None
        except Exception as exc:
            logger.exception("Unexpected error fetching active trip: %s", exc)
            return None

    def send_count(self, passenger_count: int) -> bool:
        """
        POST the current absolute passenger count to Django.

        Returns True on success, False after all retries fail.
        Never raises.
        """
        payload = {"passenger_count": passenger_count}

        for attempt in range(1, config.API_RETRY_COUNT + 1):
            try:
                response = self._session.post(
                    _COUNT_UPDATE_URL,
                    json=payload,
                    timeout=5,
                )

                if response.status_code == 200:
                    logger.info(
                        "Count sent: %d  (attempt %d)",
                        passenger_count, attempt,
                    )
                    return True

                logger.warning(
                    "API returned %d on attempt %d: %s",
                    response.status_code, attempt, response.text[:200],
                )

            except requests.ConnectionError:
                logger.warning(
                    "Connection error on attempt %d — Django unreachable.", attempt,
                )
            except requests.Timeout:
                logger.warning("Request timed out on attempt %d.", attempt)
            except Exception as exc:
                logger.exception("Unexpected error on attempt %d: %s", attempt, exc)

            if attempt < config.API_RETRY_COUNT:
                backoff = attempt * 0.5
                logger.info("Retrying in %.1fs …", backoff)
                time.sleep(backoff)

        logger.error(
            "Failed to send count %d after %d attempts.",
            passenger_count, config.API_RETRY_COUNT,
        )
        return False

    def close(self):
        self._session.close()