import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import {
  Heart,
  X,
  MessageCircle,
  Briefcase,
  GraduationCap,
  AlertCircle,
  Lock,
  Search,
  Send,
  ChevronRight,
} from "lucide-react-native";

export const DiscoverScreen: React.FC<{ onOpenOnboarding?: () => void }> = ({
  onOpenOnboarding,
}) => {
  const queryClient = useQueryClient();

  // Search & quick filter state
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState("All");

  // Local ignored list so user can still tap "Ignore" to dismiss if they want
  const [ignoredProfileIds, setIgnoredProfileIds] = useState<string[]>([]);

  // Action notices / Modals
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<any | null>(null);
  const [interestModalVisible, setInterestModalVisible] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  // Fetch feed matches
  const {
    data: feedResult,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.matchesFeed(1),
      appliedSearchQuery,
      activeQuickFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: "1",
        limit: "25",
      });
      if (appliedSearchQuery) params.set("search", appliedSearchQuery);
      if (activeQuickFilter !== "All") params.set("quickFilter", activeQuickFilter);

      const res = await api.get(`/matches/feed?${params.toString()}`);
      return res.data;
    },
  });

  const rawMatches = feedResult?.data || (Array.isArray(feedResult) ? feedResult : []);
  const matches = rawMatches.filter(
    (profile: any) => !ignoredProfileIds.includes(profile.id || profile.userId)
  );

  const sendInterestMutation = useMutation({
    mutationFn: async ({
      targetUserId,
      message,
    }: {
      targetUserId: string;
      message?: string;
    }) => {
      return api.post("/matches/interest", { targetUserId, message });
    },
    onSuccess: () => {
      setActionNotice("Interest sent successfully! ❤️");
      setInterestModalVisible(false);
      setCustomMessage("");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matchesFeed() });
      setTimeout(() => setActionNotice(null), 3000);
    },
  });

  const requestPhotoMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return api.post("/matches/photo-access", { targetUserId });
    },
    onSuccess: () => {
      setActionNotice("Photo access requested! 📷");
      setTimeout(() => setActionNotice(null), 3000);
    },
  });

  const calculateAge = (dobString?: string | Date | null) => {
    if (!dobString) return null;
    const diff = Date.now() - new Date(dobString).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const openInterestModal = (profile: any) => {
    setActiveProfile(profile);
    setInterestModalVisible(true);
  };

  const handleSearchSubmit = () => {
    setAppliedSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setAppliedSearchQuery("");
  };

  const getOutnessBadge = (status?: string | null) => {
    switch (status) {
      case "DISCREET_NOT_OUT":
        return {
          label: "Discreet",
          bg: "bg-amber-100",
          text: "text-amber-800",
        };
      case "OUT_TO_SELECT_FEW":
        return {
          label: "Out to friends",
          bg: "bg-blue-100",
          text: "text-blue-800",
        };
      default:
        return {
          label: "Openly Out",
          bg: "bg-emerald-100",
          text: "text-emerald-800",
        };
    }
  };

  // Render an individual horizontal profile card matching the web-mobile design
  const renderProfileCard = ({ item }: { item: any }) => {
    const primaryPhoto =
      item.photos?.find((p: any) => p.isPrimary) || item.photos?.[0] || null;
    const photoUrl =
      primaryPhoto?.url ||
      primaryPhoto?.originalUrl ||
      primaryPhoto?.blurredUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

    const isBlurred = primaryPhoto?.isBlurred ?? false;
    const age = calculateAge(item.dateOfBirth) || item.age;
    const outness = getOutnessBadge(item.outnessStatus);

    return (
      <View className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm mb-4">
        {/* Card Body: Row layout */}
        <View className="flex-row h-64">
          {/* Left Photo Container: fixed width, full height */}
          <View className="w-36 h-full relative bg-slate-100 overflow-hidden">
            <Image
              source={{ uri: photoUrl }}
              className="w-full h-full"
              contentFit="cover"
              blurRadius={isBlurred ? 24 : 0}
            />

            {/* Outness Badge (Top Right of Photo) */}
            {item.outnessStatus && (
              <View
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full ${outness.bg}`}
              >
                <Text className={`text-[10px] font-bold ${outness.text}`}>
                  {outness.label}
                </Text>
              </View>
            )}

            {/* Photo Protected Vignette */}
            {isBlurred && (
              <View className="absolute inset-0 bg-slate-950/45 items-center justify-center p-2">
                <View className="w-8 h-8 rounded-xl bg-white/20 items-center justify-center mb-1">
                  <Lock size={14} color="#ffffff" />
                </View>
                <Text className="text-white text-[10px] font-bold text-center">
                  Photo Protected
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const targetId = item.userId || item.id;
                    if (targetId) requestPhotoMutation.mutate(targetId);
                  }}
                  className="mt-2 px-2.5 py-1 rounded-full bg-white active:bg-slate-100"
                >
                  <Text className="text-slate-900 text-[10px] font-bold">
                    Request Unblur
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Right Details Container */}
          <View className="p-3.5 flex-1 min-w-0 justify-between">
            <View>
              {/* Active Today status */}
              <Text className="text-slate-500 text-[11px] font-semibold mb-1">
                Active Today
              </Text>

              {/* Name & Age with Web Typography */}
              <Text
                numberOfLines={1}
                className="text-base font-bold text-slate-900 tracking-tight"
              >
                {item.displayName}
                {age ? (
                  <Text className="font-medium text-slate-600">, {age}</Text>
                ) : null}
                {item.pronouns ? (
                  <Text className="text-xs font-normal text-slate-400">
                    {" "}
                    ({item.pronouns})
                  </Text>
                ) : null}
              </Text>

              {/* Gender & Orientation */}
              <Text
                numberOfLines={1}
                className="text-xs font-semibold text-rose-600 uppercase mt-0.5"
              >
                {item.gender?.replace(/_/g, " ") || "MAN"} •{" "}
                {item.orientation || "GAY"}
              </Text>

              {/* Location & Religion */}
              <Text
                numberOfLines={1}
                className="text-xs text-slate-600 font-medium mt-1.5"
              >
                {item.heightCm
                  ? `${Math.floor(item.heightCm / 30.48)}ft ${Math.round(
                      (item.heightCm % 30.48) / 2.54
                    )}in • `
                  : ""}
                {[item.city, item.state].filter(Boolean).join(", ") || "India"}
                {item.religion ? ` • ${item.religion}` : ""}
              </Text>

              {/* Profession & Income */}
              <View className="flex-row items-center mt-1">
                <Briefcase size={12} color="#94a3b8" />
                <Text
                  numberOfLines={1}
                  className="text-xs text-slate-600 ml-1.5 flex-1"
                >
                  {item.profession || item.occupation || "Professional"}
                  {item.annualIncome ? ` • ${item.annualIncome}` : ""}
                </Text>
              </View>

              {/* Education & Marital Status */}
              <View className="flex-row items-center mt-1">
                <GraduationCap size={12} color="#94a3b8" />
                <Text
                  numberOfLines={1}
                  className="text-xs text-slate-600 ml-1.5 flex-1"
                >
                  {item.education || "Graduate"}
                  {item.maritalStatus ? ` • ${item.maritalStatus}` : ""}
                </Text>
              </View>

              {/* Bio snippet */}
              {item.bio ? (
                <Text
                  numberOfLines={1}
                  className="text-[11px] text-slate-500 italic mt-1"
                >
                  "{item.bio}"
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Bottom Actions Footer: Interest, Ignore, Chat */}
        <View className="flex-row border-t border-rose-100 bg-rose-50/50 h-11 items-center">
          <TouchableOpacity
            onPress={() => openInterestModal(item)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2"
          >
            <Send size={13} color="#e11d48" />
            <Text className="text-rose-600 font-bold text-xs">Interest</Text>
          </TouchableOpacity>

          <View className="w-px h-6 bg-rose-200/80" />

          <TouchableOpacity
            onPress={() => {
              const id = item.id || item.userId;
              setIgnoredProfileIds((prev) => [...prev, id]);
              setActionNotice(`Ignored ${item.displayName}`);
              setTimeout(() => setActionNotice(null), 2500);
            }}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2"
          >
            <X size={14} color="#e11d48" />
            <Text className="text-rose-600 font-bold text-xs">Ignore</Text>
          </TouchableOpacity>

          <View className="w-px h-6 bg-rose-200/80" />

          <TouchableOpacity
            onPress={() => openInterestModal(item)}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2"
          >
            <MessageCircle size={14} color="#e11d48" />
            <Text className="text-rose-600 font-bold text-xs">Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#e11d48" />
        <Text className="text-slate-500 mt-4 font-medium text-sm">
          Loading EverPride matches...
        </Text>
      </View>
    );
  }

  if (error) {
    const errorData = (error as any)?.response?.data;
    const isProfileIncomplete =
      errorData?.statusCode === 400 ||
      errorData?.message?.includes("complete your profile");

    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <View className="w-16 h-16 rounded-full bg-rose-100 items-center justify-center mb-4 border border-rose-200">
          <AlertCircle size={32} color="#e11d48" />
        </View>
        <Text className="text-slate-900 text-xl font-bold text-center">
          {isProfileIncomplete
            ? "Complete Your Profile First"
            : "Unable to Load Matches"}
        </Text>
        <Text className="text-slate-500 text-sm mt-2 text-center leading-5">
          {errorData?.message ||
            "We encountered an issue loading your matches. Please check your connection and try again."}
        </Text>
        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-white px-5 py-3 rounded-full flex-row items-center border border-slate-300"
          >
            <Text className="text-slate-800 font-semibold">Try Again</Text>
          </TouchableOpacity>
          {isProfileIncomplete && onOpenOnboarding && (
            <TouchableOpacity
              onPress={onOpenOnboarding}
              className="bg-rose-600 px-5 py-3 rounded-full flex-row items-center"
            >
              <Text className="text-white font-semibold">Create Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Toast Banner */}
      {actionNotice && (
        <View className="absolute top-4 left-4 right-4 z-50 bg-emerald-600 px-4 py-3 rounded-xl shadow-lg items-center">
          <Text className="text-white font-semibold text-xs">{actionNotice}</Text>
        </View>
      )}

      {/* Header Search & Quick Filter Bar */}
      <View className="bg-white border-b border-slate-200/90 px-4 pt-3 pb-3">
        {/* Search input with button */}
        <View className="flex-row items-center bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
          <Search size={15} color="#94a3b8" />
          <TextInput
            placeholder="Search by Name, City, State, Country, Nationality, Religi"
            placeholderTextColor="#94a3b8"
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            className="flex-1 text-xs text-slate-900 ml-2 py-0"
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} className="p-1 mr-1">
              <X size={14} color="#64748b" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSearchSubmit}
            className="bg-rose-600 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-white font-bold text-xs">Search</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Filter Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2.5 flex-row"
        >
          {["All", "Nearby", "With Photos", "Recently Active"].map((pill) => {
            const isSelected = activeQuickFilter === pill;
            return (
              <TouchableOpacity
                key={pill}
                onPress={() => setActiveQuickFilter(pill)}
                className={`px-3.5 py-1.5 rounded-full mr-2 ${
                  isSelected
                    ? "bg-slate-900"
                    : "bg-slate-100 border border-slate-200"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-white" : "text-slate-600"
                  }`}
                >
                  {pill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Scrollable Profiles Feed with Web Parity Scrollbar */}
      <FlatList
        data={matches}
        keyExtractor={(item) => String(item.id || item.userId)}
        renderItem={renderProfileCard}
        className="flex-1"
        showsVerticalScrollIndicator={true}
        indicatorStyle="black"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor="#e11d48"
            colors={["#e11d48"]}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-6">
            <Heart size={44} color="#cbd5e1" />
            <Text className="text-slate-800 text-base font-bold mt-3 text-center">
              No matching profiles found
            </Text>
            <Text className="text-slate-500 text-xs mt-1 text-center max-w-xs leading-4">
              Try adjusting your search or check back soon as more verified members
              join.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIgnoredProfileIds([]);
                setSearchInput("");
                setAppliedSearchQuery("");
                setActiveQuickFilter("All");
                refetch();
              }}
              className="mt-5 bg-rose-600 px-5 py-2.5 rounded-full"
            >
              <Text className="text-white text-xs font-semibold">
                Reset Feed
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Express Interest / Message Modal */}
      <Modal
        visible={interestModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInterestModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white border-t border-slate-200 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
              <Text className="text-slate-900 text-base font-bold">
                Connect with {activeProfile?.displayName}
              </Text>
              <TouchableOpacity onPress={() => setInterestModalVisible(false)}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-600 text-xs mt-3">
              Add a personal note to stand out:
            </Text>

            <TextInput
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Hi! I came across your profile and would love to get to know you..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs mt-2.5 h-24"
              textAlignVertical="top"
            />

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setInterestModalVisible(false)}
                className="flex-1 py-3 bg-slate-100 rounded-xl items-center"
              >
                <Text className="text-slate-600 font-semibold text-xs">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const targetId = activeProfile?.userId || activeProfile?.id;
                  if (targetId) {
                    sendInterestMutation.mutate({
                      targetUserId: targetId,
                      message: customMessage || undefined,
                    });
                  }
                }}
                disabled={sendInterestMutation.isPending}
                className="flex-1 py-3 bg-rose-600 rounded-xl items-center"
              >
                {sendInterestMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold text-xs">
                    Send Interest
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
