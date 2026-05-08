import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'الباص اقترب!',
    body: 'الباص رقم 123456 على بعد 2 دقيقة من موقفك الحالي.',
    time: 'الآن',
    type: 'arrival', 
    isRead: false,
  },
  {
    id: '2',
    title: 'تأخير في المسار',
    body: 'يوجد ازدحام مروري على طريق المهاجرين، قد يتأخر الباص لمدة 10 دقائق.',
    time: 'منذ 15 دقيقة',
    type: 'delay',
    isRead: true,
  },
  {
    id: '3',
    title: 'تحديث المسار',
    body: 'تم إضافة مواقف جديدة لمسار (صناعة - جمارك). يمكنك التحقق منها الآن.',
    time: 'منذ ساعتين',
    type: 'info', 
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'arrival': return { name: 'bus', color: '#22c55e', bgColor: 'bg-green-100' };
      case 'delay': return { name: 'time', color: '#ef4444', bgColor: 'bg-red-100' };
      default: return { name: 'notifications', color: '#3b82f6', bgColor: 'bg-blue-100' };
    }
  };

  const renderItem = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => {
    const iconConfig = getIconConfig(item.type);

    return (
      <TouchableOpacity 
        className={`flex-row-reverse items-center p-4 mb-3 rounded-2xl border ${item.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100 shadow-sm'}`}
      >
        <View className={`${iconConfig.bgColor} p-3 rounded-full ml-4`}>
          <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row-reverse items-center justify-between mb-1">
            <Text className={`text-right font-bold text-base ${item.isRead ? 'text-gray-800' : 'text-blue-900'}`}>
              {item.title}
            </Text>
            <Text className="text-gray-400 text-[10px]">{item.time}</Text>
          </View>
          <Text className="text-sm leading-5 text-right text-gray-500" numberOfLines={2}>
            {item.body}
          </Text>
        </View>

        {!item.isRead && (
          <View className="w-2 h-2 mr-2 bg-blue-600 rounded-full" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row-reverse items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-gray-50">
          <Ionicons name="arrow-forward" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">الإشعارات</Text>
        <TouchableOpacity>
          <Text className="text-sm font-medium text-blue-600">قراءة الكل</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="notifications-off-outline" size={80} color="#cbd5e1" />
            <Text className="mt-4 text-lg text-gray-400">لا توجد إشعارات حالياً</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}