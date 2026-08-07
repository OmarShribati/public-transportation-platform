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
                passenger_count: bus.passenger_info?.passenger_count || 0,
                capacity: bus.passenger_info?.capacity || 50,
                occupancy_percentage: bus.passenger_info?.occupancy_percentage || 0,
                is_full: bus.passenger_info?.is_full || false,
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
                const socketUrl = `wss://deduct-same-praising.ngrok-free.dev/ws/passenger/trips/${bus.trip_id}/tracking/?token=${token}`;
                const socket = new WebSocket(socketUrl);
socket.onmessage = (event) => {
    console.log("WebSocket Message:", event.data);

    const res = JSON.parse(event.data);

    if (res.type !== "vehicle_location_update") {
        return;
    }

    setBuses((currentBuses: any[]) =>
        currentBuses.map((b: any) => {

            if (b.trip_id !== bus.trip_id) {
                return b;
            }

            return {
                ...b,

                latitude: res.location?.latitude
                    ? parseFloat(res.location.latitude)
                    : b.latitude,

                longitude: res.location?.longitude
                    ? parseFloat(res.location.longitude)
                    : b.longitude,

                speed: res.location?.speed_kmh
                    ?? b.speed,

                heading: res.location?.heading
                    ? parseFloat(res.location.heading)
                    : b.heading,

                passenger_count:
                    res.passenger_info?.passenger_count
                    ?? b.passenger_count,

                capacity:
                    res.passenger_info?.capacity
                    ?? b.capacity,

                occupancy_percentage:
                    res.passenger_info?.occupancy_percentage
                    ?? b.occupancy_percentage,

                is_full:
                    res.passenger_info?.is_full
                    ?? b.is_full,
            };
        })
    );
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

    // دالة لتحديد لون شريط التقدم وحالة الباص بناءً على النسبة المئوية
    const getOccupancyStyling = (percentage: number, isFull: boolean) => {
        if (isFull || percentage >= 90) {
            return { color: '#ef4444', text: 'ممتلئ', bg: 'bg-rose-50', border: 'border-rose-100' }; // أحمر
        } else if (percentage >= 60) {
            return { color: '#f59e0b', text: 'مزدحم جزئياً', bg: 'bg-amber-50', border: 'border-amber-100' }; // أصفر/برتقالي
        } else {
            return { color: '#10b981', text: 'فاضي / متاح', bg: 'bg-emerald-50', border: 'border-emerald-100' }; // أخضر
        }
    };

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
                            <View style={{ backgroundColor: PRIMARY_COLOR }} className="px-3 py-1 mb-1 border rounded-full shadow-xl border-white/20">
                                <Text className="text-[10px] font-black text-white uppercase">{bus.vehicle_number}</Text>
                            </View>
                            <View style={{ borderColor: PRIMARY_COLOR }} className="p-2 bg-white border-2 rounded-full shadow-2xl">
                                <Ionicons name="bus" size={18} color={PRIMARY_COLOR} />
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapComponent>

            <View className="absolute flex-row items-center justify-between top-14 left-5 right-5">
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="p-3 bg-white border border-gray-100 shadow-xl rounded-2xl"
                >
                    <Ionicons name="chevron-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                
                <View className="items-center px-5 py-3 border border-white shadow-xl bg-white/90 rounded-3xl backdrop-blur-md">
                    <Text style={{ color: PRIMARY_COLOR }} className="text-[10px] font-black uppercase tracking-widest mb-0.5">Live Tracking</Text>
                    <Text className="text-sm font-black text-slate-800">{params.routeName || 'Active Fleet'}</Text>
                </View>

                <TouchableOpacity className="p-3 bg-white border border-gray-100 shadow-xl rounded-2xl">
                    <Ionicons name="layers-outline" size={24} color="#1e293b" />
                </TouchableOpacity>
            </View>

            <View className="absolute left-0 right-0 bottom-10">
                <FlatList
                    ref={flatListRef}
                    data={buses}
                    horizontal
                    snapToInterval={SNAP_INTERVAL}
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.trip_id.toString()}
                    contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 - CARD_MARGIN }}
                    renderItem={({ item }) => {
                        const occupancy = item.occupancy_percentage || 0;
                        const styleInfo = getOccupancyStyling(occupancy, item.is_full);

                        return (
                            <View style={{ width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }} className="bg-white p-5 rounded-[36px] shadow-2xl border border-gray-100">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <View style={{ backgroundColor: `${PRIMARY_COLOR}15`, borderColor: `${PRIMARY_COLOR}30` }} className="p-3.5 mr-3.5 border rounded-3xl">
                                            <Ionicons name="bus-outline" size={26} color={PRIMARY_COLOR} />
                                        </View>
                                        <View>
                                            <Text className="text-lg font-black tracking-tight text-slate-900">Bus {item.vehicle_number}</Text>
                                            <View className="flex-row items-center mt-0.5">
                                                <View style={{ backgroundColor: PRIMARY_COLOR }} className="w-2 h-2 mr-1.5 rounded-full" />
                                                <Text style={{ color: PRIMARY_COLOR }} className="text-xs font-bold tracking-tighter uppercase">Live • {item.speed} km/h</Text>
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
                                        className="p-3 border bg-slate-50 rounded-2xl border-slate-100"
                                    >
                                        <Ionicons name="scan-outline" size={20} color="#1e293b" />
                                    </TouchableOpacity>
                                </View>

                                {/* قسم معلومات الركاب والنسبة المئوية مع الخط الملون */}
                                <View className={`mt-4 p-3.5 rounded-2xl border ${styleInfo.bg} ${styleInfo.border}`}>
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center gap-1.5">
                                            <Ionicons name="people-outline" size={16} color={styleInfo.color} />
                                            <Text className="text-xs font-bold text-slate-700">
                                                الركاب: <Text className="font-black text-slate-900">{item.passenger_count}</Text> / {item.capacity}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center gap-1">
                                            <Text style={{ color: styleInfo.color }} className="text-xs font-black">
                                                {occupancy}% ({styleInfo.text})
                                            </Text>
                                        </View>
                                    </View>

                                    {/* شريط التقدم (Progress Bar) الملون */}
                                    <View className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                                        <View 
                                            style={{ 
                                                width: `${Math.min(Math.max(occupancy, 0), 100)}%`, 
                                                backgroundColor: styleInfo.color 
                                            }} 
                                            className="h-full rounded-full" 
                                        />
                                    </View>
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
                                    className="mt-4 py-3.5 rounded-[20px] shadow-lg flex-row justify-center items-center"
                                >
                                    <Text className="mr-2 text-sm font-black text-white">Vehicle Details</Text>
                                    <Ionicons name="chevron-forward" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                />
            </View>

            {fetchingDetails && (
                <View className="absolute inset-0 items-center justify-center bg-white/60 backdrop-blur-sm">
                    <View className="items-center p-6 bg-white shadow-2xl rounded-3xl">
                        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                        <Text style={{ color: PRIMARY_COLOR }} className="mt-4 text-xs font-black tracking-widest uppercase">Optimizing Route...</Text>
                    </View>
                </View>
            )}
        </View>
    );
}