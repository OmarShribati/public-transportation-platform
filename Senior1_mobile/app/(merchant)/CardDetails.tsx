import { MerchantAPI } from '@/services/merchantService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SUBSCRIPTION_TYPES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export default function CardDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [cardInfo] = useState({
    owner_name: params.owner_name || 'Unknown',
    owner_email: params.owner_email || 'No Email',
    card_number: params.card_number || '**** **** **** ****',
    status: params.status || 'active',
    subscriptions: params.subscriptions ? JSON.parse(params.subscriptions as string) : [],
  });

  const [qrToken] = useState(params.qrToken as string);

  const [zones, setZones] = useState<any[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<string | null>(null);

  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        setIsLoadingZones(true);
        const response = await MerchantAPI.showZoneSubscription();
        const zonesList = Array.isArray(response) ? response : response?.zones || response?.data || [];
        setZones(zonesList);
      } catch (error: any) {
        console.error("API Error (Fetch Zones):", error);
        Alert.alert("Error", "Failed to load subscription zones");
      } finally {
        setIsLoadingZones(false);
      }
    };

    fetchZones();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedZoneId) {
      Alert.alert("Notice", "Please select a zone");
      return;
    }

    if (!selectedSubType) {
      Alert.alert("Notice", "Please select a subscription type");
      return;
    }

    if (!qrToken) {
      Alert.alert("Error", "Card QR Token is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      await MerchantAPI.topUpCard({
        qr_token: qrToken,
        zone_id: selectedZoneId,
        subscription_type: selectedSubType,
      });

      Alert.alert("Success", "Subscription activated successfully!", [
        {
          text: "OK",
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            }
          }
        }
      ]);
    } catch (error: any) {
      console.error("API Error (Subscription):", error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || error?.response?.data?.error || "An error occurred during subscription, please try again later"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">

      <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
      <View className="absolute bottom-[-50] right-[-50] w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />


      <View className="flex-row items-center justify-between w-full px-8 mb-4 pt-14">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}
          className="items-center justify-center w-12 h-12 bg-white border shadow-lg border-slate-100 rounded-2xl shadow-slate-200 active:scale-95"
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View className="flex-row items-center px-4 py-2 border rounded-full bg-slate-50 border-slate-100">
          <View className="w-2 h-2 mr-2 rounded-full bg-emerald-500 animate-pulse" />
          <Text className="text-[11px] font-black tracking-widest text-slate-700">ZONE SUBSCRIPTION</Text>
        </View>

        <View className="w-12 h-12" />
      </View>

      <ScrollView className="flex-1 px-8 pt-2" showsVerticalScrollIndicator={false}>

        <View className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[30px] shadow-xl shadow-emerald-500/10 mb-6 relative overflow-hidden">
          <View className="absolute w-32 h-32 rounded-full pointer-events-none -top-10 -right-10 bg-emerald-100/40 blur-2xl" />

          <View className="flex-row items-center mb-4">
            <View className="items-center justify-center w-12 h-12 mr-4 shadow-lg bg-emerald-500 rounded-2xl shadow-emerald-500/30">
              <Ionicons name="person" size={22} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-0.5">Card Holder</Text>
              <Text className="text-lg font-black text-slate-900" numberOfLines={1}>
                {cardInfo.owner_name}
              </Text>
              <Text className="text-xs text-slate-500" numberOfLines={1}>
                {cardInfo.owner_email}
              </Text>
            </View>
          </View>


          <View className="flex-row items-center justify-between pt-3 border-t border-emerald-100/60">
            <View>
              <Text className="text-[9px] font-bold text-slate-400 uppercase">Card Number</Text>
              <Text className="text-xs font-bold text-slate-700">{cardInfo.card_number}</Text>
            </View>
            <View className="px-3 py-1 border rounded-full bg-emerald-500/10 border-emerald-200">
              <Text className="text-[10px] font-black uppercase text-emerald-700">{cardInfo.status}</Text>
            </View>
          </View>
        </View>


        <View className="mb-6">
          <Text className="mb-3 ml-2 text-xs font-black tracking-widest uppercase text-slate-500">
            Active Subscriptions ({cardInfo.subscriptions?.length || 0})
          </Text>
          {cardInfo.subscriptions && cardInfo.subscriptions.length > 0 ? (
            <View className="gap-3">
              {cardInfo.subscriptions.map((sub: any, index: number) => {
                const isExpired = sub.is_expired;
                return (
                  <View
                    key={sub.subscription_id || index}
                    className={`p-4 rounded-2xl border ${isExpired ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-emerald-50/30 border-emerald-200 shadow-sm'
                      }`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <View className={`w-8 h-8 rounded-xl items-center justify-center mr-3 ${isExpired ? 'bg-slate-200' : 'bg-emerald-500 shadow-sm shadow-emerald-500/30'}`}>
                          <Ionicons
                            name={isExpired ? "time-outline" : "shield-checkmark-outline"}
                            size={16}
                            color={isExpired ? '#64748B' : 'white'}
                          />
                        </View>
                        <View>
                          <Text className="text-sm font-extrabold uppercase text-slate-900">
                            {sub.zone_name}
                          </Text>
                          <Text className="text-[10px] font-bold text-slate-400">
                            Level {sub.zone_level} • <Text className="uppercase text-emerald-600">{sub.subscription_type}</Text>
                          </Text>
                        </View>
                      </View>

                      <View className={`px-2.5 py-1 rounded-full border ${isExpired ? 'bg-slate-100 border-slate-200' : 'bg-emerald-100 border-emerald-200'
                        }`}>
                        <Text className={`text-[10px] font-black uppercase ${isExpired ? 'text-slate-600' : 'text-emerald-700'}`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-500">
                      <Text className="text-slate-500">
                        Start: <Text className="font-semibold text-slate-700">{new Date(sub.start_date).toLocaleDateString()}</Text>
                      </Text>
                      <Text className="text-slate-500">
                        Expires: <Text className="font-semibold text-slate-700">{new Date(sub.end_date).toLocaleDateString()}</Text>
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="items-center justify-center p-4 border bg-slate-50 border-slate-200 rounded-2xl">
              <Text className="text-xs font-bold text-slate-400">No active subscriptions found for this card.</Text>
            </View>
          )}
        </View>


        <View className="pt-4 mb-6 border-t border-slate-100">
          <Text className="mb-4 ml-2 text-sm font-black tracking-widest uppercase text-slate-800">
            ➕ Add New Subscription
          </Text>


          <View className="mb-6">
            <Text className="mb-3 ml-2 text-xs font-black tracking-widest uppercase text-slate-500">Select Zone</Text>
            {isLoadingZones ? (
              <View className="items-center justify-center h-16 border bg-slate-50 rounded-2xl border-slate-100">
                <ActivityIndicator color="#10B981" />
              </View>
            ) : zones.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingHorizontal: 2 }}
              >
                {zones.map((zone) => {
                  const zId = zone.zone_id ?? zone.id;
                  const isSelected = selectedZoneId === zId;

                  return (
                    <TouchableOpacity
                      key={zId}
                      onPress={() => setSelectedZoneId(zId)}
                      activeOpacity={0.85}
                      className={`
                        w-32
                        py-4 
                        px-3
                        rounded-2xl 
                        border 
                        items-center 
                        justify-center
                        relative
                        ${isSelected
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'bg-white border-slate-200'
                        }
                      `}
                    >
                      <View className="items-center justify-center">
                        <View className={`w-8 h-8 rounded-xl items-center justify-center mb-2 ${isSelected ? 'bg-emerald-600' : 'bg-slate-100'}`}>
                          <Ionicons name="location-outline" size={16} color={isSelected ? 'white' : '#64748B'} />
                        </View>
                        <Text className={`font-bold text-xs text-center mb-1 ${isSelected ? 'text-white' : 'text-slate-800'}`} numberOfLines={1}>
                          {zone.name}
                        </Text>
                      </View>
                      {zone.level && (
                        <Text className={`text-[10px] font-semibold px-2 py-0.5 rounded ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          Level {zone.level}
                        </Text>
                      )}

                      {isSelected && (
                        <View className="absolute w-2 h-2 bg-white rounded-full top-2 right-2" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text className="ml-2 text-sm text-slate-400">No zones available</Text>
            )}
          </View>


          <View className="mb-8">
            <Text className="mb-3 ml-2 text-xs font-black tracking-widest uppercase text-slate-500">
              Subscription Type
            </Text>

            <View className="flex-row gap-3">
              {SUBSCRIPTION_TYPES.map((type) => {
                const isSelected = selectedSubType === type.value;

                return (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setSelectedSubType(type.value)}
                    activeOpacity={0.85}
                    className={`
                      flex-1 
                      py-4 
                      rounded-2xl 
                      border 
                      items-center 
                      justify-center
                      ${isSelected
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'bg-white border-slate-200'
                      }
                    `}
                  >
                    <Text
                      className={`
                        text-xs
                        font-black
                        uppercase
                        tracking-wider
                        ${isSelected
                          ? 'text-white'
                          : 'text-slate-600'
                        }
                      `}
                    >
                      {type.label}
                    </Text>

                    {isSelected && (
                      <View className="absolute w-2 h-2 bg-white rounded-full top-2 right-2" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>


        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={isSubmitting || isLoadingZones}
          activeOpacity={0.85}
          className="w-full h-16 bg-emerald-500 rounded-[24px] items-center justify-center shadow-xl shadow-emerald-500/30 mb-8"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center">
              <Ionicons name="ticket-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-base font-black tracking-wide text-white">Activate Subscription</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}