import { UserAPI } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

const THEME = {
  primary: '#10B981',
};

export default function PaymentHome() {
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [busTransactions, setBusTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async (refreshing = false) => {
    try {
      if (!refreshing) setIsLoading(true);
      setError(null);

      const [infoRes, subsRes, busTxRes] = await Promise.all([
        UserAPI.getPaymentInfo(),
        UserAPI.getTransactionHistory(), 
        UserAPI.getTransactionHistoryonbus()
      ]);

      setPaymentInfo(infoRes);
      setSubscriptions(Array.isArray(subsRes) ? subsRes : subsRes?.subscriptions || subsRes?.data || []);
      setBusTransactions(Array.isArray(busTxRes) ? busTxRes : busTxRes?.transactions || busTxRes?.data || []);
    } catch (err: any) {
      setError('An error occurred while fetching payment data');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPaymentData(true);
  };

  if (isLoading) {
    return (
      <View className="flex-col items-center justify-center flex-1 bg-slate-50">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="mt-4 text-base font-medium text-slate-500">Loading payment details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center justify-center flex-1 px-6 bg-slate-50">
        <Text className="text-lg font-bold text-center text-rose-500">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 p-6 bg-slate-50"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={THEME.primary}
          colors={[THEME.primary]}
        />
      }
    >
      <Text className="mb-6 text-2xl font-extrabold tracking-wide text-center text-slate-900">
        Payment & Card Management
      </Text>

      <View className="relative p-6 mb-8 overflow-hidden border shadow-2xl bg-slate-900 rounded-3xl shadow-emerald-500/30 border-slate-800">
        <View className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-emerald-900 to-teal-950 opacity-90" />

        <View className="absolute rounded-full -top-12 -right-12 w-44 h-44 bg-emerald-500/30 blur-3xl" />
        <View className="absolute rounded-full -bottom-12 -left-12 w-44 h-44 bg-teal-500/20 blur-3xl" />

        <View className="relative z-10">
          <View className="flex flex-row items-start justify-between mb-10">
            <View>
              <Ionicons name="card-outline" size={28} color="#34D399" />
            </View>
            <View className="bg-emerald-500/25 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-400/30 shadow-sm">
              <Text className="text-xs font-bold tracking-widest uppercase text-emerald-300">
                {paymentInfo?.card_type || paymentInfo?.status || 'Active'}
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-end justify-between pt-5 border-t border-emerald-500/20">
            <View>
              <Text className="text-emerald-300/70 text-[10px] font-bold tracking-widest uppercase">Card Number</Text>
              <Text className="font-mono text-base tracking-[0.2em] text-white mt-1 font-bold">
                {paymentInfo?.card_number || '•••• •••• •••• ••••'}
              </Text>
            </View>
            <View className="text-right">
              <Text className="text-emerald-300/70 text-[10px] font-bold tracking-widest uppercase">Cardholder</Text>
              <Text className="mt-1 text-sm font-bold text-white">
                {paymentInfo?.owner_name || paymentInfo?.name || 'User'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-8">
        <View className="flex flex-row items-center justify-between mb-4">
          <Text className="text-lg font-extrabold tracking-wide text-slate-900">Active Subscriptions</Text>
          <View className="px-3 py-1 rounded-full bg-emerald-100">
            <Text className="text-xs font-bold text-emerald-700">{subscriptions.length} Active</Text>
          </View>
        </View>

        {subscriptions.length > 0 ? (
          <View className="space-y-4">
            {subscriptions.map((sub: any, index: number) => {
              const isExpired = sub.is_expired;
              return (
                <View
                  key={sub.transaction_id || sub.id || index}
                  className={`p-5 rounded-3xl border transition-all duration-200 ${isExpired
                      ? 'bg-slate-100/70 border-slate-200 opacity-85'
                      : 'bg-white border-emerald-100/80 shadow-lg shadow-emerald-500/5'
                    }`}
                >
                  <View className="flex flex-row items-start justify-between pb-4 border-b border-slate-100">
                    <View className="flex flex-row items-center gap-3.5">
                      <View className={`w-12 h-12 rounded-2xl items-center justify-center shadow-sm ${isExpired ? 'bg-slate-200' : 'bg-emerald-500'
                        }`}>
                        <Ionicons
                          name={isExpired ? "time-outline" : "location-outline"}
                          size={22}
                          color={isExpired ? '#64748B' : '#FFFFFF'}
                        />
                      </View>
                      <View>
                        <Text className="text-base font-extrabold uppercase text-slate-900">
                          {sub.zone_name || 'Zone Subscription'}
                        </Text>
                        <Text className="text-xs font-bold text-emerald-600">
                          Zone ID: #{sub.zone_id}
                        </Text>
                      </View>
                    </View>

                    <View className={`px-3 py-1 rounded-full border ${isExpired ? 'bg-slate-200/60 border-slate-300' : 'bg-emerald-50 border-emerald-200'
                      }`}>
                      <Text className={`text-[10px] font-extrabold uppercase tracking-wider ${isExpired ? 'text-slate-600' : 'text-emerald-700'
                        }`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </Text>
                    </View>
                  </View>

                  <View className="grid grid-cols-2 gap-3 py-3.5">
                    <View className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Text className="text-[10px] font-semibold text-slate-400 uppercase">Merchant / Kiosk</Text>
                      <Text className="mt-0.5 text-xs font-extrabold text-slate-800">{sub.merchant_name || 'N/A'}</Text>
                    </View>

                    <View className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Text className="text-[10px] font-semibold text-slate-400 uppercase">Merchant / Kiosk</Text>
                      <Text className="mt-0.5 text-xs font-extrabold text-slate-800">{sub.amount + ' SYP'}</Text>
                    </View>

                    <View className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Text className="text-[10px] font-semibold text-slate-400 uppercase">Payment Method</Text>
                      <Text className="mt-0.5 text-xs font-bold uppercase text-emerald-600">{sub.payment_method || 'N/A'}</Text>
                    </View>

                    <View className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Text className="text-[10px] font-semibold text-slate-400 uppercase">Duration</Text>
                      <Text className="mt-0.5 text-xs font-bold text-slate-800">{sub.duration_days} {sub.duration_days === 1 ? 'Day' : 'Days'}</Text>
                    </View>

                    <View className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <Text className="text-[10px] font-semibold text-slate-400 uppercase">Transaction ID</Text>
                      <Text className="mt-0.5 text-xs font-mono font-bold text-slate-800">#{sub.transaction_id}</Text>
                    </View>
                  </View>

                  {sub.created_at && (
                    <View className="flex flex-row items-center justify-between pt-3 mt-1 text-xs border-t border-slate-100">
                      <View className="flex flex-row items-center gap-1.5">
                        <Ionicons name="calendar-outline" size={13} color="#64748B" />
                        <Text className="text-slate-400">Issued: <Text className="font-bold text-slate-700">{new Date(sub.created_at).toLocaleString()}</Text></Text>
                      </View>
                      <View className="flex flex-row items-center gap-1.5">
                        <Ionicons name="shield-checkmark-outline" size={13} color="#10B981" />
                        <Text className="text-slate-400">Card: <Text className="font-mono font-bold text-slate-700">#{sub.card_id}</Text></Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View className="items-center justify-center p-8 bg-white border shadow-sm rounded-3xl border-slate-100">
            <Ionicons name="shield-outline" size={36} color="#CBD5E1" />
            <Text className="mt-2 text-sm font-medium text-center text-slate-400">No active subscriptions found.</Text>
          </View>
        )}
      </View>

      <View className="flex flex-row items-center justify-between mb-4">
        <Text className="text-lg font-extrabold tracking-wide text-slate-900">Bus Trip Transactions</Text>
        <Text className="text-xs font-semibold text-emerald-600">Recent Rides</Text>
      </View>

      <View className="pb-8 space-y-3">
        {busTransactions && busTransactions.length > 0 ? (
          busTransactions.map((tx: any, index: number) => (
            <View
              key={tx.transaction_id || tx.id || index}
              className="flex flex-col justify-between gap-3 p-5 bg-white border shadow-md rounded-2xl border-slate-100 shadow-slate-200/50"
            >
              <View className="flex flex-row items-start justify-between">
                <View className="flex flex-row items-center gap-2">
                  <View className="px-3 py-1 border bg-emerald-50 rounded-xl border-emerald-200/60">
                    <Text className="text-xs font-bold uppercase text-emerald-700">
                      {tx.status || 'Success'}
                    </Text>
                  </View>
                  <Text className="text-xs font-semibold text-slate-400">#{tx.transaction_id || tx.id}</Text>
                </View>
                <Text className="text-xs font-medium text-slate-400">
                  {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>

              {tx.route_name && (
                <View className="flex flex-row items-center gap-1.5 mt-1">
                  <Ionicons name="bus-outline" size={14} color="#64748B" />
                  <Text className="text-xs font-bold text-slate-700">
                    Route: <Text className="font-extrabold text-emerald-600">{tx.route_name}</Text>
                  </Text>
                </View>
              )}

              <View className="flex flex-row items-center justify-between p-3.5 mt-1 bg-slate-50/80 rounded-xl border border-slate-100">
                <View>
                  <Text className="text-xs font-medium text-slate-400">Amount:</Text>
                  <Text className="mt-0.5 font-extrabold text-emerald-600 text-base">
                    {tx.amount || tx.payment?.amount || '0'}
                  </Text>
                </View>
                <View className="text-right">
                  <Text className="text-xs font-medium text-slate-400">Method:</Text>
                  <Text className="mt-0.5 text-xs font-bold uppercase text-slate-700">
                    {tx.method || tx.payment?.method || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center justify-center p-8 bg-white border shadow-sm rounded-2xl border-slate-100">
            <Text className="text-sm font-medium text-center text-slate-400">No bus transactions recorded.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}