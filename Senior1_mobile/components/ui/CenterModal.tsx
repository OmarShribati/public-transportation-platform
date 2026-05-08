import { BlurView } from "expo-blur";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { height } = Dimensions.get("window");

type Props = {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    showCloseButton?: boolean;
};

export const CenteredModal = ({
    visible,
    onClose,
    children,
    showCloseButton = true,
}: Props) => {
    const scale = useRef(new Animated.Value(0.85)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 7,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: 0.85,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        // تم استبدال Modal بـ View مع وضعية Absolute و zIndex عالي
        <View style={styles.overlay}>
            {/* الخلفية المضببة */}
            <BlurView 
                intensity={25} 
                style={StyleSheet.absoluteFill} 
                tint="dark"
            />
            
            {/* جعل الإغلاق متاحاً عند الضغط على الخلفية */}
            <TouchableOpacity 
                style={StyleSheet.absoluteFill} 
                activeOpacity={1} 
                onPress={onClose} 
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="items-center justify-center flex-1 w-full px-5"
            >
                <Animated.View
                    style={{
                        transform: [{ scale }],
                        opacity,
                        width: "100%",
                        maxHeight: height * 0.85,
                    }}
                    className="bg-white rounded-[40px] p-8 shadow-2xl overflow-hidden"
                >
                    {/* Close button */}
                    {showCloseButton && (
                        <TouchableOpacity
                            onPress={onClose}
                            className="absolute z-50 p-2 bg-gray-100 rounded-full right-6 top-6"
                        >
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#9ca3af' }}>✕</Text>
                        </TouchableOpacity>
                    )}

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        className="mt-4"
                    >
                        {children}
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
            {/* <Toasts /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000, 
        elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
    }
});