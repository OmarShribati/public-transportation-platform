import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';

export const MapComponent = ({ 
  currentLocation, 
  waypoints, 
  mapRef, 
  children,
  onRegionChangeComplete
}: any) => {

  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  const sortedWaypoints = useMemo(() => {
    if (!waypoints || waypoints.length < 2) return [];
    return [...waypoints]
      .map(wp => ({
        ...wp,
        latitude: parseFloat(wp.latitude),
        longitude: parseFloat(wp.longitude),
        order: parseInt(wp.order) || 0
      }))
      .sort((a, b) => a.order - b.order);
  }, [waypoints]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (sortedWaypoints.length < 2) return;
      const coordsString = sortedWaypoints
        .map(wp => `${wp.longitude},${wp.latitude}`)
        .join(';');

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes?.length > 0) {
          const points = data.routes[0].geometry.coordinates.map((c: any) => ({
            latitude: c[1],
            longitude: c[0],
          }));

          setRouteCoords(points);

          setTimeout(() => {
            mapRef.current?.fitToCoordinates(points, {
              edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
              animated: true,
            });
          }, 500);
        }
      } catch (error) {
        console.error("OSRM API Error:", error);
      }
    };

    fetchRoute();
  }, [sortedWaypoints]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={currentLocation}
        
        onRegionChangeComplete={onRegionChangeComplete} // <-- تمرير الدالة هنا
      >
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#10b981"
            strokeWidth={5}
            lineJoin="round"
            zIndex={100} // لضمان ظهور الخط فوق كل شيء
          />
        )}

        {/* رسم الماركرات */}
        {sortedWaypoints.map((wp, index) => (
          <Marker 
            key={`wp-${index}`} 
            coordinate={{ latitude: wp.latitude, longitude: wp.longitude }}
          >
             <Ionicons 
                name={wp.type === 'stop' ? "bus" : "location"} 
                size={20} 
                color={wp.type === 'start' ? '#3b82f6' : wp.type === 'end' ? '#ef4444' : '#10b981'} 
            />
          </Marker>
        ))}

        {children}
      </MapView>
    </View>
  );
};