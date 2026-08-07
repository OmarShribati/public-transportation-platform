import { registerForPushNotificationsAsync } from "@/libs/notifications";
import { useAuthStore } from "@/store/useAuthStore";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import "../global.css";

const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootLayoutContent() {
  const { token, account_type, isLoading, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      registerForPushNotificationsAsync();

      const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
        console.log("إشعار وصل:", notification);
      });

      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("تم الضغط على الإشعار:", response);
      });

      return () => {
        notificationSubscription.remove();
        responseSubscription.remove();
      };
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const currentGroup = segments[0];
    const userRole = account_type;

    if (!token) {
      if (currentGroup !== "(auth)") {
        router.replace("/(auth)");
      }
      return;
    }

    if (userRole === "driver") {
      if (currentGroup !== "(driver)") {
        router.replace('/(driver)/(tabs)' as any);
      }
      return;
    }

    if (userRole === "passenger") {
      if (currentGroup !== "(user)") {
        router.replace("/(user)/(tabs)");
      }
      return;
    }
    if (userRole === "merchant") {
      if (currentGroup !== "(merchant)") {
        router.replace('/(merchant)/(tabs)');
      }
      return;
    }
  }, [token, account_type, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#020617]">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View 
      style={{ 
        flex: 1, 
        backgroundColor: '#020617',
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(user)" />
        <Stack.Screen name="(driver)" />
      </Stack>

      <StatusBar style="light" translucent />

      <View 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 999999, 
          elevation: 1000, 
        }} 
        pointerEvents="box-none"
      >
        <Toasts />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutContent />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}