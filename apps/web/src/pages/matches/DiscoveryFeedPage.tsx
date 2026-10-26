import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ActivitySidebar } from "../../components/layout/ActivitySidebar";
import {
  Heart,
  Lock,
  Unlock,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  Sparkles,
  CheckCircle,
  Search,
  X,
  MessageCircle,
  Phone,
  GraduationCap,
  Star,
  LogIn,
  Send,
  MessageSquare,
} from "lucide-react";
import { UniversalProfileCard } from "../../components/activity/UniversalProfileCard";
import { allCountries } from "../../data/countries";

export const DiscoveryFeedPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [interestMessage, setInterestMessage] = useState("");
  const [activeModalProfile, setActiveModalProfile] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"interest" | "photo" | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("All");
  const [ignoredProfileIds, setIgnoredProfileIds] = useState<string[]>([]);
  const [shortlistedProfileIds, setShortlistedProfileIds] = useState<string[]>([]);

  // Filter Criteria Multi-Select State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
  const [nationalitySearchInput, setNationalitySearchInput] = useState("");
  const [selectedReligions, setSelectedReligions] = useState<string[]>([]);
  const [selectedMaritalStatuses, setSelectedMaritalStatuses] = useState<string[]>([]);
  const [filterAgeMin, setFilterAgeMin] = useState<number>(18);
  const [filterAgeMax, setFilterAgeMax] = useState<number>(60);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Fetch matches from NestJS API (supports pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const { data: feedResult, isLoading, error } = useQuery({
    queryKey: ["matches-feed", currentPage],
    queryFn: async () => {
      const res = await api.get(`/matches/feed?page=${currentPage}&limit=20`);
      return res.data;
    },
  });

  const matches = feedResult?.data || (Array.isArray(feedResult) ? feedResult : []);

  // Mutation to send interest
  const sendInterestMutation = useMutation({
    mutationFn: async ({ targetUserId, message }: { targetUserId: string; message?: string }) => {
      return api.post("/matches/interest", { targetUserId, message });
    },
    onSuccess: () => {
      setSuccessToast("Interest request sent privately!");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["matches-feed"] });
      queryClient.invalidateQueries({ queryKey: ["sent-interests"] });
      setTimeout(() => setSuccessToast(null), 4000);
    },
  });

  // Mutation to request photo access
  const requestPhotoMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      return api.post("/matches/photo-access", { targetUserId });
    },
    onSuccess: () => {
      setSuccessToast("Photo access requested. You'll be notified when approved!");
      closeModal();
      setTimeout(() => setSuccessToast(null), 4000);
    },
  });

  const closeModal = () => {
    setActiveModalProfile(null);
    setModalType(null);
    setInterestMessage("");
  };

  const getOutnessBadge = (status: string) => {
    switch (status) {
      case "DISCREET_NOT_OUT":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            Discreet
          </span>
        );
      case "OUT_TO_SELECT_FEW":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            Out to friends
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            Openly Out
          </span>
        );
    }
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const diff = Date.now() - new Date(dobString).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  // Filter profiles based on quick filter and search input
  const filteredMatches = matches?.filter((profile: any) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      profile.displayName?.toLowerCase().includes(q) ||
      profile.city?.toLowerCase().includes(q) ||
      profile.state?.toLowerCase().includes(q) ||
      profile.nationality?.toLowerCase().includes(q) ||
      profile.profession?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (ignoredProfileIds.includes(profile.id)) return false;

    // Filter Criteria Check (Multi-Select)
    if (selectedNationalities.length > 0 && !selectedNationalities.includes(profile.nationality)) return false;
    if (selectedReligions.length > 0 && !selectedReligions.includes(profile.religion)) return false;
    if (selectedMaritalStatuses.length > 0 && !selectedMaritalStatuses.includes(profile.maritalStatus)) return false;
    
    const age = calculateAge(profile.dateOfBirth);
    if (age !== null) {
      if (age < filterAgeMin || age > filterAgeMax) return false;
    }

    if (activeQuickFilter === "With Photos") {
      const primary = profile.photos?.[0];
      return primary && !primary.isBlurred;
    }
    if (activeQuickFilter === "Nearby") {
      return true; // keep all for feed
    }
    return true;
  });

  const activeFilterCount =
    (selectedNationalities.length > 0 ? 1 : 0) +
    (selectedReligions.length > 0 ? 1 : 0) +
    (selectedMaritalStatuses.length > 0 ? 1 : 0) +
    (filterAgeMin !== 18 || filterAgeMax !== 60 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 h-full flex flex-col">
      {successToast && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in shrink-0">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          {successToast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Left Navigation Sidebar matching Jeevansathi */}
        <ActivitySidebar />

        {/* Center Main Content: Stationary filter bar + independently scrollable cards */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          {/* Top Search & Filter Bar: completely stationary */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-4 shadow-xs space-y-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tell us what you're looking for (e.g. Designer, Mumbai, Vegetarian)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500 text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Pill Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold shrink-0 shadow-xs cursor-pointer transition-colors ${
                  activeFilterCount > 0
                    ? "bg-rose-600 text-white border border-rose-600"
                    : "bg-white border border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-rose-600 text-[10px] font-extrabold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {["All", "Nearby", "With Photos", "Recently Active"].map((pill) => (
                <button
                  type="button"
                  key={pill}
                  onClick={() => setActiveQuickFilter(pill)}
                  className={`px-3 py-1.5 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${
                    activeQuickFilter === pill
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Feed List Cards container: Only user cards scrollable, extends to the bottom */}
          <div className="flex-1 overflow-y-auto pr-2 sm:pr-3 space-y-4 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
                ))}
              </div>
          ) : !filteredMatches || filteredMatches.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-base font-bold text-slate-800">No matching profiles found</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Try loosening your filters or check back soon as more verified members complete onboarding.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMatches.map((profile: any) => {
                return (
                  <UniversalProfileCard
                    key={profile.id}
                    profile={profile}
                    badge="outness"
                    headerStatusLeft={
                      <span className="text-xs font-semibold text-slate-500">
                        Active Today
                      </span>
                    }
                    headerStatusRight={
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-900 font-bold text-xs shadow-2xs border border-slate-200/80">
                        <LogIn className="w-3.5 h-3.5 text-slate-700" />
                        <span>Just Joined</span>
                      </span>
                    }
                    onRequestUnblur={() => {
                      setActiveModalProfile(profile);
                      setModalType("photo");
                    }}
                    actionsFooter={
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalProfile(profile);
                            setModalType("interest");
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-rose-600 hover:bg-rose-100/60 transition-colors font-bold text-xs cursor-pointer group"
                        >
                          <Send className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                          <span>Interest</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSuccessToast(`Shortlisted ${profile.displayName}!`);
                            setTimeout(() => setSuccessToast(null), 3000);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-rose-600 hover:bg-rose-100/60 transition-colors font-bold text-xs cursor-pointer group"
                        >
                          <Star className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                          <span>Shortlist</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIgnoredProfileIds((prev) => [...prev, profile.id]);
                            setSuccessToast(`Ignored ${profile.displayName}`);
                            setTimeout(() => setSuccessToast(null), 3000);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-rose-600 hover:bg-rose-100/60 transition-colors font-bold text-xs cursor-pointer group"
                        >
                          <X className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                          <span>Ignore</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalProfile(profile);
                            setModalType("interest");
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-rose-600 hover:bg-rose-100/60 transition-colors font-bold text-xs cursor-pointer group"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                          <span>Chat</span>
                        </button>
                      </>
                    }
                  />
                );
              })}

              {/* Feed Pagination Controls */}
              {feedResult?.pagination && (feedResult.pagination.total > 20 || currentPage > 1) && (
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs mt-6 text-xs font-semibold">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Previous Page
                  </button>
                  <span className="text-slate-500">
                    Page {feedResult.pagination.page} of {Math.ceil(feedResult.pagination.total / feedResult.pagination.limit)} ({feedResult.pagination.total} profiles)
                  </span>
                  <button
                    type="button"
                    disabled={!feedResult.pagination.hasMore}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next Page
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Modal: Send Interest */}
      {modalType === "interest" && activeModalProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Express Interest in {activeModalProfile.displayName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a respectful, sincere note to accompany your match request.
            </p>

            <textarea
              rows={3}
              value={interestMessage}
              onChange={(e) => setInterestMessage(e.target.value)}
              placeholder="Hi, I resonated with your profile and values..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500 mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="w-1/3 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  sendInterestMutation.mutate({
                    targetUserId: activeModalProfile.userId,
                    message: interestMessage,
                  })
                }
                disabled={sendInterestMutation.isPending}
                className="w-2/3 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 cursor-pointer"
              >
                {sendInterestMutation.isPending ? "Sending..." : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Photo Access */}
      {modalType === "photo" && activeModalProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <Unlock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Request Photo Access
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {activeModalProfile.displayName} has chosen to protect their identity. A private authorization request will be sent to them.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="w-1/3 py-2.5 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => requestPhotoMutation.mutate(activeModalProfile.userId)}
                disabled={requestPhotoMutation.isPending}
                className="w-2/3 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 cursor-pointer"
              >
                {requestPhotoMutation.isPending ? "Requesting..." : "Send Unblur Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Filter Criteria */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Filter Criteria
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Nationality Filter (Multi-Select, searchable across entire world) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    Nationality {selectedNationalities.length > 0 && <span className="text-rose-600 font-semibold">({selectedNationalities.length} selected)</span>}
                  </label>
                  {selectedNationalities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedNationalities([])}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Selected Nationality Tags */}
                {selectedNationalities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedNationalities.map((nat) => (
                      <span
                        key={nat}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600 text-white shadow-2xs"
                      >
                        {nat}
                        <button
                          type="button"
                          onClick={() => toggleFilter(selectedNationalities, setSelectedNationalities, nat)}
                          className="hover:text-rose-200 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search Nationality Input with Floating Dropdown Overlay */}
                <div className="relative mb-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={nationalitySearchInput}
                      onChange={(e) => setNationalitySearchInput(e.target.value)}
                      placeholder="Search any nationality in the world (e.g. Indian, Canadian, British)..."
                      className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-400 shadow-2xs"
                    />
                    {nationalitySearchInput && (
                      <button
                        type="button"
                        onClick={() => setNationalitySearchInput("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Floating Dropdown Overlay (appears over, not in-between) */}
                  {nationalitySearchInput.trim() && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-xl p-1 divide-y divide-slate-100 z-50 animate-fade-in">
                      {allCountries
                        .filter((c) =>
                          c.name.toLowerCase().includes(nationalitySearchInput.toLowerCase())
                        )
                        .slice(0, 35)
                        .map((c) => {
                          const isSelected = selectedNationalities.includes(c.name);
                          return (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                toggleFilter(selectedNationalities, setSelectedNationalities, c.name);
                                setNationalitySearchInput("");
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? "bg-rose-50 text-rose-700 font-bold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{c.name}</span>
                              {isSelected ? (
                                <span className="text-[10px] text-rose-600 font-bold">Selected</span>
                              ) : (
                                <span className="text-[10px] text-rose-500 font-semibold">+ Add</span>
                              )}
                            </button>
                          );
                        })}
                      {allCountries.filter((c) =>
                        c.name.toLowerCase().includes(nationalitySearchInput.toLowerCase())
                      ).length === 0 && (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No nationality found matching "{nationalitySearchInput}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Religion Filter (Multi-Select, matching Onboarding list) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    Community / Religion {selectedReligions.length > 0 && <span className="text-rose-600 font-semibold">({selectedReligions.length} selected)</span>}
                  </label>
                  {selectedReligions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedReligions([])}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Christianity",
                    "Islam",
                    "Hinduism",
                    "Buddhism",
                    "Folk Religion / Shinto / Taoism",
                    "Sikhism",
                    "Judaism",
                    "Jainism",
                    "Baháʼí",
                    "Spiritual but not religious",
                    "Atheist / Agnostic",
                    "Other",
                  ].map((rel) => {
                    const isSelected = selectedReligions.includes(rel);
                    return (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => toggleFilter(selectedReligions, setSelectedReligions, rel)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-rose-600 border-rose-600 text-white font-semibold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        {rel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Marital Status Filter (Multi-Select) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">
                    Marital Status {selectedMaritalStatuses.length > 0 && <span className="text-rose-600 font-semibold">({selectedMaritalStatuses.length} selected)</span>}
                  </label>
                  {selectedMaritalStatuses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedMaritalStatuses([])}
                      className="text-[11px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Never Married", "Divorced", "Widowed", "Awaiting Divorce"].map((status) => {
                    const isSelected = selectedMaritalStatuses.includes(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => toggleFilter(selectedMaritalStatuses, setSelectedMaritalStatuses, status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-rose-600 border-rose-600 text-white font-semibold shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Combined Age Range Dragger */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-700">Age Range</label>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full text-xs">
                    {filterAgeMin} – {filterAgeMax} yrs
                  </span>
                </div>
                
                {/* Visual Combined Dual Range Slider */}
                <div className="relative h-7 flex items-center px-1">
                  {/* Background Track */}
                  <div className="absolute left-1 right-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    {/* Active highlighted range connector bar */}
                    <div
                      className="absolute top-0 bottom-0 bg-rose-500 rounded-full"
                      style={{
                        left: `${((filterAgeMin - 18) / (60 - 18)) * 100}%`,
                        width: `${((filterAgeMax - filterAgeMin) / (60 - 18)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Min Age Slider */}
                  <input
                    type="range"
                    min={18}
                    max={60}
                    value={filterAgeMin}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), filterAgeMax);
                      setFilterAgeMin(val);
                    }}
                    style={{ zIndex: filterAgeMin > 50 ? 5 : 3 }}
                    className="absolute left-0 w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer
                      [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-600 [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-110
                      [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-rose-600 [&::-moz-range-thumb]:shadow-md hover:[&::-moz-range-thumb]:scale-110 active:[&::-moz-range-thumb]:scale-110"
                  />

                  {/* Max Age Slider */}
                  <input
                    type="range"
                    min={18}
                    max={60}
                    value={filterAgeMax}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), filterAgeMin);
                      setFilterAgeMax(val);
                    }}
                    style={{ zIndex: 4 }}
                    className="absolute left-0 w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer
                      [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-600 [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-110
                      [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-rose-600 [&::-moz-range-thumb]:shadow-md hover:[&::-moz-range-thumb]:scale-110 active:[&::-moz-range-thumb]:scale-110"
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium px-1">
                  <span>18 yrs</span>
                  <span>30 yrs</span>
                  <span>45 yrs</span>
                  <span>60 yrs</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-5 mt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedNationalities([]);
                  setNationalitySearchInput("");
                  setSelectedReligions([]);
                  setSelectedMaritalStatuses([]);
                  setFilterAgeMin(18);
                  setFilterAgeMax(60);
                }}
                className="w-1/3 py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="w-2/3 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
              >
                Apply Criteria ({filteredMatches?.length || 0} Matches)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
