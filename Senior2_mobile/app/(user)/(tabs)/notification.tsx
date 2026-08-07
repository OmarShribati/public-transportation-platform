import { UserAPI } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from './_layout';

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

export default function HomeScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const { notifications, setNotifications, markAllAsRead: contextMarkAllAsRead, setUnreadCount } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

const fetchNotifications = async () => {
    try {
      const [notificationsRes, countRes] = await Promise.all([
        UserAPI.getNotification(),
        UserAPI.getNotificationCount()
      ]);

      const list = Array.isArray(notificationsRes) ? notificationsRes : notificationsRes?.data || [];
      setNotifications(list);
      
      const count = typeof countRes === 'number' 
        ? countRes 
        : countRes?.unread_count ?? countRes?.count ?? countRes?.data ?? 0;
        
      setUnreadCount(count);
    } catch (error) {
      console.log('Error fetching notifications on home:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      await UserAPI.markAllAsRead(); 
      contextMarkAllAsRead();
      
      const countRes = await UserAPI.getNotificationCount();
      const count = typeof countRes === 'number' ? countRes : countRes?.count ?? countRes?.data ?? 0;
      setUnreadCount(count);
    } catch (error) {
      console.log('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read. Please try again.');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isUnread = item.status === 'unread';

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        className={`flex-row items-center p-4 mb-3 rounded-2xl border ${
          isUnread 
            ? 'bg-emerald-50/60 border-emerald-100 shadow-md shadow-emerald-500/5' 
            : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
          isUnread ? 'bg-emerald-500' : 'bg-slate-100'
        }`}>
          <Ionicons 
            name={isUnread ? "notifications" : "notifications-outline"} 
            size={20} 
            color={isUnread ? "white" : "#64748B"} 
          />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className={`font-bold text-sm flex-1 mr-2 ${isUnread ? 'text-slate-900' : 'text-slate-700'}`} numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-[10px] font-semibold text-slate-400">{formatDate(item.created_at)}</Text>
          </View>
          <Text className="text-xs text-slate-500" numberOfLines={2}>
            {item.body}
          </Text>
        </View>

        {isUnread && (
          <View className="w-2.5 h-2.5 ml-2 rounded-full bg-emerald-500" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
     
      <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

     
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View>
          <Text className="text-xs font-bold tracking-wider uppercase text-slate-400">Welcome Back in</Text>
          <Text className="text-xl font-black text-slate-900">Notifications</Text>
        </View>

       
        <View className="flex-row items-center space-x-2">
         
          <TouchableOpacity 
            onPress={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="items-center justify-center px-3 mr-2 border h-11 bg-emerald-50 border-emerald-100 rounded-2xl active:scale-95"
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color={THEME.primary} />
            ) : (
              <Text className="text-xs font-black text-emerald-600">Read All</Text>
            )}
          </TouchableOpacity>

         
          <TouchableOpacity
            onPress={() => router.push('/notification' as any)}
            className="items-center justify-center border w-11 h-11 bg-slate-50 border-slate-100 rounded-2xl"
          >
            <Ionicons name="notifications-outline" size={20} color={THEME.dark} />
          </TouchableOpacity>
        </View>
      </View>

     
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-sm font-extrabold text-slate-800">Recent Live Updates</Text>
        <TouchableOpacity onPress={() => router.push('/notification' as any)}>
          <Text className="text-xs font-bold text-emerald-600">See All</Text>
        </TouchableOpacity>
      </View>

     
      {isLoading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => String(item.id || index)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, paddingTop: 6 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={THEME.primary} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <View className="items-center justify-center w-20 h-20 mb-4 border bg-emerald-50 border-emerald-100 rounded-3xl">
                <Ionicons name="flash-outline" size={32} color={THEME.primary} />
              </View>
              <Text className="mb-1 text-base font-bold text-slate-800">No Recent Activity</Text>
              <Text className="text-xs text-center text-slate-400 max-w-[200px]">
                Any real-time alerts or notifications will appear right here instantly.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}