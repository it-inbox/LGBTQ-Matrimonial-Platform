import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import { useAuthStore } from "../stores/auth.store";
import {
  Heart,
  Star,
  X,
  MessageCircle,
  Briefcase,
  MapPin,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  AlertCircle,
  UserCheck,
} from "lucide-react-native";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export const DiscoverScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interestModalVisible, setInterestModalVisible] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [activeProfile, setActiveProfile] = useState<any | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Fetch feed matches
  const { data: feedResult, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.matchesFeed(1),
    queryFn: async () => {
      const res = await api.get("/matches/feed?page=1&limit=25");
      return res.data;
    },
  });

  const matches = feedResult?.data || (Array.isArray(feedResult) ? feedResult : []);
  const currentCard = matches[currentIndex];

  const sendInterestMutation = useMutation({
    mutationFn: async ({ targetUserId, message }: { targetUserId: string; message?: string }) => {
      return api.post("/matches/interest", { targetUserId, message });
    },
    onSuccess: () => {
      setActionNotice("Interest sent successfully! ❤️");
      setInterestModalVisible(false);
      setCustomMessage("");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matchesFeed() });
      setTimeout(() => setActionNotice(null), 3000);
      handleNext();
    },
  });

  const handleNext = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const openInterestModal = (profile: any) => {
    setActiveProfile(profile);
    setInterestModalVisible(true);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator size="large" color="#f43f5e" />
        <Text className="text-slate-400 mt-4 font-medium">Finding genuine matches...</Text>
      </View>
    );
  }

  // Handle errors distinctly (e.g. Incomplete profile or network error)
  if (error) {
    const errorData = (error as any)?.response?.data;
    const isProfileIncomplete =
      errorData?.statusCode === 400 ||
      errorData?.message?.includes("complete your profile");

    return (
      <View className="flex-1 items-center justify-center bg-slate-950 px-6">
        <View className="w-16 h-16 rounded-full bg-brand-500/10 items-center justify-center mb-4 border border-brand-500/30">
          <AlertCircle size={32} color="#f43f5e" />
        </View>
        <Text className="text-white text-xl font-bold text-center">
          {isProfileIncomplete
            ? "Complete Your Profile First"
            : "Unable to Load Matches"}
        </Text>
        <Text className="text-slate-400 text-sm mt-2 text-center leading-5">
          {errorData?.message ||
            "We encountered an issue loading your matches. Please check your connection and try again."}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="mt-6 bg-brand-600 px-6 py-3 rounded-full flex-row items-center"
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950 px-6">
        <Sparkles size={48} color="#f43f5e" />
        <Text className="text-white text-xl font-bold mt-4 text-center">
          You've reviewed all available profiles!
        </Text>
        <Text className="text-slate-400 text-sm mt-2 text-center">
          Check back later or adjust your filters for new matches.
        </Text>
        <TouchableOpacity
          onPress={() => {
            setCurrentIndex(0);
            refetch();
          }}
          className="mt-6 bg-brand-600 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Start Over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryPhoto =
    currentCard.photos?.find((p: any) => p.isPrimary) ||
    currentCard.photos?.[0] ||
    null;

  const photoUrl = primaryPhoto?.url || primaryPhoto?.originalUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";

  return (
    <View className="flex-1 bg-slate-950">
      {/* Toast Banner */}
      {actionNotice && (
        <View className="absolute top-12 left-4 right-4 z-50 bg-emerald-600 px-4 py-3 rounded-xl shadow-lg items-center">
          <Text className="text-white font-semibold">{actionNotice}</Text>
        </View>
      )}

      {/* Profile Card Container (Single Immersion Card) */}
      <View className="flex-1 m-2 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative">
        {/* Profile Full Background Image */}
        <Image
          source={{ uri: photoUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />

        {/* Gradient / Dark Overlay for readability */}
        <View
          style={StyleSheet.absoluteFill}
          className="bg-gradient-to-t from-black via-black/40 to-transparent justify-between p-5"
        >
          {/* Top Header info (Counter & Status badge) */}
          <View className="flex-row items-center justify-between pt-6">
            <View className="bg-black/60 px-3 py-1.5 rounded-full flex-row items-center space-x-1.5 border border-white/10">
              <Layers size={13} color="#f43f5e" />
              <Text className="text-white text-xs font-semibold ml-1">
                {currentIndex + 1} / {matches.length}
              </Text>
            </View>

            {currentCard.user?.isVerified && (
              <View className="bg-emerald-500/80 px-2.5 py-1 rounded-full flex-row items-center">
                <Shield size={12} color="#ffffff" />
                <Text className="text-white text-xs font-medium ml-1">Verified</Text>
              </View>
            )}
          </View>

          {/* Bottom Profile Details & Action Bar */}
          <View className="pb-2">
            {/* Active badge */}
            <View className="bg-emerald-500/30 self-start px-2.5 py-0.5 rounded-full mb-2">
              <Text className="text-emerald-300 text-xs font-medium">Active Today</Text>
            </View>

            {/* Name & Age */}
            <Text className="text-white text-2xl font-bold tracking-tight">
              {currentCard.displayName}, {currentCard.age || "28"}
            </Text>

            {/* Basic Info Pills / Subtitle */}
            <View className="flex-row items-center flex-wrap gap-2 mt-1">
              {currentCard.heightCm && (
                <Text className="text-slate-200 text-xs font-medium">
                  {Math.floor(currentCard.heightCm / 30.48)}ft{" "}
                  {Math.round((currentCard.heightCm % 30.48) / 2.54)}in
                </Text>
              )}
              <Text className="text-slate-400 text-xs">•</Text>
              <Text className="text-slate-200 text-xs font-medium">
                {currentCard.city || "Mumbai"}, {currentCard.state || "India"}
              </Text>
              {currentCard.orientation && (
                <>
                  <Text className="text-slate-400 text-xs">•</Text>
                  <Text className="text-slate-200 text-xs font-medium">
                    {currentCard.orientation}
                  </Text>
                </>
              )}
            </View>

            {/* Career / Education details */}
            {currentCard.occupation && (
              <View className="flex-row items-center mt-2">
                <Briefcase size={14} color="#fda4af" />
                <Text className="text-slate-200 text-xs ml-1.5 font-normal">
                  {currentCard.occupation}
                </Text>
              </View>
            )}

            {currentCard.education && (
              <View className="flex-row items-center mt-1">
                <GraduationCap size={14} color="#fda4af" />
                <Text className="text-slate-200 text-xs ml-1.5 font-normal">
                  {currentCard.education}
                </Text>
              </View>
            )}

            {/* Bio snippet */}
            {currentCard.bio && (
              <Text
                numberOfLines={2}
                className="text-slate-300 text-xs mt-2 italic bg-black/40 p-2 rounded-lg"
              >
                "{currentCard.bio}"
              </Text>
            )}

            {/* Action Bar (Interest, Shortlist, Ignore, Chat) */}
            <View className="flex-row items-center justify-around mt-5 pt-3 border-t border-white/15">
              {/* Interest Button */}
              <TouchableOpacity
                onPress={() => openInterestModal(currentCard)}
                className="items-center"
              >
                <View className="w-12 h-12 rounded-full bg-brand-600 items-center justify-center shadow-lg shadow-brand-500/50">
                  <Heart size={22} color="#ffffff" fill="#ffffff" />
                </View>
                <Text className="text-white text-xs mt-1 font-medium">Interest</Text>
              </TouchableOpacity>

              {/* Shortlist Button */}
              <TouchableOpacity
                onPress={() => {
                  setActionNotice("Saved to Shortlist ⭐");
                  setTimeout(() => setActionNotice(null), 2500);
                }}
                className="items-center"
              >
                <View className="w-12 h-12 rounded-full bg-slate-800/80 items-center justify-center border border-white/20">
                  <Star size={20} color="#fbbf24" />
                </View>
                <Text className="text-slate-200 text-xs mt-1 font-medium">Shortlist</Text>
              </TouchableOpacity>

              {/* Ignore / Next Button */}
              <TouchableOpacity onPress={handleNext} className="items-center">
                <View className="w-12 h-12 rounded-full bg-slate-800/80 items-center justify-center border border-white/20">
                  <X size={20} color="#94a3b8" />
                </View>
                <Text className="text-slate-200 text-xs mt-1 font-medium">Ignore</Text>
              </TouchableOpacity>

              {/* Chat Button */}
              <TouchableOpacity
                onPress={() => openInterestModal(currentCard)}
                className="items-center"
              >
                <View className="w-12 h-12 rounded-full bg-slate-800/80 items-center justify-center border border-white/20">
                  <MessageCircle size={20} color="#38bdf8" />
                </View>
                <Text className="text-slate-200 text-xs mt-1 font-medium">Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Express Interest Modal */}
      <Modal
        visible={interestModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInterestModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-800">
              <Text className="text-white text-lg font-bold">
                Connect with {activeProfile?.displayName}
              </Text>
              <TouchableOpacity onPress={() => setInterestModalVisible(false)}>
                <X size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text className="text-slate-400 text-sm mt-3">
              Add a personal message to stand out:
            </Text>

            <TextInput
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="Hi! I loved your profile and would love to get to know you..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm mt-3 h-28"
              textAlignVertical="top"
            />

            <View className="flex-row gap-3 mt-5">
              <TouchableOpacity
                onPress={() => setInterestModalVisible(false)}
                className="flex-1 py-3 bg-slate-800 rounded-xl items-center"
              >
                <Text className="text-slate-300 font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (activeProfile?.userId) {
                    sendInterestMutation.mutate({
                      targetUserId: activeProfile.userId,
                      message: customMessage || undefined,
                    });
                  }
                }}
                disabled={sendInterestMutation.isPending}
                className="flex-1 py-3 bg-brand-600 rounded-xl items-center"
              >
                {sendInterestMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold">Send Interest</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
