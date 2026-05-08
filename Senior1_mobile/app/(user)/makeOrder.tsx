import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { MapComponent } from '@/components/ui/MapComponent';
import { OrderAPI } from '@/services/orderService';
import { useLocationStore } from '@/store/useLocationStore';

const RECENT_PLACES_KEY = 'recent_destinations';

export default function MakeOrder() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const { location } = useLocationStore();

  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isMapPicking, setIsMapPicking] = useState(false);

  const [mapRegion, setMapRegion] = useState({
    latitude: location?.latitude || 33.5138,
    longitude: location?.longitude || 36.2765,
  });

  useEffect(() => {
    loadRecentPlaces();
  }, []);

  const loadRecentPlaces = async () => {
    const saved = await AsyncStorage.getItem(RECENT_PLACES_KEY);
    if (saved) setRecentPlaces(JSON.parse(saved));
  };

  const fmt = (v: number) => Number(v.toFixed(6));

  const sendOrderToServer = async (destCoords: { latitude: number, longitude: number }) => {
    if (!location) {
      Alert.alert('Error', 'Current location not found');
      return;
    }

    try {
      setLoading(true);
      const body = {
        start: { latitude: fmt(location.latitude), longitude: fmt(location.longitude) },
        destination: { latitude: fmt(destCoords.latitude), longitude: fmt(destCoords.longitude) },
      };

      const response = await OrderAPI.makeOrder(body);
      router.push({
        pathname: '/(user)/selectRoute',
        params: { tripData: JSON.stringify(response) }
      });
    } catch (err) {
      Alert.alert('No Service', 'No available rides for this route.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFromList = (item: any) => {
    setSelectedPlace(item);
    setDestination(item.name);
    setSuggestions([]);
    setIsMapPicking(false);
    setMapRegion({ latitude: item.latitude, longitude: item.longitude });

    const updated = [item, ...recentPlaces.filter(p => p.name !== item.name)].slice(0, 5);
    setRecentPlaces(updated);
    AsyncStorage.setItem(RECENT_PLACES_KEY, JSON.stringify(updated));

    sendOrderToServer({ latitude: item.latitude, longitude: item.longitude });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="z-30 px-6 pt-16 pb-4 bg-white shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-50 rounded-xl">
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-black tracking-tight">Set Destination</Text>
          <View className="w-10" />
        </View>

        <View className="flex-row items-center p-4 border border-gray-100 bg-gray-50 rounded-2xl">
          <Ionicons name="search" size={20} color="#10b981" />
          <TextInput
            placeholder="Where are you going?"
            className="flex-1 ml-3 text-lg font-bold text-[#10b981]"
            value={destination}
            onChangeText={async (text) => {
              setDestination(text);
              if (text.length > 2) {
                setLoading(true);
                try {
                  const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=8`);
                  const data = await res.json();
                  setSuggestions(data.features.map((f: any) => ({
                    name: f.properties.name || "Known Place",
                    latitude: f.geometry.coordinates[1],
                    longitude: f.geometry.coordinates[0],
                    address: f.properties.city || f.properties.country
                  })));
                } finally {
                  setLoading(false);
                }
              }
            }}
          />
        </View>
      </View>

      <View className="flex-1">
        {!isMapPicking && !selectedPlace ? (
          <FlatList
            data={destination.length > 0 ? suggestions : recentPlaces}
            className="px-6"
            ListHeaderComponent={() => (
              <TouchableOpacity onPress={() => setIsMapPicking(true)} className="flex-row items-center p-5 mt-4 mb-4 bg-blue-50/50 rounded-3xl">
                <Ionicons name="map" size={20} color="#10b981" />
                <Text className="ml-3 text-[#10b981] font-black">Pick on Map</Text>
              </TouchableOpacity>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectFromList(item)} className="flex-row items-center py-5 border-b border-gray-50">
                <Ionicons name="time-outline" size={20} color="#64748b" />
                <View className="ml-4">
                  <Text className="font-bold text-gray-800">{item.name}</Text>
                  <Text className="text-xs text-gray-400">{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View className="flex-1">
            <TouchableOpacity
              onPress={() => { setSelectedPlace(null); setIsMapPicking(false); }}
              className="absolute z-40 p-3 bg-white rounded-full shadow-xl top-6 left-6"
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <MapComponent
              mapRef={mapRef}
              currentLocation={{
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
              }}
              waypoints={selectedPlace ? [{ ...selectedPlace, type: 'end', order: 0 }] : []}
              onRegionChangeComplete={(region: any) => {
                if (isMapPicking) setMapRegion(region);
              }}
            />

            {isMapPicking && !selectedPlace && (
              <View className="absolute -mt-12 -ml-6 pointer-events-none top-1/2 left-1/2">
                <Ionicons name="location" size={48} color="#2563eb" />
              </View>
            )}

            <View className="absolute bottom-10 left-6 right-6 bg-white p-8 rounded-[40px] shadow-2xl">
              <Text className="text-gray-400 font-black text-[10px] uppercase mb-1">
                Picking Location
              </Text>
              <Text className="mb-6 text-xl font-black text-gray-900">
                Move map to target
              </Text>

              <TouchableOpacity
                onPress={() => {

                  sendOrderToServer({
                    latitude: mapRegion.latitude,
                    longitude: mapRegion.longitude
                  });
                }}
                disabled={loading}
                className="bg-[#10b981] h-16 rounded-2xl items-center justify-center shadow-lg"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-lg font-black text-white">
                    CONFIRM & FIND RIDES
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}