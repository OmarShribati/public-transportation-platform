import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
export async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
    console.warn("Must use physical device for Push Notifications");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.error("Failed to get push token for push notification!");
    return null;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })
    ).data;
    if (token) {
      await SecureStore.setItemAsync("expo_push_token", token);
    }
  } catch (error) {
    console.error("Error fetching Expo push token:", error);
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#10b981",
    });
  }

  return token;
}
