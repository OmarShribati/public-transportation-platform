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

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastKnownCoords = useRef<any>(null);
  const syncInterval = useRef<any>(null);

  useEffect(() => {
    (async () => {
      await fetchDriverInfo();
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let pos = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      lastKnownCoords.current = pos.coords;
    })();
    return () => stopTracking();
  }, []);

  const syncLocationToServer = useCallback(async () => {
    if (!isOnline || !lastKnownCoords.current) return;

    const { latitude, longitude, speed, heading } = lastKnownCoords.current;
    try {
      await DriverAPI.sendLocation({
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        speed_kmh: speed && speed > 0 ? Number((speed * 3.6).toFixed(1)) : 0,
        heading:  (heading && heading >= 0) ? Number(heading.toFixed(2)) : 0
      });
    } catch (err) {
      console.warn(err);
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      syncLocationToServer();
      syncInterval.current = setInterval(syncLocationToServer, 10000);
    } else {
      if (syncInterval.current) clearInterval(syncInterval.current);
    }
    return () => { if (syncInterval.current) clearInterval(syncInterval.current); };
  }, [isOnline, syncLocationToServer]);

  const stopTracking = useCallback(() => {
    locationSubscription.current?.remove();
    locationSubscription.current = null;
    if (syncInterval.current) clearInterval(syncInterval.current);
  }, []);

  const startTracking = async () => {
    if (locationSubscription.current) locationSubscription.current.remove();

    locationSubscription.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5 },
      (location) => {
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
        setIsOnline(true);
        await startTracking();
      } else {
        await DriverAPI.endTrip();
        stopTracking();
        setIsOnline(false);
        setIsFull(false);
      }
    } catch (error) {
      Alert.alert("Error", "Action failed. Check internet.");
    } finally {
      setIsActionLoading(false);
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
          <View className="bg-blue-600 p-2 rounded-full border-2 border-white shadow-xl">
            <Ionicons name="bus" size={20} color="white" />
          </View>
        </Marker>
      </MapComponent>
    );
  }, [routeData?.sortedWaypoints, currentLocation?.latitude, currentLocation?.longitude]);

  if (isLoading || !currentLocation) {
    return <View className="flex-1 items-center justify-center bg-white"><ActivityIndicator color={THEME.primary} /></View>;
  }

  return (
    <View className="flex-1 bg-white">
      {memoizedMap}
      <View className="absolute top-12 left-5 right-5 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => { stopTracking(); logout(); }} className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-lg">
          <Ionicons name="log-out-outline" size={24} color={THEME.danger} />
        </TouchableOpacity>
        <View className={`px-4 py-2 rounded-full border ${isOnline ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
          <Text className={`text-[10px] font-black ${isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
            {isOnline ? "● ON DUTY" : "○ OFF DUTY"}
          </Text>
        </View>
      </View>

 
      <TouchableOpacity
        onPress={() => mapRef.current?.animateToRegion(currentLocation, 1000)}
        className="absolute right-6 bottom-[360px] z-50 w-12 h-12 bg-white rounded-full items-center justify-center shadow-xl"
      >
        <Ionicons name="navigate" size={24} color={THEME.primary} />
      </TouchableOpacity>

      <View className="absolute bottom-0 w-full bg-white px-7 pt-4 pb-10 rounded-t-[40px] shadow-2xl">
        <View className="self-center w-12 h-1.5 mb-6 rounded-full bg-gray-100" />
        
        {isOnline && (
          <TouchableOpacity
            onPress={async () => {
              setIsStatusLoading(true);
              try {
                await DriverAPI.updateVehicleStatus({ "is_full": !isFull });
                setIsFull(!isFull);
              } finally { setIsStatusLoading(false); }
            }}
            className={`flex-row items-center justify-between p-4 mb-5 rounded-3xl border ${isFull ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-100'}`}
          >
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-2xl items-center justify-center ${isFull ? 'bg-orange-500' : 'bg-blue-500'}`}>
                <Ionicons name={isFull ? "people" : "people-outline"} size={20} color="white" />
              </View>
              <Text className={`ml-3 font-black text-sm ${isFull ? 'text-orange-700' : 'text-blue-700'}`}>
                {isFull ? "Bus is Full" : "Available Seats"}
              </Text>
            </View>
            {isStatusLoading ? <ActivityIndicator size="small" /> : <Ionicons name="sync-outline" size={20} color="#94a3b8" />}
          </TouchableOpacity>
        )}

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
  <View className="flex-1 bg-white p-4 rounded-3xl border border-gray-100 items-center shadow-sm">
    <Ionicons name={icon} size={14} color="#64748b" style={{ marginBottom: 4 }} />
    <Text className="text-gray-400 text-[9px] font-black uppercase">{label}</Text>
    <Text className="text-sm font-black text-slate-700">{value}</Text>
  </View>
);