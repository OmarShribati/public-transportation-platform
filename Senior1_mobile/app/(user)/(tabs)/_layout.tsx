import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 4; 

function MyTabBar({ state, descriptors, navigation }: any) {
  const translateX = useSharedValue(0);

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
            <Ionicons 
              name={getIcon(route.name, isFocused) as any} 
              size={24} 
              color={isFocused ? '#10b981' : '#94a3b8'} 
            />
            <Animated.Text style={[styles.label, { color: isFocused ? '#10b981' : '#94a3b8' }]}>
              {options.title}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => <MyTabBar {...props} />}
      screenOptions={{ 
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="notification" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="complaint" options={{ title: 'Reports' }} />
      <Tabs.Screen name="profile" options={{ title: 'Account' }} />
    </Tabs>
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
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    borderRadius: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase', 
    letterSpacing: 0.5,
  },
});