import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import {
  Heart,
  Menu,
  X,
  ChevronRight,
  Edit3,
  ShieldCheck,
  Headphones,
  MessageSquareQuote,
  LogOut,
  User,
} from "lucide-react-native";
import { useAuthStore } from "../stores/auth.store";
import { api } from "../lib/api";

interface AppHeaderProps {
  onOpenOnboarding?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenOnboarding }) => {
  const { profile, logout, fetchProfile } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sub-modals for drawer actions
  const [activeModal, setActiveModal] = useState<
    "edit-profile" | "partner-pref" | "safety" | "help" | "stories" | "upgrade" | null
  >(null);

  // Edit profile state
  const [editDisplayName, setEditDisplayName] = useState(profile?.displayName || "");
  const [editBio, setEditBio] = useState(profile?.bio || "");
  const [editCity, setEditCity] = useState(profile?.city || "");
  const [editState, setEditState] = useState(profile?.state || "");
  const [editSaving, setEditSaving] = useState(false);

  // Partner preferences state
  const [prefMinAge, setPrefMinAge] = useState(
    String(profile?.partnerPreference?.minAge ?? 21)
  );
  const [prefMaxAge, setPrefMaxAge] = useState(
    String(profile?.partnerPreference?.maxAge ?? 45)
  );
  const [prefSaving, setPrefSaving] = useState(false);

  // Safety settings
  const [photoPrivacy, setPhotoPrivacy] = useState<"PUBLIC" | "BLURRED_FOR_ALL" | "MEMBERS_ONLY">(
    ((profile as any)?.photoPrivacySetting as any) || "PUBLIC"
  );
  const [safetySaving, setSafetySaving] = useState(false);

  const primaryPhoto =
    profile?.photos?.find((p: any) => p.isPrimary) || profile?.photos?.[0];
  const primaryPhotoUrl = primaryPhoto?.originalUrl || primaryPhoto?.url;

  const handleSaveProfile = async () => {
    setEditSaving(true);
    try {
      await api.patch("/profiles/me", {
        displayName: editDisplayName.trim(),
        bio: editBio.trim(),
        city: editCity.trim(),
        state: editState.trim(),
      });
      await fetchProfile();
      setActiveModal(null);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to update profile");
    } finally {
      setEditSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setPrefSaving(true);
    try {
      await api.patch("/profiles/me/preferences", {
        minAge: parseInt(prefMinAge, 10) || 18,
        maxAge: parseInt(prefMaxAge, 10) || 60,
      });
      await fetchProfile();
      setActiveModal(null);
      Alert.alert("Success", "Partner preferences updated!");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to update preferences");
    } finally {
      setPrefSaving(false);
    }
  };

  const handleSaveSafety = async () => {
    setSafetySaving(true);
    try {
      await api.patch("/profiles/me/privacy-settings", {
        photoPrivacySetting: photoPrivacy,
      });
      await fetchProfile();
      setActiveModal(null);
      Alert.alert("Success", "Privacy settings saved!");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to update privacy");
    } finally {
      setSafetySaving(false);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <View className="h-16 px-4 bg-white border-b border-slate-200/90 flex-row items-center justify-between z-20">
        {/* Brand Logo with Rainbow Border */}
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-xl bg-rose-600 p-0.5 shadow-xs items-center justify-center">
            <View className="w-full h-full bg-white rounded-[9px] items-center justify-center">
              <Heart size={18} color="#e11d48" fill="#e11d48" />
            </View>
          </View>
          <Text className="ml-2 text-xl font-extrabold tracking-tight text-slate-900">
            Ever<Text className="text-rose-600">Pride</Text>
          </Text>
        </View>

        {/* Hamburger Menu Button */}
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          className="p-2 rounded-xl text-slate-800"
          activeOpacity={0.7}
        >
          <Menu size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Expanded Hamburger Drawer Modal */}
      <Modal
        visible={drawerOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View className="flex-1 bg-slate-900/60 flex-row justify-end">
          {/* Backdrop click dismisser */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
            className="flex-1"
          />

          {/* Drawer content sliding from right */}
          <View className="w-80 max-w-[85%] h-full bg-white shadow-2xl flex-col justify-between">
            {/* Top Close Icon Button */}
            <TouchableOpacity
              onPress={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full z-10"
              activeOpacity={0.7}
            >
              <X size={20} color="#64748b" />
            </TouchableOpacity>

            {/* Scrollable Body */}
            <ScrollView className="flex-1 p-5 pt-7" showsVerticalScrollIndicator={false}>
              {/* Profile Card Header */}
              <View className="flex-row items-center gap-3.5 mb-5">
                <View className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-slate-200 items-center justify-center">
                  {primaryPhotoUrl ? (
                    <Image
                      source={{ uri: primaryPhotoUrl }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  ) : (
                    <User size={28} color="#94a3b8" />
                  )}
                </View>
                <View className="flex-1 pr-6">
                  <Text className="font-extrabold text-slate-900 text-lg leading-tight" numberOfLines={1}>
                    {profile?.displayName || "Member"}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    {profile?.city ? `${profile.city}, ${profile.state || ""}` : "Profile"}
                  </Text>
                </View>
              </View>

              {/* Upgrade Membership Card */}
              <View className="mb-4">
                <TouchableOpacity
                  onPress={() => {
                    setDrawerOpen(false);
                    setActiveModal("upgrade");
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#e12a4c] items-center justify-center shadow-xs"
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-sm">
                    Upgrade Membership
                  </Text>
                </TouchableOpacity>
                <Text className="text-center text-[11px] font-semibold text-slate-500 mt-1.5">
                  Flat 65% OFF till 02 Nov
                </Text>
              </View>

              {/* Divider */}
              <View className="h-px bg-slate-100 mb-2" />

              {/* Navigation List Items */}
              <View className="space-y-1">
                {[
                  {
                    label: "Edit Profile",
                    icon: Edit3,
                    onPress: () => {
                      setDrawerOpen(false);
                      setEditDisplayName(profile?.displayName || "");
                      setEditBio(profile?.bio || "");
                      setEditCity(profile?.city || "");
                      setEditState(profile?.state || "");
                      setActiveModal("edit-profile");
                    },
                  },
                  {
                    label: "Partner Preferences",
                    icon: Heart,
                    onPress: () => {
                      setDrawerOpen(false);
                      setPrefMinAge(String(profile?.partnerPreference?.minAge ?? 21));
                      setPrefMaxAge(String(profile?.partnerPreference?.maxAge ?? 45));
                      setActiveModal("partner-pref");
                    },
                  },
                  {
                    label: "Safety Center",
                    icon: ShieldCheck,
                    onPress: () => {
                      setDrawerOpen(false);
                      setPhotoPrivacy(((profile as any)?.photoPrivacySetting as any) || "PUBLIC");
                      setActiveModal("safety");
                    },
                  },
                  {
                    label: "Help & Support",
                    icon: Headphones,
                    onPress: () => {
                      setDrawerOpen(false);
                      setActiveModal("help");
                    },
                  },
                  {
                    label: "Success Stories",
                    icon: MessageSquareQuote,
                    onPress: () => {
                      setDrawerOpen(false);
                      setActiveModal("stories");
                    },
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={item.onPress}
                      className="w-full flex-row items-center justify-between py-3 px-2 rounded-xl"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center gap-3">
                        <Icon size={18} color="#64748b" />
                        <Text className="text-sm font-medium text-slate-800">
                          {item.label}
                        </Text>
                      </View>
                      <ChevronRight size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Bottom Actions: Log Out */}
            <View className="p-4 border-t border-slate-100 bg-slate-50/50">
              <TouchableOpacity
                onPress={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="w-full flex-row items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white"
                activeOpacity={0.8}
              >
                <LogOut size={16} color="#e11d48" />
                <Text className="font-bold text-xs text-rose-600">Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Edit Profile */}
      <Modal
        visible={activeModal === "edit-profile"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-white">
          <View className="px-5 py-4 border-b border-slate-200 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900">Edit Profile</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 p-5 space-y-4">
            <View>
              <Text className="text-xs font-bold text-slate-700 uppercase mb-1">
                Display Name
              </Text>
              <TextInput
                value={editDisplayName}
                onChangeText={setEditDisplayName}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900"
                placeholder="Your name"
              />
            </View>
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-700 uppercase mb-1">
                About Me
              </Text>
              <TextInput
                value={editBio}
                onChangeText={setEditBio}
                multiline
                numberOfLines={3}
                className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900"
                placeholder="Tell others about yourself..."
              />
            </View>
            <View className="mt-3 flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 uppercase mb-1">
                  City
                </Text>
                <TextInput
                  value={editCity}
                  onChangeText={setEditCity}
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900"
                  placeholder="City"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 uppercase mb-1">
                  State
                </Text>
                <TextInput
                  value={editState}
                  onChangeText={setEditState}
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900"
                  placeholder="State"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={editSaving}
              className="mt-6 w-full py-3 rounded-xl bg-rose-600 items-center justify-center"
            >
              <Text className="text-white font-bold text-sm">
                {editSaving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Partner Preferences */}
      <Modal
        visible={activeModal === "partner-pref"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-white">
          <View className="px-5 py-4 border-b border-slate-200 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900">Partner Preferences</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 p-5 space-y-4">
            <Text className="text-sm text-slate-600 mb-2">
              Set your ideal partner age criteria for match discovery recommendations.
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 uppercase mb-1">
                  Min Age
                </Text>
                <TextInput
                  value={prefMinAge}
                  onChangeText={setPrefMinAge}
                  keyboardType="numeric"
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-700 uppercase mb-1">
                  Max Age
                </Text>
                <TextInput
                  value={prefMaxAge}
                  onChangeText={setPrefMaxAge}
                  keyboardType="numeric"
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSavePreferences}
              disabled={prefSaving}
              className="mt-6 w-full py-3 rounded-xl bg-rose-600 items-center justify-center"
            >
              <Text className="text-white font-bold text-sm">
                {prefSaving ? "Saving..." : "Save Preferences"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Safety Center */}
      <Modal
        visible={activeModal === "safety"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-white">
          <View className="px-5 py-4 border-b border-slate-200 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900">Safety Center</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 p-5 space-y-4">
            <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
              Photo Privacy Setting
            </Text>
            {[
              {
                id: "PUBLIC",
                title: "Public to All",
                desc: "All verified members can view your photos normally.",
              },
              {
                id: "BLURRED_FOR_ALL",
                title: "Blurred for All",
                desc: "Photos are blurred until you approve an unblur request.",
              },
              {
                id: "MEMBERS_ONLY",
                title: "Connected Matches Only",
                desc: "Photos visible only to mutual matches you have accepted.",
              },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setPhotoPrivacy(opt.id as any)}
                className={`p-3.5 rounded-xl border mb-2 ${
                  photoPrivacy === opt.id
                    ? "border-rose-500 bg-rose-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <Text className="font-bold text-slate-800 text-sm">{opt.title}</Text>
                <Text className="text-xs text-slate-500 mt-1">{opt.desc}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleSaveSafety}
              disabled={safetySaving}
              className="mt-6 w-full py-3 rounded-xl bg-rose-600 items-center justify-center"
            >
              <Text className="text-white font-bold text-sm">
                {safetySaving ? "Saving..." : "Save Privacy Settings"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Help & Support */}
      <Modal
        visible={activeModal === "help"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-white">
          <View className="px-5 py-4 border-b border-slate-200 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900">Help & Support</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <View className="p-6">
            <Text className="text-base font-bold text-slate-800 mb-2">
              We're here for you
            </Text>
            <Text className="text-sm text-slate-600 leading-6 mb-4">
              If you experience harassment, encounter a suspicious profile, or need assistance with your account, our dedicated support team is available 24/7.
            </Text>
            <View className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 mb-4">
              <Text className="text-xs font-bold text-slate-500 uppercase">Support Email</Text>
              <Text className="text-sm font-semibold text-rose-600 mt-0.5">
                support@everpride.org
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Success Stories */}
      <Modal
        visible={activeModal === "stories"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-white">
          <View className="px-5 py-4 border-b border-slate-200 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900">Success Stories</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 p-5">
            <View className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 mb-4">
              <Text className="font-bold text-slate-800 text-sm">
                Aarav & Rohan (Mumbai)
              </Text>
              <Text className="text-xs text-slate-600 mt-1 leading-5">
                "We found love and mutual understanding on EverPride. The verified community gave us confidence and peace of mind."
              </Text>
            </View>
            <View className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 mb-4">
              <Text className="font-bold text-slate-800 text-sm">
                Maya & Ananya (Bengaluru)
              </Text>
              <Text className="text-xs text-slate-600 mt-1 leading-5">
                "Finding someone who shared the same life goals and family values was so simple. Celebrated our union with pride!"
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Upgrade Membership */}
      <Modal
        visible={activeModal === "upgrade"}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveModal(null)}
      >
        <View className="flex-1 bg-white">
          <View className="px-5 py-4 border-b border-slate-200 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900">Upgrade Membership</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <View className="p-6 items-center">
            <View className="w-16 h-16 rounded-full bg-rose-100 items-center justify-center mb-4">
              <Heart size={32} color="#e11d48" fill="#e11d48" />
            </View>
            <Text className="text-xl font-extrabold text-slate-900 text-center">
              EverPride Premium
            </Text>
            <Text className="text-xs font-semibold text-rose-600 mt-1 mb-4">
              Flat 65% OFF till 02 Nov
            </Text>
            <Text className="text-sm text-slate-600 text-center leading-6 mb-6">
              Unlock unlimited direct messaging, send unblur requests instantly, view profile visitors, and enjoy priority profile spotlight.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setActiveModal(null);
                Alert.alert("Premium", "Upgrade checkout flow simulated!");
              }}
              className="w-full py-3.5 rounded-xl bg-rose-600 items-center justify-center shadow-xs"
            >
              <Text className="text-white font-bold text-sm">Continue to Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
