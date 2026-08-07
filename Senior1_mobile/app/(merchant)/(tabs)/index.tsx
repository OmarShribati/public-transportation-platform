import { MerchantAPI } from '@/services/merchantService';
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const THEME = {
  primary: '#10B981',
  dark: '#0F172A',
  danger: '#EF4444',
};

export default function MerchantHome() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);


  const [permission, requestPermission] = useCameraPermissions();


  const [isPreparingCamera, setIsPreparingCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;


  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;


  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isLoading]);


  useEffect(() => {
    if (isPreparingCamera) {
      const createDotAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: -8,
              duration: 250,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 250,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.delay(300),
          ])
        );
      };

      const anim1 = createDotAnimation(dot1Anim, 0);
      const anim2 = createDotAnimation(dot2Anim, 120);
      const anim3 = createDotAnimation(dot3Anim, 240);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
        dot1Anim.setValue(0);
        dot2Anim.setValue(0);
        dot3Anim.setValue(0);
      };
    }
  }, [isPreparingCamera]);

  const hasScannedRef = useRef(false);


  const handleOpenScanner = () => {
    if (!permission?.granted) {
      requestPermission();
      return;
    }

    setIsPreparingCamera(true);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        hasScannedRef.current = false;
        setIsScanning(true);
        setIsPreparingCamera(false);
        slideAnim.setValue(0);
        fadeAnim.setValue(1);
      }, 500);
    });
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (hasScannedRef.current || isLoading) return;

    hasScannedRef.current = true;
    setIsScanning(false);
    setIsLoading(true);

    try {
      const response = await MerchantAPI.lookupCard({ token: data });

      if (response) {
        console.log("Card information retrieved successfully:", response);
        router.push({
          pathname: '/(merchant)/CardDetails',
          params: {
            qrToken: data,
            owner_name: response.owner_name || 'Unknown',
            balance: response.balance || '0.00',
            subscriptions: JSON.stringify(response.subscriptions || []),
          }
        });
      } else {
        Alert.alert("Error", "Card information not found");
        hasScannedRef.current = false;
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Invalid code or card does not exist"
      );
      hasScannedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    hasScannedRef.current = false;
    setIsScanning(false);
    setIsLoading(false);
    setIsPreparingCamera(false);
    slideAnim.setValue(0);
    fadeAnim.setValue(1);
  };

  if (!permission) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View className="flex-1 bg-white">

      <View className="absolute top-[-50] left-[-50] w-72 h-72 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
      <View className="absolute bottom-[-50] right-[-50] w-72 h-72 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />


      <View className="absolute z-30 flex-row items-center justify-between w-full px-8 top-14">
        <TouchableOpacity
          onPress={() => logout()}
          className="items-center justify-center w-12 h-12 bg-white border shadow-lg border-slate-100 rounded-2xl shadow-slate-200 active:scale-95"
        >
          <Ionicons name="power" size={20} color={THEME.danger} />
        </TouchableOpacity>


        {(isScanning || isLoading) ? (
          <TouchableOpacity
            onPress={resetState}
            className="items-center justify-center w-12 h-12 bg-white border shadow-lg border-slate-100 rounded-2xl shadow-slate-200 active:scale-95"
          >
            <Ionicons name="close" size={22} color="#0F172A" />
          </TouchableOpacity>
        ) : (
          <View className="w-12 h-12" />
        )}
      </View>

      <View className="items-center justify-center flex-1 px-8">

        {isScanning && !isLoading ? (
          <View className="absolute inset-0 z-20 bg-black">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />

            <View className="absolute inset-0 items-center justify-center pointer-events-none">
              <View className="w-64 h-64 border-2 border-emerald-400/80 rounded-[35px] bg-emerald-500/10 backdrop-blur-xs items-center justify-center relative shadow-2xl shadow-emerald-500/50">
                <View className="absolute w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg top-4 left-4" />
                <View className="absolute w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg top-4 right-4" />
                <View className="absolute w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg bottom-4 left-4" />
                <View className="absolute w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg bottom-4 right-4" />
              </View>
            </View>

            <View className="absolute items-center w-full px-6 bottom-20">
              <View className="px-6 py-3.5 bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 flex-row items-center shadow-2xl">
                <Ionicons name="scan" size={18} color={THEME.primary} style={{ marginRight: 8 }} />
                <Text className="text-xs font-bold tracking-wide text-slate-800">
                  Align QR code within the frame to scan
                </Text>
              </View>
            </View>
          </View>
        ) : isLoading ? (
          /* State 2: Processing Animation */
          <View className="items-center justify-center">
            <View className="relative items-center justify-center mb-6">
              <Animated.View
                style={{ transform: [{ scale: pulseAnim }] }}
                className="items-center justify-center w-28 h-28 bg-emerald-50 border border-emerald-200 rounded-[35px] shadow-2xl shadow-emerald-500/30"
              >
                <Ionicons name="card" size={44} color={THEME.primary} />
              </Animated.View>

              <Animated.View
                style={{
                  transform: [{ rotate: spin }],
                }}
                className="absolute items-center justify-center w-10 h-10 border-2 border-white rounded-full shadow-lg -top-2 -right-2 bg-emerald-500"
              >
                <Ionicons name="arrow-down" size={18} color="white" />
              </Animated.View>
            </View>

            <Text className="text-sm font-black tracking-widest uppercase text-slate-400">Processing Transaction</Text>
          </View>
        ) : (
          /* State 3: Main Screen with Interactive Button */
          <View className="items-center w-full max-w-xs">


            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-[30px] items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 rotate-3">
                <Ionicons name="qr-code" size={36} color={THEME.primary} />
              </View>
              <Text className="mb-2 text-3xl font-black tracking-tight text-center text-slate-900">Digital Gateway</Text>
              <Text className="text-xs font-medium leading-relaxed text-center text-slate-500">
                Tap the button below to activate the scanner and start processing operations immediately.
              </Text>
            </View>


            <TouchableOpacity
              onPress={handleOpenScanner}
              disabled={isPreparingCamera}
              activeOpacity={0.85}
              className="w-full h-20 bg-emerald-500 rounded-[28px] overflow-hidden flex-row items-center justify-center shadow-2xl shadow-emerald-500/40 relative"
            >

              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 20]
                    })
                  }]
                }}
                className="absolute flex-row items-center justify-center w-full px-6"
              >
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-2xl bg-emerald-600/40">
                  <Ionicons name="scan-outline" size={20} color="white" />
                </View>
                <Text className="text-base font-black tracking-wide text-white">Open Scanner</Text>
              </Animated.View>


              {isPreparingCamera && (
                <View className="absolute inset-0 flex-row items-center justify-center space-x-2">
                  <Animated.View
                    style={{
                      transform: [{ translateY: dot1Anim }],
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'white',
                      marginHorizontal: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                    }}
                  />
                  <Animated.View
                    style={{
                      transform: [{ translateY: dot2Anim }],
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'white',
                      marginHorizontal: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                    }}
                  />
                  <Animated.View
                    style={{
                      transform: [{ translateY: dot3Anim }],
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: 'white',
                      marginHorizontal: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                    }}
                  />
                </View>
              )}
            </TouchableOpacity>


            <View className="absolute flex-row items-center -bottom-36">
              <Ionicons name="shield-checkmark-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
              <Text className="text-[11px] font-semibold text-slate-400 tracking-wider">Fully Encrypted & Secure System</Text>
            </View>

          </View>
        )}
      </View>
    </View>
  );
}