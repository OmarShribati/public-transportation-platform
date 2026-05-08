import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

interface RouteData {
  route_id: number;
  route_name: string;
  price: number;
  route_distance_meters: number;
  estimated_duration_seconds: number;
  boarding_distance_meters: number;
  available_buses_count: number;
  available_buses: any[];
}

export default function SelectRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tripData?: string }>();

  const parsedData = useMemo(() => {
    try {
      return params.tripData ? JSON.parse(params.tripData) : null;
    } catch (error) {
      console.error(" Error parsing tripData:", error);
      return null;
    }
  }, [params.tripData]);

  const routes: RouteData[] = parsedData?.routes || [];

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      <View className="pt-16 px-6 pb-6 bg-white">
        <View className="flex-row items-center justify-between">
        
          <View className="items-center justify-center">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">Available Options</Text>
            <Text className="text-xl font-black text-slate-900">Select Route</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="p-3 bg-gray-50 rounded-2xl border border-gray-100"
          >
            <Ionicons name="chevron-back" size={22} color="#1e293b" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {routes.length > 0 ? (
          routes.map((route) => (
            <TouchableOpacity 
              key={route.route_id}
              activeOpacity={0.9}
              onPress={() => router.push({
                pathname: '/trackBus',
                params: { 
                  buses: JSON.stringify(route.available_buses),
                  routeId: route.route_id.toString(),
                  routeName: route.route_name
                }
              })}
              className="bg-white mb-6 rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-slate-200/50"
            >
              <View className="p-5 flex-row justify-between items-start">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <View className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                    <Text className="text-emerald-500 font-bold text-[10px] uppercase tracking-tighter">Live Support</Text>
                  </View>
                  <Text className="text-2xl font-black text-[#10b981] leading-tight">
                    {route.route_name}
                  </Text>
                  <View className="flex-row items-center mt-2 bg-blue-50 self-start px-3 py-1 rounded-full">
                    <Ionicons name="walk-outline" size={12} color="#10b981" />
                    <Text className="text-[#10b981] font-bold text-[10px] ml-1">
                      {route.boarding_distance_meters?.toFixed(0) || 0}m walk to board
                    </Text>
                  </View>
                </View>
                
                <View className="bg-slate-900 px-4 py-3 rounded-2xl items-center">
                  <Text className="text-white font-black text-lg">{route.price}</Text>
                  <Text className="text-slate-400 text-[8px] font-bold uppercase">SYP</Text>
                </View>
              </View>

              <View className="flex-row justify-between bg-slate-50 mx-4 mb-4 p-4 rounded-[24px] border border-slate-100">
                <View className="items-center flex-1">
                  <Ionicons name="time-outline" size={18} color="#64748b" />
                  <Text className="text-slate-800 font-black mt-1">
                    {(route.estimated_duration_seconds / 60).toFixed(0)} min
                  </Text>
                  <Text className="text-[9px] text-slate-400 font-bold uppercase">Duration</Text>
                </View>
                
                <View className="w-[1px] h-8 bg-slate-200 self-center" />
                
                <View className="items-center flex-1">
                  <Ionicons name="git-network-outline" size={18} color="#64748b" />
                  <Text className="text-slate-800 font-black mt-1">
                    {(route.route_distance_meters / 1000).toFixed(1)} km
                  </Text>
                  <Text className="text-[9px] text-slate-400 font-bold uppercase">Distance</Text>
                </View>

                <View className="w-[1px] h-8 bg-slate-200 self-center" />

                <View className="items-center flex-1">
                  <Ionicons name="bus" size={18} color="#64748b" />
                  <Text className="text-slate-800 font-black mt-1">
                    {route.available_buses_count}
                  </Text>
                  <Text className="text-[9px] text-slate-400 font-bold uppercase">Active</Text>
                </View>
              </View>

              <View className="bg-[#10b981] py-4 flex-row justify-center items-center">
                <Text className="text-white font-black text-sm mr-2">Track This Route</Text>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center mt-20">
            <View className="bg-gray-100 p-8 rounded-full mb-4">
              <Ionicons name="map-outline" size={40} color="#cbd5e1" />
            </View>
            <Text className="text-slate-400 font-bold text-lg">No routes found nearby</Text>
            <Text className="text-slate-300 text-sm mt-1">Try adjusting your destination</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}