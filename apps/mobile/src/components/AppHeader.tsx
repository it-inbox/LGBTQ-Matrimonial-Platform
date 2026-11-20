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
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { PartnerPreferencesScreen } from "../screens/PartnerPreferencesScreen";
import { PrivacySafeguardsScreen } from "../screens/PrivacySafeguardsScreen";
import { ProfileDetailScreen } from "../screens/ProfileDetailScreen";

interface AppHeaderProps {
  onOpenOnboarding?: () => void;
  onNavigateToChat?: (partnerId: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenOnboarding, onNavigateToChat }) => {
  const { profile, logout, fetchProfile } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sub-modals for drawer actions
  const [activeModal, setActiveModal] = useState<
    "view-profile" | "edit-profile" | "partner-pref" | "safety" | "help" | "stories" | "upgrade" | null
  >(null);

  const primaryPhoto =
    profile?.photos?.find((p: any) => p.isPrimary) || profile?.photos?.[0];
  const primaryPhotoUrl = primaryPhoto?.originalUrl || primaryPhoto?.url;

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
              {/* Profile Card Header (Clickable to view full profile) */}
              <TouchableOpacity
                onPress={() => {
                  setDrawerOpen(false);
                  setActiveModal("view-profile");
                }}
                className="flex-row items-center gap-3.5 mb-5 active:opacity-80"
              >
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
                  <Text className="text-xs text-rose-600 font-semibold mt-0.5">
                    View & Preview Profile →
                  </Text>
                </View>
              </TouchableOpacity>

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
                    label: "View My Profile",
                    icon: User,
                    onPress: () => {
                      setDrawerOpen(false);
                      setActiveModal("view-profile");
                    },
                  },
                  {
                    label: "Edit Profile",
                    icon: Edit3,
                    onPress: () => {
                      setDrawerOpen(false);
                      setActiveModal("edit-profile");
                    },
                  },
                  {
                    label: "Looking For (Preferences)",
                    icon: Heart,
                    onPress: () => {
                      setDrawerOpen(false);
                      setActiveModal("partner-pref");
                    },
                  },
                  {
                    label: "Privacy Safeguards",
                    icon: ShieldCheck,
                    onPress: () => {
                      setDrawerOpen(false);
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

      {/* Modal: View My Profile Screen */}
      <ProfileDetailScreen
        userId={profile?.userId || profile?.id || null}
        visible={activeModal === "view-profile"}
        onClose={() => setActiveModal(null)}
        onNavigateToChat={onNavigateToChat}
      />

      {/* Modal: Edit Profile (Full Screen Recreated from Web) */}
      <EditProfileScreen
        visible={activeModal === "edit-profile"}
        onClose={() => setActiveModal(null)}
      />

      {/* Modal: Partner Preferences (Dedicated Screen) */}
      <PartnerPreferencesScreen
        visible={activeModal === "partner-pref"}
        onClose={() => setActiveModal(null)}
      />

      {/* Modal: Privacy Safeguards (Dedicated Screen) */}
      <PrivacySafeguardsScreen
        visible={activeModal === "safety"}
        onClose={() => setActiveModal(null)}
      />

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
