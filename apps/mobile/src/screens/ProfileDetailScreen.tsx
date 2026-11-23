import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Share,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import { useAuthStore } from "../stores/auth.store";
import {
  ArrowLeft,
  Share2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Heart,
  MessageCircle,
  Ban,
  ShieldAlert,
  UserCheck,
  Check,
  ImageOff,
} from "lucide-react-native";

interface ProfileDetailScreenProps {
  userId: string | null;
  visible: boolean;
  onClose: () => void;
  onNavigateToChat?: (partnerId: string) => void;
  openedFromChat?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const ProfileDetailScreen: React.FC<ProfileDetailScreenProps> = ({
  userId,
  visible,
  onClose,
  onNavigateToChat,
  openedFromChat = false,
}) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const isOwn = currentUser?.id === userId;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // 1. Fetch Profile Details (Includes photo permissions and interaction state)
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.memberProfile(userId || ""),
    queryFn: async () => {
      if (!userId) return null;
      const res = await api.get(`/profiles/user/${userId}`);
      return res.data;
    },
    enabled: visible && !!userId,
  });

  // Interaction status comes packaged directly inside profile.interaction
  const interactionStatus = profile?.interaction;

  // Send Interest Mutation
  const sendInterestMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/matches/interest", {
        targetUserId: userId,
        message: "Hi, I'd like to connect with you on EverPride!",
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.memberProfile(userId || ""), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          interaction: {
            ...old.interaction,
            sentInterestStatus: data?.status || "PENDING",
            sentInterestId: data?.id,
            isMutualMatch: data?.status === "ACCEPTED" || old.interaction?.isMutualMatch,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sentInterests });
      queryClient.invalidateQueries({ queryKey: ["matches-feed"] });
      showToast("Interest sent successfully!");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to send interest");
    },
  });

  // Respond Interest Mutation
  const respondInterestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) => {
      const res = await api.post(`/matches/interest/${id}/respond`, { status });
      return res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.setQueryData(QUERY_KEYS.memberProfile(userId || ""), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          interaction: {
            ...old.interaction,
            receivedInterestStatus: vars.status,
            isMutualMatch: vars.status === "ACCEPTED" || old.interaction?.isMutualMatch,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receivedInterests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matchesRecent });
      showToast(vars.status === "ACCEPTED" ? "Interest accepted!" : "Interest declined");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to update interest");
    },
  });

  // Photo Access Mutation
  const requestPhotoMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/matches/photo-access", {
        targetUserId: userId,
        message: photoMessage || "Hi, I would love to see your photos on EverPride.",
      });
      return res.data;
    },
    onSuccess: () => {
      setIsPhotoModalOpen(false);
      setPhotoMessage("");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.memberProfile(userId || "") });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.interactionStatus(userId || "") });
      showToast("Photo access requested!");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to request access");
    },
  });

  // Block Mutation
  const blockMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/matches/block/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      setIsBlockModalOpen(false);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.memberProfile(userId || "") });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matchesRecent });
      showToast("Member has been blocked");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to block member");
    },
  });

  // Unblock Mutation
  const unblockMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/matches/unblock/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.memberProfile(userId || "") });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matchesRecent });
      showToast("Member unblocked successfully");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to unblock member");
    },
  });

  const calculateAge = (dobString?: string | Date | null) => {
    if (!dobString) return null;
    const diff = Date.now() - new Date(dobString).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${profile?.displayName}'s profile on EverPride!`,
      });
    } catch { }
  };

  if (!visible) return null;

  const age = calculateAge(profile?.dateOfBirth);
  const photos = profile?.photos || [];
  const currentPhoto = photos[activePhotoIdx] || photos[0];
  const isBlurred = currentPhoto?.isBlurred ?? false;

  const isMutualMatch = interactionStatus?.isMutualMatch || profile?.interaction?.isMutualMatch;
  const sentInterestStatus = interactionStatus?.sentInterestStatus || profile?.interaction?.sentInterestStatus;
  const receivedInterestStatus = interactionStatus?.receivedInterestStatus || profile?.interaction?.receivedInterestStatus;
  const photoAccessStatus = interactionStatus?.photoAccessStatus || profile?.interaction?.photoAccessStatus;
  const isBlockedByMe = interactionStatus?.isBlockedByMe || profile?.interaction?.isBlockedByMe;
  const hasBlockedMe = interactionStatus?.hasBlockedMe || profile?.interaction?.hasBlockedMe;
  const pref = profile?.partnerPreferences || profile?.partnerPreference;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View className="flex-1 bg-slate-50">
        {/* Toast Notice */}
        {actionNotice && (
          <View className="absolute top-12 left-4 right-4 z-50 bg-slate-900/90 px-4 py-3 rounded-2xl shadow-lg items-center">
            <Text className="text-white font-semibold text-xs text-center">{actionNotice}</Text>
          </View>
        )}

        {/* Top Stationary Navbar */}
        <View className="h-14 px-4 bg-white border-b border-slate-200/90 flex-row items-center justify-between z-20">
          {openedFromChat ? (
            <TouchableOpacity
              onPress={onClose}
              className="px-2.5 py-1.5 -ml-1 rounded-xl flex-row items-center gap-1.5 bg-rose-50 border border-rose-200 active:bg-rose-100"
            >
              <ArrowLeft size={16} color="#e11d48" />
              <Text className="text-xs font-bold text-rose-600">Back to Chat</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose} className="p-2 -ml-2 rounded-xl flex-row items-center gap-1 active:bg-slate-100">
              <ArrowLeft size={18} color="#1e293b" />
              <Text className="text-xs font-bold text-slate-700">Back</Text>
            </TouchableOpacity>
          )}

          <View className="items-center px-2 flex-1">
            <Text className="text-sm font-bold text-slate-900 truncate" numberOfLines={1}>
              {profile?.displayName || "Profile"}
            </Text>
            {profile?.city && (
              <Text className="text-[10px] text-rose-600 font-semibold" numberOfLines={1}>
                {profile.city}, {profile.state || profile.country || ""}
              </Text>
            )}
          </View>

          <View className="flex-row items-center gap-1">
            {!isOwn && (
              <TouchableOpacity
                onPress={() => (isBlockedByMe ? unblockMutation.mutate() : setIsBlockModalOpen(true))}
                className="p-2 rounded-xl active:bg-slate-100"
              >
                {isBlockedByMe ? <UserCheck size={18} color="#e11d48" /> : <Ban size={18} color="#64748b" />}
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleShare} className="p-2 rounded-xl active:bg-slate-100">
              <Share2 size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#e11d48" />
            <Text className="text-xs text-slate-400 font-medium mt-3">Loading profile details...</Text>
          </View>
        ) : error || !profile ? (
          <View className="flex-1 items-center justify-center p-6 text-center">
            <ShieldAlert size={48} color="#e11d48" />
            <Text className="text-slate-900 font-bold text-lg mt-3 text-center">Profile Unavailable</Text>
            <Text className="text-slate-500 text-xs mt-1 text-center max-w-xs leading-4">
              This profile might be hidden, deactivated, or does not exist.
            </Text>
            <TouchableOpacity onPress={onClose} className="mt-5 px-6 py-2.5 rounded-xl bg-rose-600">
              <Text className="text-white text-xs font-bold">Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 110 }}>
            {/* HERO PHOTO CAROUSEL */}
            <View className="w-full bg-slate-900 relative" style={{ height: Math.min(Math.round(SCREEN_WIDTH * 0.82), 340) }}>
              {currentPhoto?.url || profile.photoUrl ? (
                <Image
                  source={{ uri: currentPhoto?.url || profile.photoUrl }}
                  className="w-full h-full"
                  blurRadius={isBlurred ? 50 : 0}
                  contentFit="cover"
                />
              ) : (
                <View className="w-full h-full bg-slate-900 items-center justify-center p-6">
                  <ImageOff size={44} color="#64748b" />
                  <Text className="text-slate-400 font-semibold text-sm mt-3 text-center">
                    No pictures uploaded
                  </Text>
                </View>
              )}

              {/* Gradient Vignette for Text legibility */}
              <View className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Top Badges */}
              <View className="absolute top-4 left-4 flex-row items-center gap-2">
                <View className="px-2.5 py-1 rounded-full bg-emerald-500/90 flex-row items-center gap-1 shadow-xs">
                  <View className="w-1.5 h-1.5 rounded-full bg-white" />
                  <Text className="text-white text-[10px] font-bold">Active Member</Text>
                </View>
                {isMutualMatch && (
                  <View className="px-2.5 py-1 rounded-full bg-pink-500/90 flex-row items-center gap-1 shadow-xs">
                    <Sparkles size={11} color="#ffffff" />
                    <Text className="text-white text-[10px] font-bold">Mutual Match</Text>
                  </View>
                )}
              </View>

              {/* Blurred Photo Privacy Shield Overlay */}
              {isBlurred && (
                <View className="absolute inset-0 items-center justify-center p-6 bg-black/45">
                  <View className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center mb-2">
                    <Lock size={22} color="#ffffff" />
                  </View>
                  <Text className="text-white font-bold text-sm text-center">Photo Protected</Text>
                  <Text className="text-white/80 text-[11px] text-center mt-1 max-w-xs leading-4">
                    Photos are blurred according to privacy shield preferences.
                  </Text>

                  {photoAccessStatus === "PENDING" ? (
                    <View className="mt-3 px-3.5 py-1.5 rounded-xl bg-amber-500/30 border border-amber-400/40">
                      <Text className="text-amber-200 text-xs font-bold">Access Request Pending</Text>
                    </View>
                  ) : photoAccessStatus === "ACCEPTED" ? (
                    <View className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-500/30 border border-emerald-400/40">
                      <Text className="text-emerald-200 text-xs font-bold">Access Approved</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => requestPhotoMutation.mutate()}
                      disabled={requestPhotoMutation.isPending}
                      className="mt-3 px-4 py-2 rounded-xl bg-white active:bg-slate-100"
                    >
                      <Text className="text-slate-900 text-xs font-bold">
                        {requestPhotoMutation.isPending ? "Requesting..." : "Request Photo Access"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Carousel Arrows */}
              {photos.length > 1 && (
                <View className="absolute top-1/2 left-3 right-3 flex-row justify-between -translate-y-4">
                  <TouchableOpacity
                    onPress={() => setActivePhotoIdx((p) => (p > 0 ? p - 1 : photos.length - 1))}
                    className="w-8 h-8 rounded-full bg-black/50 items-center justify-center"
                  >
                    <ChevronLeft size={18} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActivePhotoIdx((p) => (p < photos.length - 1 ? p + 1 : 0))}
                    className="w-8 h-8 rounded-full bg-black/50 items-center justify-center"
                  >
                    <ChevronRight size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Bottom Hero Vitals */}
              <View className="absolute bottom-4 left-4 right-4">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-2xl font-black text-white">{profile.displayName}</Text>
                  {age && <Text className="text-2xl font-bold text-white/90">, {age}</Text>}
                  {profile.pronouns && (
                    <View className="px-2 py-0.5 rounded-md bg-white/20">
                      <Text className="text-white text-xs font-medium">{profile.pronouns}</Text>
                    </View>
                  )}
                </View>

                <Text className="text-xs font-bold text-rose-300 uppercase mt-1">
                  {profile.gender?.replace(/_/g, " ")} • {profile.orientation}
                  {profile.outnessStatus ? ` • ${profile.outnessStatus?.replace(/_/g, " ")}` : ""}
                </Text>

                <View className="flex-row items-center gap-1 mt-1">
                  <MapPin size={13} color="#cbd5e1" />
                  <Text className="text-xs text-slate-200">
                    {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
                  </Text>
                </View>

                {/* Thumbnails row */}
                {photos.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 flex-row gap-2">
                    {photos.map((p: any, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setActivePhotoIdx(idx)}
                        className={`w-11 h-11 rounded-lg overflow-hidden border-2 mr-2 relative ${
                          activePhotoIdx === idx ? "border-rose-500 scale-105" : "border-transparent opacity-60"
                        }`}
                      >
                        <Image
                          source={{ uri: p.url || p.originalUrl }}
                          className="w-full h-full"
                          contentFit="cover"
                          blurRadius={isBlurred ? 40 : 0}
                        />
                        {isBlurred && (
                          <View className="absolute inset-0 bg-black/40 items-center justify-center">
                            <Lock size={12} color="#ffffff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            {/* UNIFIED DETAILS SURFACE (Web Typographic Parity) */}
            <View className="p-4">
              <View className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-6">
                {/* SECTION 1: ABOUT ME & PERSONAL BIO */}
                <View>
                  <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                    Basic Details
                  </Text>
                  {profile.bio ? (
                    <Text className="text-xs text-slate-700 leading-relaxed font-normal mb-4">
                      {profile.bio}
                    </Text>
                  ) : null}

                  {/* Basic Details Vertical List (Two left-aligned columns) */}
                  <View className="divide-y divide-slate-100">
                    {[
                      {
                        label: "Height",
                        val: profile.heightCm
                          ? `${Math.floor(profile.heightCm / 30.48)}ft ${Math.round(
                            (profile.heightCm % 30.48) / 2.54
                          )}in (${profile.heightCm} cm)`
                          : "Not specified",
                      },
                      { label: "Marital Status", val: profile.maritalStatus || "Never Married" },
                      { label: "Religion", val: profile.religion || "Not Specified" },
                      { label: "Mother Tongue", val: profile.motherTongue || "English" },
                      {
                        label: "Residing In",
                        val: [profile.city, profile.state, profile.country].filter(Boolean).join(", ") || "Not specified",
                      },
                      ...(profile.originCountry || profile.originCity
                        ? [
                          {
                            label: "Origin / Hometown",
                            val: [profile.originCity, profile.originCountry].filter(Boolean).join(", "),
                          },
                        ]
                        : []),
                      { label: "Nationality / Citizenship", val: profile.nationality || "Not specified" },
                      {
                        label: "Languages",
                        val: profile.languagesSpoken?.length ? profile.languagesSpoken.join(", ") : "English",
                      },
                    ].map((item, idx) => (
                      <View key={idx} className="py-2.5 flex-row items-baseline">
                        <Text className="w-36 text-xs text-slate-500 font-medium">{item.label}</Text>
                        <Text className="flex-1 text-xs font-semibold text-slate-800 text-left">
                          {item.val}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View className="h-px bg-slate-100 my-1" />

                {/* SECTION 2: CAREER & EDUCATION */}
                <View>
                  <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Education & Career
                  </Text>

                  <View className="divide-y divide-slate-100">
                    <View className="py-2.5 flex-row items-baseline">
                      <Text className="w-36 text-xs text-slate-500 font-medium">Education</Text>
                      <View className="flex-1">
                        {profile.educations && profile.educations.length > 0 ? (
                          profile.educations.map((edu: any, i: number) => (
                            <View key={i} className="mb-1 last:mb-0">
                              <Text className="text-xs font-semibold text-slate-800 text-left">
                                {edu.degreeName || edu.degree}
                                {edu.major ? ` in ${edu.major}` : ""}
                              </Text>
                              {edu.institution ? (
                                <Text className="text-[11px] text-slate-500 font-medium text-left">{edu.institution}</Text>
                              ) : null}
                            </View>
                          ))
                        ) : (
                          <Text className="text-xs font-semibold text-slate-800 text-left">
                            {profile.education || profile.degree || "Graduate"}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View className="py-2.5 flex-row items-baseline">
                      <Text className="w-36 text-xs text-slate-500 font-medium">Profession & Sector</Text>
                      <Text className="flex-1 text-xs font-semibold text-slate-800 text-left">
                        {profile.profession || "Working Professional"}
                        {profile.sector ? ` (${profile.sector})` : ""}
                      </Text>
                    </View>

                    {profile.company && (
                      <View className="py-2.5 flex-row items-baseline">
                        <Text className="w-36 text-xs text-slate-500 font-medium">Company</Text>
                        <Text className="flex-1 text-xs font-semibold text-slate-800 text-left">
                          {profile.company}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="h-px bg-slate-100 my-1" />

                {/* SECTION 3: LIFESTYLE & HABITS */}
                <View>
                  <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Lifestyle & Habits
                  </Text>

                  <View className="divide-y divide-slate-100">
                    {[
                      { label: "Diet", val: profile.diet || "Omnivore" },
                      { label: "Drinking", val: profile.drinking || "Socially" },
                      { label: "Smoking", val: profile.smoking || "Non-smoker" },
                      { label: "Pets", val: profile.pets || "Not specified" },
                      ...(profile.children ? [{ label: "Children", val: profile.children }] : []),
                    ].map((hab, idx) => (
                      <View key={idx} className="py-2.5 flex-row items-baseline">
                        <Text className="w-36 text-xs text-slate-500 font-medium">{hab.label}</Text>
                        <Text className="flex-1 text-xs font-semibold text-slate-800 text-left">{hab.val}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* SECTION 4: HOBBIES & PASSIONS (Separate Section) */}
                {profile.hobbies && profile.hobbies.length > 0 && (
                  <>
                    <View className="h-px bg-slate-100 my-1" />
                    <View>
                      <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                        Hobbies & Passions
                      </Text>
                      <View className="flex-row flex-wrap gap-1.5 pt-0.5">
                        {profile.hobbies.map((h: string) => (
                          <View key={h} className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200">
                            <Text className="text-xs font-semibold text-rose-700">{h}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </>
                )}

                {/* SECTION 5: PARTNER PREFERENCES (Two left-aligned columns) */}
                {pref && (
                  <>
                    <View className="h-px bg-slate-100 my-1" />
                    <View>
                      <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Partner Preferences (What They Seek)
                      </Text>

                      <View className="divide-y divide-slate-100">
                        <View className="py-2.5 flex-row items-baseline">
                          <Text className="w-36 text-slate-500 text-xs font-medium">Looking For</Text>
                          <Text className="flex-1 font-semibold text-slate-800 text-xs text-left">
                            {pref.preferredGenders?.map((g: string) => g.replace(/_/g, " ")).join(", ") || "Any"}
                          </Text>
                        </View>

                        <View className="py-2.5 flex-row items-baseline">
                          <Text className="w-36 text-slate-500 text-xs font-medium">Orientations</Text>
                          <Text className="flex-1 font-semibold text-slate-800 text-xs text-left">
                            {pref.preferredOrientations?.join(", ") || "Any"}
                          </Text>
                        </View>

                        <View className="py-2.5 flex-row items-baseline">
                          <Text className="w-36 text-slate-500 text-xs font-medium">Age Range</Text>
                          <Text className="flex-1 font-semibold text-slate-800 text-xs text-left">
                            {pref.minAge} to {pref.maxAge} Years
                          </Text>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        )}

        {/* BOTTOM STICKY ACTION BAR */}
        {!isOwn && profile && (
          <View className="absolute bottom-0 inset-x-0 bg-white/95 border-t border-slate-200/90 p-4 shadow-lg flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-bold text-slate-900 truncate" numberOfLines={1}>
                {profile.displayName}
              </Text>
              <Text className="text-[10px] text-slate-500 truncate" numberOfLines={1}>
                {profile.profession || "Member"} • {profile.city || "India"}
              </Text>
            </View>

            {isMutualMatch ? (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onNavigateToChat?.(userId || "");
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 flex-row items-center gap-1.5 shadow-sm active:bg-rose-700"
              >
                <MessageCircle size={16} color="#ffffff" />
                <Text className="text-white font-bold text-xs">Open Chat</Text>
              </TouchableOpacity>
            ) : receivedInterestStatus === "PENDING" ? (
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() =>
                    respondInterestMutation.mutate({
                      id: profile.interaction?.receivedInterestId,
                      status: "ACCEPTED",
                    })
                  }
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 flex-row items-center gap-1"
                >
                  <Check size={14} color="#ffffff" />
                  <Text className="text-white font-bold text-xs">Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    respondInterestMutation.mutate({
                      id: profile.interaction?.receivedInterestId,
                      status: "DECLINED",
                    })
                  }
                  className="px-3 py-2 rounded-xl bg-slate-100"
                >
                  <Text className="text-slate-700 font-bold text-xs">Decline</Text>
                </TouchableOpacity>
              </View>
            ) : sentInterestStatus === "PENDING" ? (
              <View className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
                <Text className="text-amber-800 text-xs font-bold">Interest Sent</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => sendInterestMutation.mutate()}
                disabled={sendInterestMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-rose-600 flex-row items-center gap-1.5 shadow-sm active:bg-rose-700"
              >
                <Heart size={16} color="#ffffff" fill="#ffffff" />
                <Text className="text-white font-bold text-xs">
                  {sendInterestMutation.isPending ? "Sending..." : "Send Interest"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
};
