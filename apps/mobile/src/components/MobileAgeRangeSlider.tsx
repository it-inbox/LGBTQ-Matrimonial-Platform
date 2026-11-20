import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  PanResponder,
  LayoutChangeEvent,
  TouchableOpacity,
} from "react-native";

export interface MobileAgeRangeSliderProps {
  minAge: number;
  maxAge: number;
  onChange: (min: number, max: number) => void;
  minLimit?: number;
  maxLimit?: number;
}

export const MobileAgeRangeSlider: React.FC<MobileAgeRangeSliderProps> = ({
  minAge,
  maxAge,
  onChange,
  minLimit = 18,
  maxLimit = 75,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  trackWidthRef.current = trackWidth;

  const minAgeRef = useRef(minAge);
  minAgeRef.current = minAge;

  const maxAgeRef = useRef(maxAge);
  maxAgeRef.current = maxAge;

  const activeThumbRef = useRef<"min" | "max" | null>(null);

  const getPercent = (value: number) =>
    Math.max(0, Math.min(100, ((value - minLimit) / (maxLimit - minLimit)) * 100));

  const minPercent = getPercent(minAge);
  const maxPercent = getPercent(maxAge);

  const calculateAgeFromPosition = useCallback(
    (x: number) => {
      const width = trackWidthRef.current;
      if (width <= 0) return minLimit;
      const ratio = Math.max(0, Math.min(1, x / width));
      return Math.round(minLimit + ratio * (maxLimit - minLimit));
    },
    [minLimit, maxLimit]
  );

  const updateThumbPosition = useCallback(
    (x: number, thumb: "min" | "max") => {
      const targetAge = calculateAgeFromPosition(x);
      if (thumb === "min") {
        const newMin = Math.min(targetAge, maxAgeRef.current - 1);
        onChange(Math.max(minLimit, newMin), maxAgeRef.current);
      } else {
        const newMax = Math.max(targetAge, minAgeRef.current + 1);
        onChange(minAgeRef.current, Math.min(maxLimit, newMax));
      }
    },
    [calculateAgeFromPosition, minLimit, maxLimit, onChange]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const locationX = evt.nativeEvent.locationX;
        const currentAge = calculateAgeFromPosition(locationX);
        const distToMin = Math.abs(currentAge - minAgeRef.current);
        const distToMax = Math.abs(currentAge - maxAgeRef.current);

        const chosen: "min" | "max" = distToMin <= distToMax ? "min" : "max";
        activeThumbRef.current = chosen;
        updateThumbPosition(locationX, chosen);
      },
      onPanResponderMove: (evt) => {
        if (!activeThumbRef.current) return;
        updateThumbPosition(evt.nativeEvent.locationX, activeThumbRef.current);
      },
      onPanResponderRelease: () => {
        activeThumbRef.current = null;
      },
      onPanResponderTerminate: () => {
        activeThumbRef.current = null;
      },
    })
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setTrackWidth(width);
    }
  };

  return (
    <View className="space-y-2 select-none">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-slate-700 text-xs font-bold uppercase tracking-wider">
          Partner Age Range
        </Text>
        <Text className="text-rose-600 text-xs font-bold font-mono">
          {minAge} - {maxAge} yrs
        </Text>
      </View>

      {/* Interactive Track Area */}
      <View
        onLayout={handleLayout}
        {...panResponder.panHandlers}
        className="relative w-full h-10 justify-center"
      >
        {/* Background Track */}
        <View className="absolute left-0 right-0 h-2 bg-slate-200 rounded-full" />

        {/* Active Highlight Range */}
        <View
          className="absolute h-2 bg-rose-600 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
          }}
        />

        {/* Min Thumb Handle */}
        <View
          style={{
            left: `${minPercent}%`,
            transform: [{ translateX: -12 }],
          }}
          className="absolute w-6 h-6 rounded-full bg-white border-2 border-rose-600 shadow-md items-center justify-center"
        >
          <View className="w-2 h-2 rounded-full bg-rose-600" />
        </View>

        {/* Max Thumb Handle */}
        <View
          style={{
            left: `${maxPercent}%`,
            transform: [{ translateX: -12 }],
          }}
          className="absolute w-6 h-6 rounded-full bg-white border-2 border-rose-600 shadow-md items-center justify-center"
        >
          <View className="w-2 h-2 rounded-full bg-rose-600" />
        </View>
      </View>

      {/* Footer Stepper Adjustments */}
      <View className="flex-row items-center justify-between mt-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[11px] text-slate-400 font-medium">Min:</Text>
          <TouchableOpacity
            onPress={() => onChange(Math.max(minLimit, minAge - 1), maxAge)}
            className="w-6 h-6 rounded-md bg-slate-100 items-center justify-center border border-slate-200"
            activeOpacity={0.7}
          >
            <Text className="text-slate-700 text-xs font-bold">-</Text>
          </TouchableOpacity>
          <Text className="text-xs font-bold text-slate-800 font-mono px-1">
            {minAge}
          </Text>
          <TouchableOpacity
            onPress={() => onChange(Math.min(maxAge - 1, minAge + 1), maxAge)}
            className="w-6 h-6 rounded-md bg-slate-100 items-center justify-center border border-slate-200"
            activeOpacity={0.7}
          >
            <Text className="text-slate-700 text-xs font-bold">+</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Text className="text-[11px] text-slate-400 font-medium">Max:</Text>
          <TouchableOpacity
            onPress={() => onChange(minAge, Math.max(minAge + 1, maxAge - 1))}
            className="w-6 h-6 rounded-md bg-slate-100 items-center justify-center border border-slate-200"
            activeOpacity={0.7}
          >
            <Text className="text-slate-700 text-xs font-bold">-</Text>
          </TouchableOpacity>
          <Text className="text-xs font-bold text-slate-800 font-mono px-1">
            {maxAge}
          </Text>
          <TouchableOpacity
            onPress={() => onChange(minAge, Math.min(maxLimit, maxAge + 1))}
            className="w-6 h-6 rounded-md bg-slate-100 items-center justify-center border border-slate-200"
            activeOpacity={0.7}
          >
            <Text className="text-slate-700 text-xs font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

