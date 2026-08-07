import { UserAPI } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const NotificationContext = createContext<{
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  markAllAsRead: () => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}>({
  unreadCount: 0,
  setUnreadCount: () => {},
  markAllAsRead: () => {},
  notifications: [],
  setNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

const { width } = Dimensions.get('window');
const TAB_COUNT = 5;
const TAB_WIDTH = width / TAB_COUNT;

function MyTabBar({ state, descriptors, navigation }: any) {
  const translateX = useSharedValue(0);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    translateX.value = withSpring(state.index * TAB_WIDTH, {
      damping: 18,
      stiffness: 100,
    });
  }, [state.index]);

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.tabBarContainer}>
      <Animated.View style={[styles.slidingBubbleContainer, animatedBubbleStyle]}>
        <View style={styles.bubble} />
      </Animated.View>

      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getIcon = (name: string, focused: boolean) => {
          switch (name) {
            case 'index': return focused ? 'home' : 'home-outline';
            case 'notification': return focused ? 'notifications' : 'notifications-outline';
            case 'complaint': return focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline';
            case 'payment': return focused ? 'card' : 'card-outline';
            case 'profile': return focused ? 'person-circle' : 'person-circle-outline';
            default: return 'help-circle';
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={1}
          >
            <View>
              <Ionicons
                name={getIcon(route.name, isFocused) as any}
                size={24}
                color={isFocused ? '#10b981' : '#94a3b8'}
              />
              {route.name === 'notification' && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Animated.Text style={[styles.label, { color: isFocused ? '#10b981' : '#94a3b8' }]}>
              {options.title}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function RootTabsLayout() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { token } = useAuthStore();
  
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    fetchInitialData();

    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `wss://deduct-same-praising.ngrok-free.dev/ws/notifications/?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };

   ws.onmessage = (event) => {
      console.log("=== WS Event Raw Data ===", event.data);
      try {
        const parsedData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (parsedData.type === 'unread_count' && typeof parsedData.count === 'number') {
          setUnreadCount(parsedData.count);
          return;
        }
        const content =  parsedData?.data;

        const notifId = parsedData.request?.identifier || parsedData.id || content.id || Date.now().toString();
        
        const notifTitle = content.title || parsedData.title || parsedData.message_title || parsedData.subject;
        console.log(content);
        
        const notifBody = content.body || parsedData.body || parsedData.message || parsedData.text;

        let notifDate = new Date().toISOString();
        if (parsedData.date) {
          notifDate = new Date(parsedData.date * 1000).toISOString();
        } else if (content.created_at) {
          notifDate = content.created_at;
        }

        const newNotification = {
          id: notifId,
          title: notifTitle || notifBody || "إشعار جديد",
          body: notifBody || notifTitle || "لديك تحديث جديد",
          status: 'unread',
          created_at: notifDate,
        };

        console.log("Extracted Final Notification:", newNotification);

        setNotifications((prev) => {
          const exists = prev.some((item) => String(item.id) === String(newNotification.id));
          if (exists) return prev;
          return [newNotification, ...prev];
        });

        setUnreadCount((prev) => prev + 1);

      } catch (error) {
        console.log('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.log('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [token]);

const fetchInitialData = async () => {
    try {
      const [notificationsRes, countRes] = await Promise.all([
        UserAPI.getNotification(),
        UserAPI.getNotificationCount()
      ]);

      const list = Array.isArray(notificationsRes) ? notificationsRes : notificationsRes?.data || [];
      setNotifications(list);
      
      const apiCount = typeof countRes === 'number' 
        ? countRes 
        : countRes?.unread_count ;
      const unreadFromList = list.filter((item: any) => item.status === 'unread').length;

      setUnreadCount(Math.max(apiCount, unreadFromList));

    } catch (e) {
      console.log("Failed to fetch initial notifications and count", e);
    }
  };
  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => 
      prev.map(item => ({ ...item, status: 'read' }))
    );
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, markAllAsRead, notifications, setNotifications }}>
      <Tabs
        tabBar={props => <MyTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="notification" options={{ title: 'Alerts' }} />
        <Tabs.Screen name="complaint" options={{ title: 'Reports' }} />
        <Tabs.Screen name="payment" options={{ title: 'Payments' }} />
        <Tabs.Screen name="profile" options={{ title: 'Account' }} />
      </Tabs>
    </NotificationContext.Provider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 85 : 70,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    width: '100%',
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slidingBubbleContainer: {
    position: 'absolute',
    width: TAB_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    width: 55,
    height: 55,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    zIndex: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});