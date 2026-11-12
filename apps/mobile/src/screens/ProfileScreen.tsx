import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import {
  LogOut,
  Shield,
  Crown,
  Settings,
  EyeOff,
  User as UserIcon,
  Edit3,
  Sliders,
  Check,
  X,
} from "lucide-react-native";

export const ProfileScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const { profile, user, membership, logout, setProfile, fetchProfile } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Edit Profile Form State
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [city, setCity] = useState(profile?.city || "");
  const [stateName, setStateName] = useState(profile?.state || "");
  const [profession, setProfession] = useState(profile?.profession || profile?.occupation || "");
  const [diet, setDiet] = useState(profile?.diet || "Vegetarian");

  // Partner Preferences State
  const [prefMinAge, setPrefMinAge] = useState(String(profile?.partnerPreference?.minAge ?? 21));
  const [prefMaxAge, setPrefMaxAge] = useState(String(profile?.partnerPreference?.maxAge ?? 40));
  const [prefGenders, setPrefGenders] = useState<string[]>(
    profile?.partnerPreference?.preferredGenders || ["MAN"]
  );
  const [prefOrientations, setPrefOrientations] = useState<string[]>(
    profile?.partnerPreference?.preferredOrientations || ["GAY"]
  );

  // Toggle Ghost Mode
  const handleToggleGhostMode = async (val: boolean) => {
    try {
      await api.patch("/profiles/me/ghost-mode", { enabled: val });
      setProfile({ ...profile!, ghostModeEnabled: val });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
    } catch (err: any) {
      Alert.alert("Error", "Failed to update Ghost Mode: " + (err.response?.data?.message || err.message));
    }
  };

  // Toggle Photo Visibility
  const handleTogglePhotoVisibility = async () => {
    const nextVis =
      profile?.photoVisibility === "ALL_MEMBERS"
        ? "MUTUAL_MATCHES_ONLY"
        : "ALL_MEMBERS";
    try {
      await api.patch("/profiles/me/photo-visibility", { visibility: nextVis });
      setProfile({ ...profile!, photoVisibility: nextVis });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
    } catch (err: any) {
      Alert.alert("Error", "Failed to update Photo Privacy: " + (err.response?.data?.message || err.message));
    }
  };

  // Save General Profile Details
  const handleSaveProfile = async () => {
    setUpdating(true);
    setSaveMessage(null);
    try {
      const res = await api.patch("/profiles/me", {
        displayName: displayName.trim(),
        bio: bio.trim(),
        city: city.trim(),
        state: stateName.trim(),
        profession: profession.trim(),
        diet: diet.trim(),
      });
      setProfile(res.data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => {
        setSaveMessage(null);
        setEditProfileOpen(false);
      }, 1000);
    } catch (err: any) {
      setSaveMessage(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  // Save Partner Preferences
  const handleSavePreferences = async () => {
    setUpdating(true);
    setSaveMessage(null);
    try {
      const minAge = parseInt(prefMinAge, 10) || 18;
      const maxAge = parseInt(prefMaxAge, 10) || 60;
      const res = await api.patch("/profiles/me", {
        partnerPreference: {
          minAge,
          maxAge,
          preferredGenders: prefGenders,
          preferredOrientations: prefOrientations,
        },
      });
      setProfile(res.data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matchesFeed(1) });
      setSaveMessage("Preferences updated! Matches will refresh.");
      setTimeout(() => {
        setSaveMessage(null);
        setPreferencesOpen(false);
      }, 1000);
    } catch (err: any) {
      setSaveMessage(err.response?.data?.message || "Failed to update preferences.");
    } finally {
      setUpdating(false);
    }
  };

  const primaryPhoto =
    profile?.photos?.find((p) => p.isPrimary) || profile?.photos?.[0];
  const photoUrl =
    primaryPhoto?.url ||
    primaryPhoto?.originalUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-4">
      {/* Profile Header Card matching Web */}
      <View className="bg-white border border-slate-200/90 rounded-3xl p-5 items-center mt-2 shadow-sm">
        <View className="relative">
          <Image
            source={{ uri: photoUrl }}
            className="w-24 h-24 rounded-full border-2 border-rose-500"
            contentFit="cover"
          />
          {user?.isVerified && (
            <View className="absolute bottom-0 right-0 bg-emerald-500 p-1.5 rounded-full border-2 border-white">
              <Shield size={14} color="#ffffff" />
            </View>
          )}
        </View>

        <Text className="text-slate-900 text-xl font-bold mt-3">
          {profile?.displayName || "Member"}
        </Text>
        <Text className="text-slate-500 text-xs mt-0.5">
          {[profile?.city, profile?.state].filter(Boolean).join(", ") || "Location not set"} •{" "}
          {profile?.orientation || "LGBTQ+"}
        </Text>

        {profile?.bio && (
          <Text className="text-slate-600 text-xs text-center mt-2.5 px-4 italic leading-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{profile.bio}"
          </Text>
        )}

        {/* Membership Badge */}
        <View className="flex-row items-center bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full mt-3">
          <Crown size={14} color="#e11d48" />
          <Text className="text-rose-700 text-xs font-semibold ml-1.5">
            {membership?.planName || "Free Plan"}
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <View className="flex-row gap-3 mt-4 w-full">
          <TouchableOpacity
            onPress={() => setEditProfileOpen(true)}
            className="flex-1 bg-white border border-slate-200 py-2.5 rounded-xl flex-row items-center justify-center active:bg-slate-50 shadow-xs"
          >
            <Edit3 size={15} color="#475569" />
            <Text className="text-slate-700 text-xs font-semibold ml-2">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPreferencesOpen(true)}
            className="flex-1 bg-rose-50 border border-rose-200 py-2.5 rounded-xl flex-row items-center justify-center active:bg-rose-100 shadow-xs"
          >
            <Sliders size={15} color="#e11d48" />
            <Text className="text-rose-700 text-xs font-semibold ml-2">Preferences</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Membership / Stats Bar */}
      <View className="flex-row gap-3 mt-3">
        <View className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-4 items-center shadow-sm">
          <Text className="text-slate-500 text-xs font-medium">Super Interests</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">
            {membership?.superInterestsRemaining ?? 0}
          </Text>
        </View>
        <View className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-4 items-center shadow-sm">
          <Text className="text-slate-500 text-xs font-medium">Spotlights</Text>
          <Text className="text-slate-900 text-2xl font-bold mt-1">
            {membership?.spotlightsRemaining ?? 0}
          </Text>
        </View>
      </View>

      {/* Account & Privacy Settings List */}
      <View className="bg-white border border-slate-200/90 rounded-2xl mt-3 divide-y divide-slate-100 overflow-hidden shadow-sm mb-6">
        {/* Ghost Mode Toggle */}
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center flex-1 pr-3">
            <EyeOff size={18} color="#64748b" />
            <View className="ml-3">
              <Text className="text-slate-900 text-sm font-medium">Ghost Mode</Text>
              <Text className="text-slate-500 text-xs">Browse profiles completely invisibly</Text>
            </View>
          </View>
          <Switch
            value={!!profile?.ghostModeEnabled}
            onValueChange={handleToggleGhostMode}
            trackColor={{ false: "#e2e8f0", true: "#e11d48" }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Photo Privacy Toggle */}
        <TouchableOpacity
          onPress={handleTogglePhotoVisibility}
          className="flex-row items-center justify-between p-4 active:bg-slate-50"
        >
          <View className="flex-row items-center flex-1 pr-3">
            <Shield size={18} color="#64748b" />
            <View className="ml-3">
              <Text className="text-slate-900 text-sm font-medium">Photo Privacy</Text>
              <Text className="text-slate-500 text-xs">
                {profile?.photoVisibility === "ALL_MEMBERS"
                  ? "Visible to all verified members"
                  : "Blurred until mutual interest accepted"}
              </Text>
            </View>
          </View>
          <View className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <Text className="text-rose-600 text-xs font-semibold">
              {profile?.photoVisibility === "ALL_MEMBERS" ? "Public" : "Blurred"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loggingOut}
          className="flex-row items-center p-4 active:bg-slate-50"
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color="#e11d48" />
          ) : (
            <>
              <LogOut size={18} color="#e11d48" />
              <Text className="text-rose-600 text-sm font-semibold ml-3">
                Log Out
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={editProfileOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white border-t border-slate-200 rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
              <Text className="text-slate-900 text-lg font-bold">Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileOpen(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              {saveMessage && (
                <View className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-3">
                  <Text className="text-emerald-800 text-xs font-semibold">{saveMessage}</Text>
                </View>
              )}

              <Text className="text-slate-700 text-xs font-semibold mb-1">Display Name</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm mb-3"
              />

              <Text className="text-slate-700 text-xs font-semibold mb-1">Bio / About Me</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                placeholder="Share a bit about yourself..."
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm mb-3 min-h-[70px]"
                textAlignVertical="top"
              />

              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-slate-700 text-xs font-semibold mb-1">City</Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-700 text-xs font-semibold mb-1">State</Text>
                  <TextInput
                    value={stateName}
                    onChangeText={setStateName}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm"
                  />
                </View>
              </View>

              <Text className="text-slate-700 text-xs font-semibold mb-1">Profession</Text>
              <TextInput
                value={profession}
                onChangeText={setProfession}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm mb-3"
              />

              <Text className="text-slate-700 text-xs font-semibold mb-1">Diet</Text>
              <TextInput
                value={diet}
                onChangeText={setDiet}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm mb-4"
              />

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={updating}
                className="bg-rose-600 py-3.5 rounded-xl items-center active:bg-rose-700 shadow-xs mb-4"
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-sm">Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Preferences Modal */}
      <Modal visible={preferencesOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white border-t border-slate-200 rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
              <Text className="text-slate-900 text-lg font-bold">Partner Preferences</Text>
              <TouchableOpacity onPress={() => setPreferencesOpen(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
              {saveMessage && (
                <View className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl mb-3">
                  <Text className="text-emerald-800 text-xs font-semibold">{saveMessage}</Text>
                </View>
              )}

              <Text className="text-slate-700 text-xs font-semibold mb-1">Age Range</Text>
              <View className="flex-row items-center gap-3 mb-4">
                <TextInput
                  value={prefMinAge}
                  onChangeText={setPrefMinAge}
                  keyboardType="numeric"
                  placeholder="Min"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm text-center"
                />
                <Text className="text-slate-400 font-bold">to</Text>
                <TextInput
                  value={prefMaxAge}
                  onChangeText={setPrefMaxAge}
                  keyboardType="numeric"
                  placeholder="Max"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm text-center"
                />
              </View>

              <TouchableOpacity
                onPress={handleSavePreferences}
                disabled={updating}
                className="bg-rose-600 py-3.5 rounded-xl items-center active:bg-rose-700 shadow-xs mb-4"
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-sm">Update Preferences</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
