import json
from decimal import Decimal
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.conf import settings


class RoutePathServiceError(Exception):
    pass


class RoutePathService:
    def __init__(self):
        self.base_url = getattr(settings, 'OSRM_BASE_URL', 'https://router.project-osrm.org')
        self.profile = getattr(settings, 'OSRM_PROFILE', 'driving')
        self.timeout = getattr(settings, 'OSRM_TIMEOUT_SECONDS', 10)
        self.max_snap_distance_meters = getattr(settings, 'OSRM_MAX_SNAP_DISTANCE_METERS', 100)
        self.bounds = getattr(settings, 'DAMASCUS_ROUTE_BOUNDS', {})
        self.polygons = self._load_service_area_polygons()

    def build_path(self, route, stop_ids, stops_by_id):
        waypoints = self._build_waypoints(route, stop_ids, stops_by_id)
        self._validate_waypoints_inside_bounds(waypoints)
        self._validate_waypoints_near_roads(waypoints)
        osrm_route = self._fetch_osrm_route(waypoints)

        return {
            'provider': 'osrm',
            'profile': self.profile,
            'distance_meters': osrm_route['distance'],
            'duration_seconds': osrm_route['duration'],
            'waypoints': waypoints,
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    {
                        'latitude': str(latitude),
                        'longitude': str(longitude),
                    }
                    for longitude, latitude in osrm_route['geometry']['coordinates']
                ],
            },
        }

    def _build_waypoints(self, route, stop_ids, stops_by_id):
        waypoints = [
            {
                'type': 'start',
                'order': 0,
                'latitude': str(route.start_latitude),
                'longitude': str(route.start_longitude),
            }
        ]

        for index, stop_id in enumerate(stop_ids, start=1):
            stop = stops_by_id[stop_id]
            waypoints.append(
                {
                    'type': 'stop',
                    'order': index,
                    'stop_id': stop.stop_id,
                    'name': stop.name,
                    'latitude': str(stop.latitude),
                    'longitude': str(stop.longitude),
                }
            )

        waypoints.append(
            {
                'type': 'end',
                'order': len(stop_ids) + 1,
                'latitude': str(route.end_latitude),
                'longitude': str(route.end_longitude),
            }
        )
        return waypoints

    def _validate_waypoints_inside_bounds(self, waypoints):
        for waypoint in waypoints:
            latitude = Decimal(str(waypoint['latitude']))
            longitude = Decimal(str(waypoint['longitude']))

            if not self._point_inside_bounding_box(latitude, longitude):
                raise RoutePathServiceError(
                    f"{self._waypoint_label(waypoint)} is outside the supported Damascus service area."
                )

            if self.polygons and not self._point_inside_service_area(latitude, longitude):
                raise RoutePathServiceError(
                    f"{self._waypoint_label(waypoint)} is outside the supported Damascus service polygon."
                )

    def _point_inside_bounding_box(self, latitude, longitude):
        min_latitude = self.bounds.get('min_latitude')
        max_latitude = self.bounds.get('max_latitude')
        min_longitude = self.bounds.get('min_longitude')
        max_longitude = self.bounds.get('max_longitude')

        if None in [min_latitude, max_latitude, min_longitude, max_longitude]:
            return True

        return (
            Decimal(str(min_latitude)) <= latitude <= Decimal(str(max_latitude))
            and Decimal(str(min_longitude)) <= longitude <= Decimal(str(max_longitude))
        )

    def _load_service_area_polygons(self):
        geojson_path = getattr(settings, 'DAMASCUS_ROUTE_GEOJSON_PATH', None)
        if geojson_path:
            polygons = self._load_polygons_from_geojson(Path(geojson_path))
            if polygons:
                return polygons

        fallback_polygon = getattr(settings, 'DAMASCUS_ROUTE_POLYGON', [])
        if fallback_polygon:
            return [[fallback_polygon]]
        return []

    def _load_polygons_from_geojson(self, path):
        if not path.exists():
            return []

        with path.open(encoding='utf-8') as geojson_file:
            data = json.load(geojson_file)

        features = data.get('features', []) if data.get('type') == 'FeatureCollection' else [data]
        polygons = []
        for feature in features:
            geometry = feature.get('geometry') or {}
            geometry_type = geometry.get('type')
            coordinates = geometry.get('coordinates') or []
            if geometry_type == 'Polygon':
                polygons.append(coordinates)
            elif geometry_type == 'MultiPolygon':
                polygons.extend(coordinates)
        return polygons

    def _point_inside_service_area(self, latitude, longitude):
        return any(
            self._point_inside_polygon(latitude, longitude, polygon)
            for polygon in self.polygons
        )

    def _point_inside_polygon(self, latitude, longitude, polygon):
        # Ray casting with longitude as x and latitude as y.
        exterior_ring = polygon[0]
        interior_rings = polygon[1:]
        point_x = float(longitude)
        point_y = float(latitude)

        if not self._point_inside_ring(point_x, point_y, exterior_ring):
            return False

        return not any(
            self._point_inside_ring(point_x, point_y, interior_ring)
            for interior_ring in interior_rings
        )

    def _point_inside_ring(self, point_x, point_y, ring):
        inside = False
        vertices = [self._normalize_polygon_vertex(vertex) for vertex in ring]
        previous_x, previous_y = vertices[-1]

        for current_x, current_y in vertices:
            if self._point_on_polygon_edge(point_x, point_y, previous_x, previous_y, current_x, current_y):
                return True

            crosses_ray = (current_y > point_y) != (previous_y > point_y)
            if crosses_ray:
                intersection_x = (
                    (previous_x - current_x)
                    * (point_y - current_y)
                    / (previous_y - current_y)
                    + current_x
                )
                if point_x < intersection_x:
                    inside = not inside

            previous_x, previous_y = current_x, current_y

        return inside

    def _normalize_polygon_vertex(self, vertex):
        if isinstance(vertex, dict):
            return float(vertex['longitude']), float(vertex['latitude'])
        return float(vertex[0]), float(vertex[1])

    def _point_on_polygon_edge(self, point_x, point_y, start_x, start_y, end_x, end_y):
        epsilon = 0.0000001
        cross_product = (point_y - start_y) * (end_x - start_x) - (point_x - start_x) * (end_y - start_y)
        if abs(cross_product) > epsilon:
            return False

        return (
            min(start_x, end_x) - epsilon <= point_x <= max(start_x, end_x) + epsilon
            and min(start_y, end_y) - epsilon <= point_y <= max(start_y, end_y) + epsilon
        )

    def _validate_waypoints_near_roads(self, waypoints):
        for waypoint in waypoints:
            nearest = self._fetch_nearest_road(waypoint)
            distance = nearest.get('distance')
            if distance is None:
                raise RoutePathServiceError(
                    f"OSRM did not return road distance for {self._waypoint_label(waypoint)}."
                )
            if distance > self.max_snap_distance_meters:
                raise RoutePathServiceError(
                    f"{self._waypoint_label(waypoint)} is {round(distance, 2)} meters away from the nearest routable road."
                )

            waypoint['nearest_road_distance_meters'] = round(distance, 2)

    def _fetch_nearest_road(self, waypoint):
        coordinate = (
            f"{self._format_coordinate(waypoint['longitude'])},"
            f"{self._format_coordinate(waypoint['latitude'])}"
        )
        query = urlencode({'number': 1})
        url = f"{self.base_url.rstrip('/')}/nearest/v1/{self.profile}/{coordinate}?{query}"

        try:
            with urlopen(url, timeout=self.timeout) as response:
                payload = json.loads(response.read().decode('utf-8'))
        except HTTPError as exc:
            raise RoutePathServiceError(f'OSRM nearest returned HTTP {exc.code}.') from exc
        except URLError as exc:
            raise RoutePathServiceError('Could not connect to OSRM nearest service.') from exc
        except TimeoutError as exc:
            raise RoutePathServiceError('OSRM nearest request timed out.') from exc
        except json.JSONDecodeError as exc:
            raise RoutePathServiceError('OSRM nearest returned an invalid response.') from exc

        if payload.get('code') != 'Ok':
            message = payload.get('message') or payload.get('code') or 'OSRM could not find a nearby road.'
            raise RoutePathServiceError(message)

        waypoints = payload.get('waypoints') or []
        if not waypoints:
            raise RoutePathServiceError(f"OSRM could not find a nearby road for {self._waypoint_label(waypoint)}.")

        return waypoints[0]

    def _fetch_osrm_route(self, waypoints):
        coordinates = ';'.join(
            f"{self._format_coordinate(waypoint['longitude'])},{self._format_coordinate(waypoint['latitude'])}"
            for waypoint in waypoints
        )
        query = urlencode({
            'overview': 'full',
            'geometries': 'geojson',
            'steps': 'false',
        })
        url = f"{self.base_url.rstrip('/')}/route/v1/{self.profile}/{coordinates}?{query}"

        try:
            with urlopen(url, timeout=self.timeout) as response:
                payload = json.loads(response.read().decode('utf-8'))
        except HTTPError as exc:
            raise RoutePathServiceError(f'OSRM returned HTTP {exc.code}.') from exc
        except URLError as exc:
            raise RoutePathServiceError('Could not connect to OSRM.') from exc
        except TimeoutError as exc:
            raise RoutePathServiceError('OSRM request timed out.') from exc
        except json.JSONDecodeError as exc:
            raise RoutePathServiceError('OSRM returned an invalid response.') from exc

        if payload.get('code') != 'Ok':
            message = payload.get('message') or payload.get('code') or 'OSRM could not build a route.'
            raise RoutePathServiceError(message)

        routes = payload.get('routes') or []
        if not routes:
            raise RoutePathServiceError('OSRM did not return any route.')

        route = routes[0]
        geometry = route.get('geometry') or {}
        if geometry.get('type') != 'LineString' or not geometry.get('coordinates'):
            raise RoutePathServiceError('OSRM route geometry is missing.')

        return route

    def _format_coordinate(self, value):
        if isinstance(value, Decimal):
            return format(value, 'f')
        return str(value)

    def _waypoint_label(self, waypoint):
        if waypoint['type'] == 'stop':
            return f"Stop {waypoint.get('stop_id')} ({waypoint.get('name')})"
        return f"{waypoint['type'].title()} point"
