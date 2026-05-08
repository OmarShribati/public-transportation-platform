import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#10b981';

export default function BusDetails() {
    const router = useRouter();
    const { busId, plate, speed, driver, type } = useLocalSearchParams();

    const paddingTop = Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40;

    return (
        <View className="flex-1 bg-gray-50">
       
            <View style={{ paddingTop }} className="flex-row justify-between items-center px-6 pb-6 bg-white rounded-b-[35px] shadow-sm">
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="p-3 border border-gray-100 bg-gray-50 rounded-2xl"
                >
                    <Ionicons name="arrow-back" size={22} color="#1e293b" />
                </TouchableOpacity>
                <Text className="text-xl font-black tracking-tight text-slate-800">Bus Tracking</Text>
                <View style={{ width: 48 }} /> 
            </View>

            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 25, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                
          
                <View 
                    style={{ shadowColor: PRIMARY_COLOR }}
                    className="bg-[#10b981] p-10 rounded-[45px] items-center mb-8 shadow-2xl shadow-emerald-400"
                >
                    <View className="bg-white/20 p-5 rounded-[30px] border border-white/30">
                        <Ionicons name="bus-outline" size={50} color="white" />
                    </View>
                    <Text className="mt-5 text-4xl font-black tracking-widest text-white">{plate || "BUS-2026"}</Text>
                    <View className="px-6 py-2 mt-4 border bg-black/10 rounded-2xl border-white/20">
                        <Text className="text-xs font-bold tracking-widest text-white uppercase">{type || "Express"}</Text>
                    </View>
                </View>

                <View className="flex-row items-center bg-white p-6 rounded-[35px] mb-6 shadow-sm border border-gray-50">
                    <View className="bg-[#10b981] p-4 rounded-2xl mr-5 shadow-md shadow-emerald-200">
                        <Ionicons name="person-outline" size={24} color="white" />
                    </View>
                    <View className="items-start flex-1">
                        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Assigned Captain</Text>
                        <Text className="text-lg font-black text-slate-800">{driver || "Captain Omar"}</Text>
                    </View>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    <InfoBox label="Live Speed" value={`${speed || 0} km/h`} icon="speedometer-outline" />
                    <InfoBox label="Status" value="On Track" icon="shield-checkmark-outline" />
                    <InfoBox label="Vehicle ID" value={`#${busId || '772'}`} icon="finger-print-outline" />
                    <InfoBox label="ETA" value="4 Mins" icon="stopwatch-outline" />
                </View>

            </ScrollView>
        </View>
    );
}

const InfoBox = ({ label, value, icon }: any) => (
    <View className="w-[48%] bg-white p-6 rounded-[35px] mb-4 items-start border border-gray-50 shadow-sm">
        <View className="p-3 mb-4 bg-emerald-50 rounded-2xl">
            <Ionicons name={icon} size={22} color="#10b981" />
        </View>
        <Text className="text-slate-400 text-[9px] font-black uppercase tracking-tighter">{label}</Text>
        <Text className="mt-1 text-base font-black text-slate-800">{value}</Text>
    </View>
);