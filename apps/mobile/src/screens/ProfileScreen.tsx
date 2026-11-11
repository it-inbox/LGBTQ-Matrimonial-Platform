import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useAuthStore } from "../stores/auth.store";
import {
  LogOut,
  Shield,
  Crown,
  Heart,
  Settings,
  Bell,
  EyeOff,
  User as UserIcon,
} from "lucide-react-native";

export const ProfileScreen: React.FC = () => {
  const { profile, user, membership, logout } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  const primaryPhoto =
    profile?.photos?.find((p) => p.isPrimary) || profile?.photos?.[0];
  const photoUrl =
    primaryPhoto?.url ||
    primaryPhoto?.originalUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  return (
    <ScrollView className="flex-1 bg-slate-950 p-4">
      {/* Profile Header Card */}
      <View className="bg-slate-900 border border-slate-800 rounded-3xl p-5 items-center mt-4">
        <View className="relative">
          <Image
            source={{ uri: photoUrl }}
            className="w-24 h-24 rounded-full border-2 border-brand-500"
            contentFit="cover"
          />
          {user?.isVerified && (
            <View className="absolute bottom-0 right-0 bg-emerald-500 p-1.5 rounded-full border-2 border-slate-900">
              <Shield size={14} color="#ffffff" />
            </View>
          )}
        </View>

        <Text className="text-white text-xl font-bold mt-3">
          {profile?.displayName || "Member"}
        </Text>
        <Text className="text-slate-400 text-xs mt-0.5">
          {profile?.city || "Location not set"} • {profile?.orientation || "LGBTQ+"}
        </Text>

        {/* Membership Badge */}
        <View className="flex-row items-center bg-brand-500/10 border border-brand-500/30 px-3 py-1.5 rounded-full mt-3">
          <Crown size={14} color="#f43f5e" />
          <Text className="text-brand-400 text-xs font-semibold ml-1.5">
            {membership?.planName || "Free Plan"}
          </Text>
        </View>
      </View>

      {/* Membership / Stats Bar */}
      <View className="flex-row gap-3 mt-4">
        <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 items-center">
          <Text className="text-slate-400 text-xs font-medium">Super Interests</Text>
          <Text className="text-white text-xl font-bold mt-1">
            {membership?.superInterestsRemaining ?? 0}
          </Text>
        </View>
        <View className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 items-center">
          <Text className="text-slate-400 text-xs font-medium">Spotlights</Text>
          <Text className="text-white text-xl font-bold mt-1">
            {membership?.spotlightsRemaining ?? 0}
          </Text>
        </View>
      </View>

      {/* Account Settings List */}
      <View className="bg-slate-900 border border-slate-800 rounded-2xl mt-4 divide-y divide-slate-800 overflow-hidden">
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center">
            <EyeOff size={18} color="#94a3b8" />
            <Text className="text-slate-200 text-sm ml-3">Ghost Mode</Text>
          </View>
          <Text className="text-slate-500 text-xs">
            {profile?.ghostModeEnabled ? "Active" : "Disabled"}
          </Text>
        </View>

        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center">
            <Shield size={18} color="#94a3b8" />
            <Text className="text-slate-200 text-sm ml-3">Photo Privacy</Text>
          </View>
          <Text className="text-slate-500 text-xs">
            {profile?.photoVisibility || "Blur by Default"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={loggingOut}
          className="flex-row items-center p-4"
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#f43f5e" />
          ) : (
            <>
              <LogOut size={18} color="#f43f5e" />
              <Text className="text-red-400 text-sm font-semibold ml-3">
                Log Out
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
