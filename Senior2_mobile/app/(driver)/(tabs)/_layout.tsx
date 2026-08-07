import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';

export default function TabsLayout() {
  const PRIMARY_GREEN = '#10b981';
  const INACTIVE_GRAY = '#94a3b8';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY_GREEN,
        tabBarInactiveTintColor: INACTIVE_GRAY,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          height: Platform.OS === 'ios' ? 90 : 75,
          borderTopWidth: 1,
          borderTopColor: 'rgba(16, 185, 129, 0.1)',
          elevation: 0,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <View className={focused ? "bg-emerald-50  rounded-2xl" : ""}>
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={22}
                  color={color}
                />
              </View>
              {focused && <View style={{ backgroundColor: PRIMARY_GREEN }} className="w-4 h-0.5 rounded-full mt-1" />}
            </View>
          ),
        }}
      /><Tabs.Screen
        name="notification"
        options={{
          title: 'Notification',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <View className={focused ? "bg-emerald-100 p-1 rounded-xl" : "p-1"}>
                <Ionicons
                  name={focused ? "notifications" : "notifications-outline"}
                  size={22}
                  color={color}
                />
              </View>
              {focused && (
                <View
                  style={{ backgroundColor: PRIMARY_GREEN }}
                  className="w-4  rounded-full mt-1"
                />
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center">
              <View className={focused ? "bg-emerald-100 p-1 rounded-xl" : "p-1"}>
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={22}
                  color={color}
                />
              </View>
              {focused && (
                <View
                  style={{ backgroundColor: PRIMARY_GREEN }}
                  className="w-4 rounded-full mt-1"
                />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}