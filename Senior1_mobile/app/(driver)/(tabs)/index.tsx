import { MapComponent } from '@/components/ui/MapComponent';
import { DriverAPI } from '@/services/driverInformationService';
import { useAuthStore } from "@/store/useAuthStore";
import { useDriverStore } from "@/store/useDriverStore";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { Marker } from 'react-native-maps';

const THEME = {
  primary: '#10b981',
  danger: '#ef4444',
  accent: '#94a3b8',
};

export default function DriverHome() {
  const { logout } = useAuthStore();
  const { routeData, polyLineCoordinates, fetchDriverInfo, isLoading } = useDriverStore();

  const mapRef = useRef<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const [routeAlert, setRouteAlert] = useState<string | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastKnownCoords = useRef<any>(null);
  const syncInterval = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    (async () => {
      await fetchDriverInfo();
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || !isMountedRef.current) return;

      let pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (!isMountedRef.current) return;

      setCurrentLocation({
        // latitude: pos.coords.latitude,
        // longitude: pos.coords.longitude,
        latitude: 33.500625,
        longitude: 36.286658,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      lastKnownCoords.current = pos.coords;
    })();

    return () => {
      isMountedRef.current = false;
      stopTracking();
    };
  }, []);

  const syncLocationToServer = useCallback(async () => {
    if (!isOnline || !lastKnownCoords.current || !isMountedRef.current) return;

    const { latitude, longitude, speed, heading } = lastKnownCoords.current;
    try {
      const response: any = await DriverAPI.sendLocation({
        // latitude: Number(latitude.toFixed(6)),
        // longitude: Number(longitude.toFixed(6)),
        latitude: 33.500641,
        longitude: 36.286658,
        speed_kmh: speed && speed > 0 ? Number((speed * 3.6).toFixed(1)) : 0,
        heading: (heading && heading >= 0) ? Number(heading.toFixed(2)) : 0
      });

      if (!isMountedRef.current) return;

      const alertMessage = response?.alert || response?.data?.alert;
      if (alertMessage) {
        setRouteAlert(alertMessage);
      } else {
        setRouteAlert(null);
      }
    } catch (err) {
      console.warn("Sync Location Error:", err);
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      syncLocationToServer();
      syncInterval.current = setInterval(syncLocationToServer, 10000);
    } else {
      if (syncInterval.current) clearInterval(syncInterval.current);
      if (isMountedRef.current) setRouteAlert(null);
    }
    return () => { if (syncInterval.current) clearInterval(syncInterval.current); };
  }, [isOnline, syncLocationToServer]);

  const stopTracking = useCallback(() => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    if (syncInterval.current) clearInterval(syncInterval.current);
    if (isMountedRef.current) setRouteAlert(null);
  }, []);

  const startTracking = async () => {
    if (locationSubscription.current) locationSubscription.current.remove();

    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5 },
      (location) => {
        if (!isMountedRef.current) return;
        lastKnownCoords.current = location.coords;
        setCurrentLocation((prev: any) => ({
          ...prev,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }));
      }
    );
  };

  const toggleTripStatus = async () => {
    setIsActionLoading(true);
    try {
      if (!isOnline) {
        await DriverAPI.startTrip();
        if (!isMountedRef.current) return;
        setIsOnline(true);
        await startTracking();
      } else {
        await DriverAPI.endTrip();
        if (!isMountedRef.current) return;
        stopTracking();
        setIsOnline(false);
        setIsFull(false);
        setRouteAlert(null);
      }
    } catch (error) {
      Alert.alert("Error", "Action failed. Check internet.");
    } finally {
      if (isMountedRef.current) setIsActionLoading(false);
    }
  };

  const memoizedMap = useMemo(() => {
    if (!currentLocation) return null;
    return (
      <MapComponent
        mapRef={mapRef}
        currentLocation={currentLocation}
        waypoints={routeData?.sortedWaypoints || []}
      >
        <Marker coordinate={currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View className="items-center justify-center p-2 bg-blue-600 border-2 border-white rounded-full shadow-xl">
            <Ionicons name="bus" size={20} color="white" />
          </View>
        </Marker>
      </MapComponent>
    );
  }, [routeData?.sortedWaypoints, currentLocation?.latitude, currentLocation?.longitude]);

  if (isLoading || !currentLocation) {
    return <View className="items-center justify-center flex-1 bg-white"><ActivityIndicator color={THEME.primary} /></View>;
  }

  return (
    <View className="flex-1 bg-white">
      {memoizedMap}
      
      <View className="absolute z-20 flex-row items-center justify-between top-12 left-5 right-5">
        <TouchableOpacity onPress={() => { stopTracking(); logout(); }} className="items-center justify-center w-12 h-12 bg-white shadow-lg rounded-2xl">
          <Ionicons name="log-out-outline" size={24} color={THEME.danger} />
        </TouchableOpacity>
        <View className={`px-4 py-2 rounded-full border ${isOnline ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
          <Text className={`text-[10px] font-black ${isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
            {isOnline ? "● ON DUTY" : "○ OFF DUTY"}
          </Text>
        </View>
      </View>

      {routeAlert && (
        <View className="absolute z-50 flex-row items-center p-4 border shadow-2xl top-28 left-5 right-5 bg-rose-600 backdrop-blur-md rounded-2xl border-rose-400">
          <View className="p-2 mr-3 bg-white/20 rounded-xl">
            <Ionicons name="warning" size={22} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">Route Deviation Alert</Text>
            <Text className="text-xs font-bold text-white mt-0.5">{routeAlert}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={() => mapRef.current?.animateToRegion(currentLocation, 1000)}
        className="absolute right-6 bottom-[360px] z-50 w-12 h-12 bg-white rounded-full items-center justify-center shadow-xl"
      >
        <Ionicons name="navigate" size={24} color={THEME.primary} />
      </TouchableOpacity>

      <View className="absolute bottom-0 w-full bg-white px-7 pt-4 pb-10 rounded-t-[40px] shadow-2xl">
        <View className="self-center w-12 h-1.5 mb-6 rounded-full bg-gray-100" />
        <View className="mb-6">
          <Text className="text-emerald-500 text-[10px] font-black uppercase italic">Active Route</Text>
          <Text className="text-2xl font-bold text-slate-800">{routeData?.route_name || "Assigning..."}</Text>
        </View>

        <View className="flex-row gap-3 mb-8">
          <StatCard label="Stops" value={routeData?.stops?.length || 0} icon="bus" />
          <StatCard label="Distance" value={`${((routeData?.path?.distance_meters || 0) / 1000).toFixed(1)} km`} icon="location" />
          <StatCard label="Fare" value={routeData?.price} icon="cash" />
        </View>

        <TouchableOpacity
          onPress={toggleTripStatus}
          disabled={isActionLoading}
          className={`w-full py-5 rounded-3xl flex-row items-center justify-center ${isOnline ? 'bg-white border-2 border-red-500' : 'bg-emerald-500'}`}
        >
          {isActionLoading ? <ActivityIndicator color={isOnline ? THEME.danger : "white"} /> : (
            <>
              <Ionicons name={isOnline ? "stop-circle" : "rocket"} size={24} color={isOnline ? THEME.danger : "white"} style={{ marginRight: 10 }} />
              <Text className={`text-lg font-black ${isOnline ? 'text-red-500' : 'text-white'}`}>
                {isOnline ? "END SHIFT" : "START WORK NOW"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const StatCard = ({ label, value, icon }: any) => (
  <View className="items-center flex-1 p-4 bg-white border border-gray-100 shadow-sm rounded-3xl">
    <Ionicons name={icon} size={14} color="#64748b" style={{ marginBottom: 4 }} />
    <Text className="text-gray-400 text-[9px] font-black uppercase">{label}</Text>
    <Text className="text-sm font-black text-slate-700">{value}</Text>
  </View>
);