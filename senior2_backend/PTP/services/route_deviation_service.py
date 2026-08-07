import math
from decimal import Decimal

from django.conf import settings


class RouteDeviationService:
    def __init__(self):
        self.threshold_meters = getattr(settings, 'ROUTE_DEVIATION_THRESHOLD_METERS', 150)

    def check_location(self, route, latitude, longitude):
        coordinates = self._get_route_coordinates(route)
        if not coordinates:
            return {
                'distance_to_route_meters': None,
                'is_off_route': False,
                'alert': None,
            }

        distance = self._distance_to_polyline_meters(
            float(Decimal(str(latitude))),
            float(Decimal(str(longitude))),
            coordinates,
        )
        is_off_route = distance > self.threshold_meters

        return {
            'distance_to_route_meters': round(distance, 2),
            'is_off_route': is_off_route,
            'alert': (
                f'You are {round(distance, 2)} meters away from your assigned route.'
                if is_off_route
                else None
            ),
        }

    def _get_route_coordinates(self, route):
        path = route.path or {}
        if not isinstance(path, dict):
            return []

        geometry = path.get('geometry') or {}
        coordinates = geometry.get('coordinates') or []
        return [
            (
                float(Decimal(str(coordinate['latitude']))),
                float(Decimal(str(coordinate['longitude']))),
            )
            for coordinate in coordinates
            if 'latitude' in coordinate and 'longitude' in coordinate
        ]

    def _distance_to_polyline_meters(self, latitude, longitude, coordinates):
        if len(coordinates) == 1:
            return self._haversine_meters(latitude, longitude, coordinates[0][0], coordinates[0][1])

        distances = [
            self._distance_to_segment_meters(latitude, longitude, start, end)
            for start, end in zip(coordinates, coordinates[1:])
        ]
        return min(distances)

    def _distance_to_segment_meters(self, latitude, longitude, start, end):
        lat1, lon1 = start
        lat2, lon2 = end

        origin_latitude = math.radians(latitude)
        meters_per_degree_latitude = 111_320
        meters_per_degree_longitude = 111_320 * math.cos(origin_latitude)

        point_x = longitude * meters_per_degree_longitude
        point_y = latitude * meters_per_degree_latitude
        start_x = lon1 * meters_per_degree_longitude
        start_y = lat1 * meters_per_degree_latitude
        end_x = lon2 * meters_per_degree_longitude
        end_y = lat2 * meters_per_degree_latitude

        segment_x = end_x - start_x
        segment_y = end_y - start_y
        segment_length_squared = segment_x * segment_x + segment_y * segment_y
        if segment_length_squared == 0:
            return math.dist((point_x, point_y), (start_x, start_y))

        projection = (
            ((point_x - start_x) * segment_x + (point_y - start_y) * segment_y)
            / segment_length_squared
        )
        projection = max(0, min(1, projection))

        closest_x = start_x + projection * segment_x
        closest_y = start_y + projection * segment_y
        return math.dist((point_x, point_y), (closest_x, closest_y))

    def _haversine_meters(self, lat1, lon1, lat2, lon2):
        earth_radius_meters = 6_371_000
        delta_latitude = math.radians(lat2 - lat1)
        delta_longitude = math.radians(lon2 - lon1)
        a = (
            math.sin(delta_latitude / 2) ** 2
            + math.cos(math.radians(lat1))
            * math.cos(math.radians(lat2))
            * math.sin(delta_longitude / 2) ** 2
        )
        return earth_radius_meters * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
