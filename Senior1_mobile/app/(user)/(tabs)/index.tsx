import { useAuthStore } from "@/store/useAuthStore";
import { useLocationStore } from "@/store/useLocationStore";
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function UserHome() {
  const logout = useAuthStore((state) => state.logout);
  const { location, setLocation } = useLocationStore();
  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let currentLocation = await Location.getCurrentPositionAsync({});
      const coords = {
        // latitude: currentLocation.coords.latitude,
        latitude: 33.50423760088481 ,
        // longitude: currentLocation.coords.longitude,
        longitude:36.288756300739614,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setLocation(coords);

      mapRef.current?.animateToRegion(coords, 1000);
    })();
  }, []);
  return (
    <View className="flex-1 bg-white">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
      </MapView>

      <View className="absolute flex-row items-center justify-between w-full px-6 top-14">
        <TouchableOpacity
          onPress={() => logout()}
          className="items-center justify-center w-12 h-12 bg-white rounded-full shadow-xl"
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        onPress={() => location && mapRef.current?.animateToRegion(location, 1000)}
        style={{ bottom: 220 }}
        className="absolute p-3 z-[90] bg-white rounded-full shadow-lg right-6"
      >
        <Ionicons name="locate" size={24} color="#10b981" />
      </TouchableOpacity>

      <View className="absolute bottom-0 w-full px-8 pt-6 pb-12 bg-white rounded-t-[50px] shadow-[0_-15px_40px_rgba(0,0,0,0.08)] border-t border-gray-100">

        <View className="w-14 h-1.5 bg-gray-100 rounded-full self-center mb-10" />

        <View className="items-center mb-8">
          <View className="bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            <Text className="text-[10px] font-black text-[#10b981] uppercase tracking-[2px]">Ready to ride</Text>
          </View>

          <Text className="text-4xl font-black text-[#10b981] tracking-tight text-center">
            Where to?
          </Text>

          <View className="w-full mt-4 border-b border-gray-50" />
        </View>

        <View className="flex-row items-start px-2 mb-10">
          <View className="bg-[#10b981]/10 p-2.5 rounded-2xl mr-4">
            <Ionicons name="navigate-circle" size={24} color="#10b981" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold leading-6 text-gray-800">Set your destination</Text>
            <Text className="mt-1 text-sm font-medium text-gray-400">
              Ensure your location is precise for a faster connection with nearby drivers.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/makeOrder")}
          className="bg-[#10b981] h-20 rounded-[28px] flex-row items-center justify-between px-8 shadow-2xl shadow-blue-400"
        >
          <Text className="text-xl font-black tracking-widest text-white uppercase">
            Confirm Pickup
          </Text>
          <View className="items-center justify-center w-12 h-12 bg-white/10 rounded-2xl">
            <Ionicons name="chevron-forward" size={22} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}