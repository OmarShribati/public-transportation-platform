import { UserAPI } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const THEME = {
  primary: '#10B981', 
  dark: '#0F172A',
  danger: '#EF4444',
};

interface NotificationItem {
  id: number | string;
  title: string;
  body: string;
  status: 'unread' | 'read';
  created_at: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false); 


  const fetchNotifications = async () => {
    try {
      const response = await UserAPI.getNotification();
      setNotifications(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      
      await UserAPI.markAllAsRead(); 

     

      await fetchNotifications();
      
    } catch (error) {
      console.log('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read. Please try again.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isUnread = item.status === 'unread';

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        className={`flex-row items-center p-5 mb-4 rounded-[28px] border ${
          isUnread 
            ? 'bg-emerald-50/60 border-emerald-100 shadow-xl shadow-emerald-500/5' 
            : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        {/* Icon Container */}
        <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 shadow-sm ${
          isUnread ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-100'
        }`}>
          <Ionicons 
            name={isUnread ? "notifications" : "notifications-outline"} 
            size={24} 
            color={isUnread ? "white" : "#64748B"} 
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1.5">
            <Text className={`font-black text-base flex-1 mr-2 ${isUnread ? 'text-slate-900' : 'text-slate-700'}`} numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-[11px] font-bold text-slate-400">{formatDate(item.created_at)}</Text>
          </View>
          <Text className="text-xs font-medium leading-relaxed text-slate-500" numberOfLines={2}>
            {item.body}
          </Text>
        </View>

        {/* Unread Indicator Dot */}
        {isUnread && (
          <View className="w-3 h-3 ml-3 rounded-full shadow-lg bg-emerald-500 shadow-emerald-500 animate-pulse" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Background Soft Glows */}
      <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
      <View className="absolute bottom-[-50] right-[-50] w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-8 pt-4 pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="items-center justify-center w-12 h-12 bg-white border shadow-lg border-slate-100 rounded-2xl shadow-slate-200 active:scale-95"
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleMarkAllAsRead}
          disabled={isMarkingAll}
          className="items-center justify-center h-12 px-4 border bg-emerald-50 border-emerald-100 rounded-2xl active:scale-95"
        >
          {isMarkingAll ? (
            <ActivityIndicator size="small" color={THEME.primary} />
          ) : (
            <Text className="text-xs font-black text-emerald-600">Read All</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Body / List */}
      {isLoading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 10 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={THEME.primary} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-32">
              <View className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-[35px] items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
                <Ionicons name="notifications-off-outline" size={40} color={THEME.primary} />
              </View>
              <Text className="mb-2 text-xl font-black text-slate-800">No Notifications Yet</Text>
              <Text className="text-xs font-medium text-center text-slate-400 max-w-[220px]">
                We'll notify you as soon as there are any new updates or alerts.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}