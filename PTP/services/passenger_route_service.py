import math
from decimal import Decimal

from django.conf import settings

from PTP.models import DriverTrip, Route


class PassengerRouteService:
    def __init__(self):
        self.match_threshold_meters = getattr(settings, 'PASSENGER_ROUTE_MATCH_THRESHOLD_METERS', 500)

    def find_available_routes(self, start, destination):
        routes = Route.objects.filter(is_active=True).prefetch_related('route_stops__stop').order_by('route_id')
        matches = []

        for route in routes:
            coordinates = self._get_route_coordinates(route)
            if len(coordinates) < 2:
                continue

            start_match = self._nearest_point_on_route(start['latitude'], start['longitude'], coordinates)
            destination_match = self._nearest_point_on_route(destination['latitude'], destination['longitude'], coordinates)

            if start_match['distance_meters'] > self.match_threshold_meters:
                continue
            if destination_match['distance_meters'] > self.match_threshold_meters:
                continue
            if start_match['distance_along_route_meters'] >= destination_match['distance_along_route_meters']:
                continue

            available_buses = self.available_buses_for_route(route, start_match)
            if not available_buses:
                continue

            matches.append(self._route_match_data(route, start_match, destination_match, available_buses))

        return sorted(
            matches,
            key=lambda item: (
                item['boarding_distance_meters'] + item['alighting_distance_meters'],
                item['route_distance_meters'],
            ),
        )

    def route_details(self, route):
        return {
            'route_id': route.route_id,
            'route_name': route.route_name,
            'price': route.price,
            'distance_meters': self._path_value(route, 'distance_meters'),
            'duration_seconds': self._path_value(route, 'duration_seconds'),
            'stops': [
                {
                    'stop_id': route_stop.stop.stop_id,
                    'name': route_stop.stop.name,
                    'latitude': str(route_stop.stop.latitude),
                    'longitude': str(route_stop.stop.longitude),
                    'order': route_stop.stop_order,
                }
                for route_stop in route.route_stops.select_related('stop').order_by('stop_order')
            ],
            'path': route.path,
        }

    def route_tracking(self, route, boarding_match=None):
        trips = DriverTrip.objects.filter(
            route=route,
            status='active',
            vehicle__is_full=False,
        ).select_related('driver', 'vehicle')
        active_buses = []
        for trip in trips:
            latest_location = trip.locations.order_by('-recorded_at').first()
            if latest_location is None:
                continue

            bus_match = None
            if boarding_match is not None:
                coordinates = self._get_route_coordinates(route)
                bus_match = self._nearest_point_on_route(latest_location.latitude, latest_location.longitude, coordinates)
                if bus_match['distance_along_route_meters'] > boarding_match['distance_along_route_meters']:
                    continue

            active_buses.append(
                {
                    'trip_id': trip.trip_id,
                    'driver_id': trip.driver_id,
                    'driver_name': trip.driver.full_name,
                    'vehicle_id': trip.vehicle_id,
                    'vehicle_number': trip.vehicle.vehicle_number,
                    'is_full': trip.vehicle.is_full,
                    'started_at': trip.started_at,
                    'distance_before_boarding_meters': (
                        round(boarding_match['distance_along_route_meters'] - bus_match['distance_along_route_meters'], 2)
                        if boarding_match is not None and bus_match is not None
                        else None
                    ),
                    'latest_location': {
                        'latitude': str(latest_location.latitude),
                        'longitude': str(latest_location.longitude),
                        'speed_kmh': str(latest_location.speed_kmh) if latest_location.speed_kmh is not None else None,
                        'heading': str(latest_location.heading) if latest_location.heading is not None else None,
                        'recorded_at': latest_location.recorded_at,
                    },
                }
            )
        return active_buses

    def trip_tracking(self, trip_id):
        trip = DriverTrip.objects.filter(
            pk=trip_id,
            status='active',
            vehicle__is_full=False,
        ).select_related('driver', 'vehicle', 'route').first()
        if trip is None:
            return None

        latest_location = trip.locations.order_by('-recorded_at').first()
        return {
            'trip_id': trip.trip_id,
            'route_id': trip.route_id,
            'route_name': trip.route.route_name,
            'driver_id': trip.driver_id,
            'driver_name': trip.driver.full_name,
            'vehicle_id': trip.vehicle_id,
            'vehicle_number': trip.vehicle.vehicle_number,
            'is_full': trip.vehicle.is_full,
            'started_at': trip.started_at,
            'latest_location': (
                {
                    'latitude': str(latest_location.latitude),
                    'longitude': str(latest_location.longitude),
                    'speed_kmh': str(latest_location.speed_kmh) if latest_location.speed_kmh is not None else None,
                    'heading': str(latest_location.heading) if latest_location.heading is not None else None,
                    'recorded_at': latest_location.recorded_at,
                }
                if latest_location
                else None
            ),
        }

    def available_buses_for_route(self, route, boarding_match):
        return self.route_tracking(route, boarding_match=boarding_match)

    def _route_match_data(self, route, start_match, destination_match, available_buses):
        route_distance = destination_match['distance_along_route_meters'] - start_match['distance_along_route_meters']
        return {
            'route_id': route.route_id,
            'route_name': route.route_name,
            'price': route.price,
            'route_distance_meters': round(route_distance, 2),
            'boarding_distance_meters': round(start_match['distance_meters'], 2),
            'alighting_distance_meters': round(destination_match['distance_meters'], 2),
            'estimated_duration_seconds': self._estimate_segment_duration(route, route_distance),
            'available_buses_count': len(available_buses),
            'available_buses': available_buses,
        }

    def _estimate_segment_duration(self, route, route_distance):
        total_distance = self._path_value(route, 'distance_meters')
        total_duration = self._path_value(route, 'duration_seconds')
        if not total_distance or not total_duration:
            return None
        return round(float(total_duration) * (route_distance / float(total_distance)), 2)

    def _path_value(self, route, key):
        path = route.path if isinstance(route.path, dict) else {}
        return path.get(key)

    def _get_route_coordinates(self, route):
        path = route.path if isinstance(route.path, dict) else {}
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

    def _nearest_point_on_route(self, latitude, longitude, coordinates):
        target_latitude = float(Decimal(str(latitude)))
        target_longitude = float(Decimal(str(longitude)))
        distance_along = 0
        best_match = {
            'distance_meters': float('inf'),
            'distance_along_route_meters': 0,
        }

        for start, end in zip(coordinates, coordinates[1:]):
            segment_length = self._haversine_meters(start[0], start[1], end[0], end[1])
            distance_to_segment, projection = self._distance_to_segment_meters(
                target_latitude,
                target_longitude,
                start,
                end,
            )
            if distance_to_segment < best_match['distance_meters']:
                best_match = {
                    'distance_meters': distance_to_segment,
                    'distance_along_route_meters': distance_along + segment_length * projection,
                }
            distance_along += segment_length

        return best_match

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
            return math.dist((point_x, point_y), (start_x, start_y)), 0

        projection = (
            ((point_x - start_x) * segment_x + (point_y - start_y) * segment_y)
            / segment_length_squared
        )
        projection = max(0, min(1, projection))
        closest_x = start_x + projection * segment_x
        closest_y = start_y + projection * segment_y
        return math.dist((point_x, point_y), (closest_x, closest_y)), projection

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
