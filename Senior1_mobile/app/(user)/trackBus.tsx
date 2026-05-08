import { MapComponent } from '@/components/ui/MapComponent';
import { OrderAPI } from '@/services/orderService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + (CARD_MARGIN * 2);

const PRIMARY_COLOR = "#10b981"; 

export default function TrackBus() {
    const router = useRouter();
    const mapRef = useRef<any>(null);
    const flatListRef = useRef<FlatList>(null);
    const params = useLocalSearchParams<{ buses: string; routeName: string; routeId: string }>();

    const [routeWaypoints, setRouteWaypoints] = useState<any[]>([]);
    const [fetchingDetails, setFetchingDetails] = useState(false);

    const initialBuses = useMemo(() => {
        try {
            const parsed = params.buses ? JSON.parse(params.buses) : [];
            return parsed.map((bus: any) => ({
                ...bus,
                latitude: parseFloat(bus.latest_location?.latitude) || 33.5138,
                longitude: parseFloat(bus.latest_location?.longitude) || 36.2765,
                speed: bus.latest_location?.speed_kmh || "0",
                heading: parseFloat(bus.latest_location?.heading) || 0,
            }));
        } catch (e) { 
            console.error("Parse Initial Buses Error:", e);
            return []; 
        }
    }, [params.buses]);

    const [buses, setBuses] = useState(initialBuses);
    const sockets = useRef<{ [key: string]: WebSocket }>({});

    useEffect(() => {
        const fetchRouteDetails = async () => {
            if (!params.routeId) return;
            setFetchingDetails(true);
            try {
                const response = await OrderAPI.showRouteDetails(params.routeId);
                if (response?.route?.path?.waypoints) {
                    setRouteWaypoints(response.route.path.waypoints);
                }
            } catch (error) {
                console.error("Fetch Route Details Error:", error);
            } finally {
                setFetchingDetails(false);
            }
        };
        fetchRouteDetails();
    }, [params.routeId]);

    useEffect(() => {
        let isMounted = true;
        const startTracking = async () => {
            const token = await SecureStore.getItemAsync("user_token");
            if (!token || !isMounted) return;

            initialBuses.forEach((bus: any) => {
                const socketUrl = `wss://primary-tassel-dwindle.ngrok-free.dev/ws/passenger/trips/${bus.trip_id}/tracking/?token=${token}`;
                const socket = new WebSocket(socketUrl);

                socket.onmessage = (event) => {
                    const res = JSON.parse(event.data);
                    if (res.type === "vehicle_location_update" && res.location) {
                        setBuses((currentBuses:any) => 
                            currentBuses.map((b:any) => 
                                b.trip_id === bus.trip_id 
                                ? { 
                                    ...b, 
                                    latitude: parseFloat(res.location.latitude), 
                                    longitude: parseFloat(res.location.longitude),
                                    speed: res.location.speed_kmh,
                                    heading: parseFloat(res.location.heading)
                                  } 
                                : b
                            )
                        );
                    }
                };
                sockets.current[bus.trip_id] = socket;
            });
        };
        startTracking();
        return () => {
            isMounted = false;
            Object.values(sockets.current).forEach(s => s.close());
        };
    }, [initialBuses]);

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            
            <MapComponent
                mapRef={mapRef}
                waypoints={routeWaypoints}
                currentLocation={{
                    latitude: initialBuses[0]?.latitude || 33.5138,
                    longitude: initialBuses[0]?.longitude || 36.2765,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
            >
                {buses.map((bus: any) => (
                    <Marker
                        key={`live-bus-${bus.trip_id}`}
                        coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
                        rotation={bus.heading}
                        anchor={{ x: 0.5, y: 0.5 }}
                        flat={true}
                    >
                        <View className="items-center">
                            <View style={{ backgroundColor: PRIMARY_COLOR }} className="px-3 py-1 rounded-full shadow-xl mb-1 border border-white/20">
                                <Text className="text-[10px] font-black text-white uppercase">{bus.vehicle_number}</Text>
                            </View>
                            <View style={{ borderColor: PRIMARY_COLOR }} className="bg-white p-2 rounded-full border-2 shadow-2xl">
                                <Ionicons name="bus" size={18} color={PRIMARY_COLOR} />
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapComponent>
            <View className="absolute top-14 left-5 right-5 flex-row justify-between items-center">
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="p-3 bg-white rounded-2xl shadow-xl border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                
                <View className="bg-white/90 px-5 py-3 rounded-3xl shadow-xl border border-white items-center backdrop-blur-md">
                    <Text style={{ color: PRIMARY_COLOR }} className="text-[10px] font-black uppercase tracking-widest mb-0.5">Live Tracking</Text>
                    <Text className="font-black text-slate-800 text-sm">{params.routeName || 'Active Fleet'}</Text>
                </View>

                <TouchableOpacity className="p-3 bg-white rounded-2xl shadow-xl border border-gray-100">
                    <Ionicons name="layers-outline" size={24} color="#1e293b" />
                </TouchableOpacity>
            </View>

            <View className="absolute bottom-10 left-0 right-0">
                <FlatList
                    ref={flatListRef}
                    data={buses}
                    horizontal
                    snapToInterval={SNAP_INTERVAL}
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.trip_id.toString()}
                    contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 - CARD_MARGIN }}
                    renderItem={({ item }) => (
                        <View style={{ width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }} className="bg-white p-6 rounded-[40px] shadow-2xl border border-gray-50">
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center">
                                    <View style={{ backgroundColor: `${PRIMARY_COLOR}15`, borderColor: `${PRIMARY_COLOR}30` }} className="p-4 rounded-3xl mr-4 border">
                                        <Ionicons name="bus-outline" size={30} color={PRIMARY_COLOR} />
                                    </View>
                                    <View>
                                        <Text className="font-black text-slate-900 text-xl tracking-tight">Bus {item.vehicle_number}</Text>
                                        <View className="flex-row items-center mt-1">
                                            <View style={{ backgroundColor: PRIMARY_COLOR }} className="w-2 h-2 rounded-full mr-2" />
                                            <Text style={{ color: PRIMARY_COLOR }} className="font-bold text-xs uppercase tracking-tighter">Live • {item.speed} km/h</Text>
                                        </View>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    onPress={() => mapRef.current?.animateToRegion({
                                        latitude: item.latitude, 
                                        longitude: item.longitude,
                                        latitudeDelta: 0.005, 
                                        longitudeDelta: 0.005
                                    }, 1000)}
                                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100"
                                >
                                    <Ionicons name="scan-outline" size={22} color="#1e293b" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                                onPress={() => router.push({
                                    pathname: '/busDetails',
                                    params: { 
                                        busId: item.trip_id,
                                        plate: item.vehicle_number,
                                        speed: item.speed,
                                        driver: item.driver_name || "N/A",
                                        type: item.vehicle_type || "Public Transport"
                                    }
                                })}
                                style={{ backgroundColor: PRIMARY_COLOR, shadowColor: PRIMARY_COLOR }} 
                                className="mt-6 py-4 rounded-[22px] shadow-lg flex-row justify-center items-center"
                            >
                                <Text className="text-white font-black text-base mr-2">Vehicle Details</Text>
                                <Ionicons name="chevron-forward" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

            {fetchingDetails && (
                <View className="absolute inset-0 bg-white/60 backdrop-blur-sm items-center justify-center">
                    <View className="bg-white p-6 rounded-3xl shadow-2xl items-center">
                        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                        <Text style={{ color: PRIMARY_COLOR }} className="mt-4 font-black text-xs uppercase tracking-widest">Optimizing Route...</Text>
                    </View>
                </View>
            )}
        </View>
    );
}