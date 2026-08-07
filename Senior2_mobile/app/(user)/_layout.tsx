import { Stack } from 'expo-router';

export default function UserStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="trackBus" />
      <Stack.Screen name="busDetails" />
      <Stack.Screen name="selectRoute" />
      <Stack.Screen name="makeOrder" />
    </Stack>
  );
}