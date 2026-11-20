import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { Heart } from "lucide-react-native";

interface AppLoadingScreenProps {
  message?: string;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({ message }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for heart and badge
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Indeterminate sliding progress bar animation
    const slide = Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    slide.start();

    return () => {
      pulse.stop();
      slide.stop();
    };
  }, [pulseAnim, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-25, 65],
  });

  return (
    <View className="flex-1 bg-slate-50 items-center justify-center">
      <View className="items-center">
        {/* EverPride Heart Logo with glowing pulse */}
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className="relative items-center justify-center mb-4"
        >
          {/* Subtle glow border / backdrop */}
          <View className="w-16 h-16 rounded-2xl bg-rose-100/90 p-1 items-center justify-center shadow-lg shadow-rose-500/20">
            <View className="w-full h-full bg-white rounded-[13px] items-center justify-center border border-rose-200/60 shadow-xs">
              <Heart size={28} color="#e11d48" fill="#e11d48" />
            </View>
          </View>
        </Animated.View>

        {/* Brand Name */}
        <Text className="text-2xl font-extrabold tracking-tight text-slate-900 mb-3">
          Ever<Text className="text-rose-600">Pride</Text>
        </Text>

        {/* Minimal indeterminate loading bar */}
        <View className="w-28 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <Animated.View
            style={{
              width: 50,
              height: "100%",
              backgroundColor: "#e11d48",
              borderRadius: 999,
              transform: [{ translateX }],
            }}
          />
        </View>

        {message && (
          <Text className="text-xs text-slate-400 font-medium mt-3">
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

