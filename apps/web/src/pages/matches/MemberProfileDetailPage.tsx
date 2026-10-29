import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/auth.store";
import { ActivitySidebar } from "../../components/layout/ActivitySidebar";
import {
  ArrowLeft,
  Heart,
  Send,
  MessageCircle,
  Lock,
  Unlock,
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Languages,
  Coffee,
  CheckCircle2,
  XCircle,
  Share2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Smile,
  Check,
  Ban,
  UserCheck,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";

export const MemberProfileDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [interestMessage, setInterestMessage] = useState("");
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Member Profile
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["member-profile", userId],
    queryFn: async () => {
      const res = await api.get(`/profiles/user/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  // Send Interest Mutation
  const sendInterestMutation = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const res = await api.post("/matches/interest", {
        targetUserId: userId,
        message,
      });
      return res.data;
    },
    onSuccess: () => {
      setIsInterestModalOpen(false);
      setInterestMessage("");
      queryClient.invalidateQueries({ queryKey: ["member-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["matches-feed"] });
      queryClient.invalidateQueries({ queryKey: ["accepted-matches"] });
      showToast("Interest sent successfully!");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to send interest");
    },
  });

  // Respond Interest Mutation (Accept/Decline received interest)
  const respondInterestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) => {
      const res = await api.post(`/matches/interest/${id}/respond`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["member-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["accepted-matches"] });
      showToast(
        variables.status === "ACCEPTED"
          ? "Match connected! You can now message."
          : "Declined match interest."
      );
    },
  });

  // Request Photo Access Mutation
  const requestPhotoMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/matches/photo-access", { targetUserId: userId });
      return res.data;
    },
    onSuccess: () => {
      setIsPhotoModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["member-profile", userId] });
      showToast("Private photo access request sent!");
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
      queryClient.invalidateQueries({ queryKey: ["member-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["matches-feed"] });
      queryClient.invalidateQueries({ queryKey: ["accepted-matches"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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
      queryClient.invalidateQueries({ queryKey: ["member-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["matches-feed"] });
      queryClient.invalidateQueries({ queryKey: ["accepted-matches"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 h-full w-full flex flex-col">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
          <ActivitySidebar />
          <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
            <div className="animate-pulse space-y-4 pr-2 sm:pr-3">
              <div className="h-96 bg-slate-200 rounded-3xl" />
              <div className="h-24 bg-slate-200 rounded-2xl" />
              <div className="h-64 bg-slate-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 h-full w-full flex flex-col">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
          <ActivitySidebar />
          <div className="flex-1 min-w-0 flex items-center justify-center p-4">
            <div className="max-w-md w-full p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-slate-800">Profile Not Available</h2>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                This profile might be hidden, set to private, or does not exist.
              </p>
              {error && (
                <div className="mb-6 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-mono break-all text-left">
                  <p className="font-bold">Error Info:</p>
                  <p>{(error as any)?.response?.data?.message || (error as any)?.message || String(error)}</p>
                  {(error as any)?.response?.status && <p>Status: {(error as any)?.response?.status}</p>}
                </div>
              )}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(profile.dateOfBirth);
  const photos = profile.photos || [];
  const currentPhoto = photos[activePhotoIdx] || photos[0];
  const isBlurred = currentPhoto?.isBlurred ?? false;
  const isOwn = profile.interaction?.isOwn;
  const isMutualMatch = profile.interaction?.isMutualMatch;
  const isBlocked = profile.interaction?.isBlocked;
  const isBlockedByMe = profile.interaction?.isBlockedByMe;
  const hasBlockedMe = profile.interaction?.hasBlockedMe;
  const sentInterestStatus = profile.interaction?.sentInterestStatus;
  const receivedInterestStatus = profile.interaction?.receivedInterestStatus;
  const photoAccessStatus = profile.interaction?.photoAccessStatus;
  const photoAccessIsHidden = profile.interaction?.photoAccessIsHidden;
  const photoAccessIsRevoked = profile.interaction?.photoAccessIsRevoked;

  // Partner Preferences criteria match helpers
  const pref = profile.partnerPreference;

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-slide-down">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Page Layout with Sticky Desktop Sidebar matching feed pages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 h-full w-full flex flex-col">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
          {/* Left Navigation Sidebar - Stationary / sticky matching all other pages */}
          <ActivitySidebar />

          {/* Profile Detail Content Area: independently scrollable */}
          <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
            {/* Blocked Member Alert Card: Positioned above the Back / Title / Unblock bar */}
            {!isOwn && isBlockedByMe && (
              <div className="bg-rose-50/90 rounded-2xl border border-rose-200/90 p-3.5 sm:p-4 mb-3 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0 animate-fade-in">
                <div className="min-w-0 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-900 block">
                      You have blocked this member
                    </span>
                    <span className="text-[11px] text-rose-600">
                      They cannot message you or see your active status. You can unblock them at any time.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => unblockMutation.mutate()}
                  disabled={unblockMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{unblockMutation.isPending ? "Unblocking..." : "Unblock Member"}</span>
                </button>
              </div>
            )}

            {/* Top Header / Back Button bar: completely stationary */}
            <div className="bg-white rounded-2xl border border-slate-200/90 px-4 py-3 mb-4 shadow-xs shrink-0">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer p-1.5 -ml-1 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="text-center min-w-0 px-2">
                  <h1 className="text-sm font-bold text-slate-900 truncate">
                    {profile.displayName}
                  </h1>
                  <p className="text-[10px] text-brand-600 font-semibold truncate">
                    {profile.city}, {profile.state}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!isOwn && (
                    isBlockedByMe ? (
                      <button
                        type="button"
                        onClick={() => unblockMutation.mutate()}
                        disabled={unblockMutation.isPending}
                        title="Unblock this member"
                        className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Unblock</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsBlockModalOpen(true)}
                        title="Block this member"
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        showToast("Profile link copied to clipboard!");
                      }
                    }}
                    title="Share profile"
                    className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Cards Container: Only profile cards scrollable */}
            <div className="flex-1 overflow-y-auto pr-2 sm:pr-3 space-y-4 pb-28">
              {/* HERO CARD: FULL-WIDTH PHOTO CAROUSEL & BIO OVERLAY */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-md border border-slate-200/50 aspect-[4/5] sm:aspect-[4/4.5] flex flex-col justify-between">
          {/* Main Photo Display */}
          <div className="absolute inset-0 z-0 bg-slate-900">
            {currentPhoto?.url ? (
              <img
                src={currentPhoto.url}
                alt={profile.displayName}
                className={`w-full h-full object-cover object-top transition-all duration-300 ${
                  isBlurred ? "filter blur-2xl scale-110" : ""
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-brand-600 to-pink-500 text-white font-extrabold text-6xl">
                {profile.displayName?.slice(0, 2).toUpperCase()}
              </div>
            )}
            {/* Ambient vignette gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/40" />
          </div>

          {/* Top Info Bar inside Photo */}
          <div className="relative z-10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Active Member
              </span>
              {isMutualMatch && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Mutual Match
                </span>
              )}
            </div>

            {/* Photo Counter */}
            {photos.length > 1 && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/50 text-white/90 backdrop-blur-md border border-white/10">
                {activePhotoIdx + 1} / {photos.length}
              </span>
            )}
          </div>

          {/* Blur Protection Centered Banner */}
          {isBlurred && (
            <div className="relative z-10 m-auto p-5 text-center max-w-xs bg-slate-950/70 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2 text-white">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-white">Photo Shield Active</h2>
              <p className="text-[11px] text-slate-300 mt-1 mb-3">
                {profile.displayName} maintains private photos. Send a request to view clear original pictures.
              </p>
              {photoAccessStatus === "PENDING" ? (
                <span className="inline-block px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30">
                  Access Request Pending
                </span>
              ) : photoAccessStatus === "ACCEPTED" ? (
                photoAccessIsHidden ? (
                  <span className="inline-block px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-semibold text-xs border border-amber-500/30">
                    Access temporarily revoked
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30">
                    Access Approved
                  </span>
                )
              ) : photoAccessIsRevoked ? (
                <div className="space-y-2">
                  <span className="inline-block px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 font-semibold text-xs border border-rose-500/30">
                    Access Revoked
                  </span>
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsPhotoModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                    >
                      Request Photo Access Again
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                >
                  Request Photo Access
                </button>
              )}
            </div>
          )}

          {/* Bottom Hero Overlay: Name, Identity, Key Badges */}
          <div className="relative z-10 p-5 pt-8">
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {profile.displayName}
                  </h2>
                  {age && <span className="text-2xl font-bold text-white/90">, {age}</span>}
                  {profile.pronouns && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/20 text-white/90 backdrop-blur-xs">
                      {profile.pronouns}
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
                  <span>{profile.gender?.replace(/_/g, " ")}</span>
                  <span>•</span>
                  <span>{profile.orientation}</span>
                  <span>•</span>
                  <span>{profile.outnessStatus?.replace(/_/g, " ")}</span>
                </p>

                <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{profile.city}, {profile.state}, {profile.country}</span>
                </p>
              </div>

              {/* Prev / Next photo buttons on desktop/mobile */}
              {photos.length > 1 && (
                <div className="flex items-center gap-1.5 shrink-0 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                    }
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
                    }
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Photo thumbnails strip */}
            {photos.length > 1 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 overflow-x-auto pb-1">
                {photos.map((p: any, idx: number) => (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx
                        ? "border-brand-500 scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img
                      src={p.url || p.originalUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className={`w-full h-full object-cover ${
                        p.isBlurred ? "filter blur-sm" : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* INTERACTION ACTION BAR / BANNER */}
        {!isOwn && !isBlockedByMe && (
          hasBlockedMe ? (
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Profile unavailable
                </span>
                <span className="text-[11px] text-slate-500">
                  Interactions and messaging with this account are currently unavailable.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block">
                  {isMutualMatch
                    ? "Connected Match! You have mutual interest."
                    : receivedInterestStatus === "PENDING"
                    ? `${profile.displayName} sent you an interest!`
                    : sentInterestStatus === "PENDING"
                    ? "Interest sent. Waiting for response."
                    : "Connect with " + profile.displayName}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isMutualMatch
                    ? "Exchange messages directly in real-time."
                    : "Take the next step towards genuine queer partnership."}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isMutualMatch ? (
                  <button
                    type="button"
                    onClick={() => navigate("/messages")}
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open Chat</span>
                  </button>
                ) : receivedInterestStatus === "PENDING" ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        respondInterestMutation.mutate({
                          id: profile.interaction.receivedInterestId,
                          status: "ACCEPTED",
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Interest</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        respondInterestMutation.mutate({
                          id: profile.interaction.receivedInterestId,
                          status: "DECLINED",
                        })
                      }
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                ) : sentInterestStatus === "PENDING" ? (
                  <span className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Interest Sent</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsInterestModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Send Interest</span>
                  </button>
                )}
              </div>
            </div>
          )
        )}

        {/* SECTION 1: ABOUT ME & PERSONAL BIO */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                About {profile.displayName}
              </h2>
              <p className="text-[11px] text-slate-400">Authentic story & personal values</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
            {profile.bio || "No biography shared yet. Connect and initiate a conversation to get to know them!"}
          </p>

          {/* Quick Demographics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Height
              </span>
              <span className="text-xs font-bold text-slate-800">
                {profile.heightCm
                  ? `${Math.floor(profile.heightCm / 30.48)}ft ${Math.round(
                      (profile.heightCm % 30.48) / 2.54
                    )}in (${profile.heightCm} cm)`
                  : "Not specified"}
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Marital Status
              </span>
              <span className="text-xs font-bold text-slate-800">
                {profile.maritalStatus || "Never Married"}
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Religion & Beliefs
              </span>
              <span className="text-xs font-bold text-slate-800">
                {profile.religion || "Not Specified"}
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Mother Tongue
              </span>
              <span className="text-xs font-bold text-slate-800">
                {profile.motherTongue || "English"}
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Nationality
              </span>
              <span className="text-xs font-bold text-slate-800">
                {profile.nationality || "Indian"}
              </span>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Languages Spoken
              </span>
              <span className="text-xs font-bold text-slate-800 truncate block">
                {profile.languagesSpoken?.length > 0
                  ? profile.languagesSpoken.join(", ")
                  : "English"}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: CAREER & EDUCATION */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Education & Career
              </h2>
              <p className="text-[11px] text-slate-400">Professional background & achievements</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex items-start gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <GraduationCap className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Highest Education
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {profile.education || "Graduate"}
                </span>
                {profile.degree && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{profile.degree}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <Briefcase className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Profession & Sector
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {profile.profession || "Working Professional"}
                </span>
                {profile.sector && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{profile.sector}</p>
                )}
              </div>
            </div>

            {profile.company && (
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Company / Organization
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {profile.company}
                </span>
              </div>
            )}

            {profile.annualIncome && (
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Annual Compensation / Income Range
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {profile.annualIncome}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: LIFESTYLE & INTERESTS */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Lifestyle & Habits
              </h2>
              <p className="text-[11px] text-slate-400">Diet, living habits & personal passions</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Diet
              </span>
              <span className="text-xs font-bold text-slate-800">{profile.diet || "Omnivore"}</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Drinking
              </span>
              <span className="text-xs font-bold text-slate-800">{profile.drinking || "Socially"}</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Smoking
              </span>
              <span className="text-xs font-bold text-slate-800">{profile.smoking || "Non-smoker"}</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Pets
              </span>
              <span className="text-xs font-bold text-slate-800">{profile.pets || "Pet friendly"}</span>
            </div>
          </div>

          {/* Hobbies list */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Hobbies & Passions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {profile.hobbies.map((h: string) => (
                  <span
                    key={h}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/60"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: WHAT THEY ARE LOOKING FOR (PARTNER PREFERENCES) */}
        {pref && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Partner Preferences (What They Seek)
                </h2>
                <p className="text-[11px] text-slate-400">Match requirements for lifelong compatibility</p>
              </div>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Looking For</span>
                <span className="font-bold text-slate-900">
                  {pref.preferredGenders?.map((g: string) => g.replace(/_/g, " ")).join(", ") || "Any"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Orientations</span>
                <span className="font-bold text-slate-900">
                  {pref.preferredOrientations?.join(", ") || "Any"}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 font-medium">Age Range</span>
                <span className="font-bold text-slate-900">
                  {pref.minAge} to {pref.maxAge} Years
                </span>
              </div>

              {(pref.minHeightCm || pref.maxHeightCm) && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500 font-medium">Preferred Height</span>
                  <span className="font-bold text-slate-900">
                    {pref.minHeightCm ? `${pref.minHeightCm}cm` : "Any"} -{" "}
                    {pref.maxHeightCm ? `${pref.maxHeightCm}cm` : "Any"}
                  </span>
                </div>
              )}

              {pref.acceptableOutness && pref.acceptableOutness.length > 0 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-500 font-medium">Acceptable Outness</span>
                  <span className="font-bold text-slate-900">
                    {pref.acceptableOutness.map((o: string) => o.replace(/_/g, " ")).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
            </div>
          </main>
        </div>
      </div>

      {/* STICKY BOTTOM INTERACTION DOCK */}
      {!isOwn && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3.5 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
            <div className="min-w-0 hidden lg:block w-64 shrink-0 text-slate-400 text-xs font-semibold">
              Profile Interaction
            </div>

            <div className="flex-1 min-w-0 max-w-3xl mx-auto flex items-center justify-between gap-3">
              <div className="min-w-0 hidden sm:block">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {profile.displayName}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {profile.profession || "Member"} • {profile.city}
                </p>
              </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isMutualMatch ? (
                <button
                  type="button"
                  onClick={() => navigate("/messages")}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              ) : sentInterestStatus === "PENDING" ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Interest Already Sent</span>
                </button>
              ) : receivedInterestStatus === "PENDING" ? (
                <button
                  type="button"
                  onClick={() =>
                    respondInterestMutation.mutate({
                      id: profile.interaction.receivedInterestId,
                      status: "ACCEPTED",
                    })
                  }
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Received Interest</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsInterestModalOpen(true)}
                  className="flex-1 sm:flex-initial px-7 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Send Interest</span>
                </button>
              )}

              {isBlurred && (photoAccessStatus !== "ACCEPTED" || photoAccessIsHidden) && (
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  disabled={photoAccessStatus === "PENDING" || photoAccessIsHidden}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">
                    {photoAccessIsHidden
                      ? "Access Hidden"
                      : photoAccessIsRevoked
                      ? "Request Photos Again"
                      : "Request Photos"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Modal: Send Interest */}
      <Modal
        isOpen={isInterestModalOpen}
        onClose={() => setIsInterestModalOpen(false)}
        icon={<Heart className="w-5 h-5 fill-rose-600 text-rose-600" />}
        iconContainerClassName="bg-rose-50 text-rose-600"
        title={`Connect with ${profile.displayName}`}
        description="Express your interest with a personalized introductory note."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInterestModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => sendInterestMutation.mutate({ message: interestMessage })}
              isLoading={sendInterestMutation.isPending}
              className="flex-1"
            >
              Confirm & Send
            </Button>
          </>
        }
      >
        <textarea
          rows={3}
          value={interestMessage}
          onChange={(e) => setInterestMessage(e.target.value)}
          placeholder="Hi, I resonated with your values and would love to connect..."
          className="w-full p-3 bg-white border border-zinc-200/90 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder:text-zinc-400"
        />
      </Modal>

      {/* Modal: Request Photo Access */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        icon={<Unlock className="w-5 h-5" />}
        iconContainerClassName="bg-brand-50 text-brand-600"
        title="Request Photo Access"
        description={`${profile.displayName} has protected their pictures under EverPride privacy safeguards. A private access approval request will be sent to them.`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPhotoModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => requestPhotoMutation.mutate()}
              isLoading={requestPhotoMutation.isPending}
              className="flex-1"
            >
              Send Unblur Request
            </Button>
          </>
        }
      />

      {/* Modal: Block Member Confirmation */}
      <Modal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        icon={<Ban className="w-5 h-5 text-rose-600" />}
        iconContainerClassName="bg-rose-50 text-rose-600"
        title={`Block ${profile.displayName}?`}
        description="They will no longer be able to message you, view your profile updates, or interact with you. Any active chat will be restricted. You can unblock them whenever you want from Privacy Settings."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBlockModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => blockMutation.mutate()}
              isLoading={blockMutation.isPending}
              className="flex-1"
            >
              Yes, Block Member
            </Button>
          </>
        }
      />
    </div>
  );
};
