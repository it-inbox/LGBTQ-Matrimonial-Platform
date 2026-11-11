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
  Heart,
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

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  // Toggle Ghost Mode
  const handleToggleGhostMode = async (value: boolean) => {
    try {
      const res = await api.patch("/profiles/me/privacy", {
        ghostModeEnabled: value,
      });
      setProfile({ ...profile!, ghostModeEnabled: value });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
    } catch (err: any) {
      alert("Failed to update Ghost Mode: " + (err.response?.data?.message || err.message));
    }
  };

  // Toggle Photo Visibility
  const handleTogglePhotoVisibility = async () => {
    const nextVis =
      profile?.photoVisibility === "ALL_MEMBERS"
        ? "MUTUAL_MATCHES_ONLY"
        : "ALL_MEMBERS";
    try {
      await api.patch("/profiles/me/privacy", {
        photoVisibility: nextVis,
      });
      setProfile({ ...profile!, photoVisibility: nextVis });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myProfile });
    } catch (err: any) {
      alert("Failed to update Photo Privacy: " + (err.response?.data?.message || err.message));
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
          {profile?.city || "Location not set"}, {profile?.state || ""} • {profile?.orientation || "LGBTQ+"}
        </Text>

        {profile?.bio && (
          <Text className="text-slate-300 text-xs text-center mt-2 px-4 italic leading-4">
            "{profile.bio}"
          </Text>
        )}

        {/* Membership Badge */}
        <View className="flex-row items-center bg-brand-500/10 border border-brand-500/30 px-3 py-1.5 rounded-full mt-3">
          <Crown size={14} color="#f43f5e" />
          <Text className="text-brand-400 text-xs font-semibold ml-1.5">
            {membership?.planName || "Free Plan"}
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <View className="flex-row gap-3 mt-4 w-full">
          <TouchableOpacity
            onPress={() => setEditProfileOpen(true)}
            className="flex-1 bg-slate-800 border border-slate-700 py-2.5 rounded-xl flex-row items-center justify-center"
          >
            <Edit3 size={15} color="#cbd5e1" />
            <Text className="text-slate-200 text-xs font-semibold ml-2">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPreferencesOpen(true)}
            className="flex-1 bg-brand-600/20 border border-brand-500/40 py-2.5 rounded-xl flex-row items-center justify-center"
          >
            <Sliders size={15} color="#f43f5e" />
            <Text className="text-brand-300 text-xs font-semibold ml-2">Preferences</Text>
          </TouchableOpacity>
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

      {/* Account & Privacy Settings List */}
      <View className="bg-slate-900 border border-slate-800 rounded-2xl mt-4 divide-y divide-slate-800 overflow-hidden">
        {/* Ghost Mode Toggle */}
        <View className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center flex-1 pr-3">
            <EyeOff size={18} color="#94a3b8" />
            <View className="ml-3">
              <Text className="text-slate-200 text-sm font-medium">Ghost Mode</Text>
              <Text className="text-slate-500 text-xs">Browse profiles completely invisibly</Text>
            </View>
          </View>
          <Switch
            value={!!profile?.ghostModeEnabled}
            onValueChange={handleToggleGhostMode}
            trackColor={{ false: "#334155", true: "#f43f5e" }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Photo Privacy Toggle */}
        <TouchableOpacity
          onPress={handleTogglePhotoVisibility}
          className="flex-row items-center justify-between p-4"
        >
          <View className="flex-row items-center flex-1 pr-3">
            <Shield size={18} color="#94a3b8" />
            <View className="ml-3">
              <Text className="text-slate-200 text-sm font-medium">Photo Privacy</Text>
              <Text className="text-slate-500 text-xs">
                {profile?.photoVisibility === "ALL_MEMBERS"
                  ? "Visible to all verified members"
                  : "Blurred until mutual interest accepted"}
              </Text>
            </View>
          </View>
          <View className="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            <Text className="text-brand-400 text-xs font-semibold">
              {profile?.photoVisibility === "ALL_MEMBERS" ? "Public" : "Blurred"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Logout */}
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

      {/* Edit Profile Modal */}
      <Modal visible={editProfileOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-800">
              <Text className="text-white text-lg font-bold">Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView className="mt-4 space-y-4">
              <View>
                <Text className="text-slate-300 text-xs font-medium mb-1">Display Name</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                  placeholder="Your Name"
                  placeholderTextColor="#64748b"
                />
              </View>

              <View className="mt-3">
                <Text className="text-slate-300 text-xs font-medium mb-1">Bio / About Me</Text>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={3}
                  className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm h-20"
                  placeholder="Share a bit about yourself..."
                  placeholderTextColor="#64748b"
                />
              </View>

              <View className="flex-row gap-3 mt-3">
                <View className="flex-1">
                  <Text className="text-slate-300 text-xs font-medium mb-1">City</Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                    placeholder="e.g. Mumbai"
                    placeholderTextColor="#64748b"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-300 text-xs font-medium mb-1">State</Text>
                  <TextInput
                    value={stateName}
                    onChangeText={setStateName}
                    className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                    placeholder="e.g. Maharashtra"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              <View className="mt-3">
                <Text className="text-slate-300 text-xs font-medium mb-1">Profession</Text>
                <TextInput
                  value={profession}
                  onChangeText={setProfession}
                  className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                  placeholder="e.g. Architect, Software Engineer"
                  placeholderTextColor="#64748b"
                />
              </View>

              <View className="mt-3">
                <Text className="text-slate-300 text-xs font-medium mb-1">Diet</Text>
                <TextInput
                  value={diet}
                  onChangeText={setDiet}
                  className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-sm"
                  placeholder="e.g. Vegetarian, Non-Vegetarian, Vegan"
                  placeholderTextColor="#64748b"
                />
              </View>

              {saveMessage && (
                <Text className="text-brand-400 text-xs text-center mt-3 font-medium">
                  {saveMessage}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={updating}
                className="bg-brand-600 p-4 rounded-xl items-center mt-5 mb-4"
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold">Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Partner Preferences Modal */}
      <Modal visible={preferencesOpen} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-800">
              <Text className="text-white text-lg font-bold">Partner Preferences</Text>
              <TouchableOpacity onPress={() => setPreferencesOpen(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView className="mt-4 space-y-4">
              <Text className="text-slate-400 text-xs">
                Matches feed will automatically adjust based on your age and identity preferences.
              </Text>

              {/* Age Range */}
              <View className="mt-3">
                <Text className="text-slate-300 text-xs font-medium mb-2">Age Range</Text>
                <View className="flex-row items-center gap-3">
                  <View className="flex-1">
                    <Text className="text-slate-400 text-[10px] mb-1">Min Age</Text>
                    <TextInput
                      value={prefMinAge}
                      onChangeText={setPrefMinAge}
                      keyboardType="numeric"
                      className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-center font-bold"
                    />
                  </View>
                  <Text className="text-slate-400 font-bold mt-4">to</Text>
                  <View className="flex-1">
                    <Text className="text-slate-400 text-[10px] mb-1">Max Age</Text>
                    <TextInput
                      value={prefMaxAge}
                      onChangeText={setPrefMaxAge}
                      keyboardType="numeric"
                      className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 text-center font-bold"
                    />
                  </View>
                </View>
              </View>

              {/* Preferred Genders */}
              <View className="mt-4">
                <Text className="text-slate-300 text-xs font-medium mb-2">Interested In Genders</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { label: "Men", value: "MAN" },
                    { label: "Women", value: "WOMAN" },
                    { label: "Non-Binary", value: "NON_BINARY" },
                    { label: "Trans Men", value: "TRANSGENDER_MAN" },
                    { label: "Trans Women", value: "TRANSGENDER_WOMAN" },
                  ].map((item) => {
                    const isSelected = prefGenders.includes(item.value);
                    return (
                      <TouchableOpacity
                        key={item.value}
                        onPress={() => {
                          if (isSelected) {
                            if (prefGenders.length > 1) {
                              setPrefGenders(prefGenders.filter((g) => g !== item.value));
                            }
                          } else {
                            setPrefGenders([...prefGenders, item.value]);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl border text-xs ${
                          isSelected
                            ? "bg-brand-600/30 border-brand-500"
                            : "bg-slate-800 border-slate-700"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            isSelected ? "text-brand-300 font-bold" : "text-slate-300"
                          }`}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Preferred Orientations */}
              <View className="mt-4">
                <Text className="text-slate-300 text-xs font-medium mb-2">Orientations</Text>
                <View className="flex-row flex-wrap gap-2">
                  {["GAY", "LESBIAN", "BISEXUAL", "PANSEXUAL", "QUEER"].map((orient) => {
                    const isSelected = prefOrientations.includes(orient);
                    return (
                      <TouchableOpacity
                        key={orient}
                        onPress={() => {
                          if (isSelected) {
                            if (prefOrientations.length > 1) {
                              setPrefOrientations(prefOrientations.filter((o) => o !== orient));
                            }
                          } else {
                            setPrefOrientations([...prefOrientations, orient]);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl border text-xs ${
                          isSelected
                            ? "bg-brand-600/30 border-brand-500"
                            : "bg-slate-800 border-slate-700"
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            isSelected ? "text-brand-300 font-bold" : "text-slate-300"
                          }`}
                        >
                          {orient}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {saveMessage && (
                <Text className="text-brand-400 text-xs text-center mt-3 font-medium">
                  {saveMessage}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleSavePreferences}
                disabled={updating}
                className="bg-brand-600 p-4 rounded-xl items-center mt-5 mb-4"
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold">Apply Preferences</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
