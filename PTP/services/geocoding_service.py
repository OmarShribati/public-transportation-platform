import json
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings


class GeocodingServiceError(Exception):
    pass


class GeocodingService:
    def __init__(self):
        self.base_url = getattr(settings, 'GEOCODING_BASE_URL', 'https://nominatim.openstreetmap.org/search')
        self.timeout = getattr(settings, 'GEOCODING_TIMEOUT_SECONDS', 10)
        self.user_agent = getattr(settings, 'GEOCODING_USER_AGENT', 'PublicTransportationPlatform/1.0')

    def resolve_point(self, point):
        if 'latitude' in point and 'longitude' in point:
            return {
                'latitude': point['latitude'],
                'longitude': point['longitude'],
                'source': 'coordinates',
                'display_name': None,
            }

        result = self._geocode_place_name(point['place_name'])
        return {
            'latitude': Decimal(str(result['lat'])),
            'longitude': Decimal(str(result['lon'])),
            'source': 'geocoding',
            'display_name': result.get('display_name'),
        }

    def _geocode_place_name(self, place_name):
        query = urlencode({
            'q': f'{place_name}, Damascus, Syria',
            'format': 'jsonv2',
            'limit': 1,
            'countrycodes': 'sy',
            'addressdetails': 0,
        })
        url = f'{self.base_url}?{query}'
        request = Request(url, headers={'User-Agent': self.user_agent})

        try:
            with urlopen(request, timeout=self.timeout) as response:
                payload = json.loads(response.read().decode('utf-8'))
        except HTTPError as exc:
            raise GeocodingServiceError(f'Geocoding returned HTTP {exc.code}.') from exc
        except URLError as exc:
            raise GeocodingServiceError('Could not connect to geocoding service.') from exc
        except TimeoutError as exc:
            raise GeocodingServiceError('Geocoding request timed out.') from exc
        except json.JSONDecodeError as exc:
            raise GeocodingServiceError('Geocoding returned an invalid response.') from exc

        if not payload:
            raise GeocodingServiceError('Could not find this place in Damascus.')

        return payload[0]
