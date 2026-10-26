import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ActivitySidebar } from "../../components/layout/ActivitySidebar";
import { EmptyActivityState } from "../../components/layout/EmptyActivityState";
import { UniversalProfileCard } from "../../components/activity/UniversalProfileCard";
import {
  Heart,
  MessageCircle,
  Phone,
} from "lucide-react";
import { useChatStore } from "../../stores/chat.store";

export const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);

  const { data: matchesList, isLoading } = useQuery({
    queryKey: ["accepted-matches"],
    queryFn: async () => {
      const res = await api.get("/matches/accepted");
      return res.data;
    },
  });

  const handleOpenChat = async (partnerUserId: string) => {
    try {
      const res = await api.post(`/chat/conversations/with/${partnerUserId}`);
      if (res.data?.id) {
        setActiveConversationId(res.data.id);
      }
    } catch (err) {
      console.warn("Could not start conversation:", err);
    }
    navigate("/messages");
  };

  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const diff = Date.now() - new Date(dobString).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0 h-full flex flex-col">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Left Navigation Sidebar */}
        <ActivitySidebar activeTab="matches" />

        {/* Center Main Content: Stationary sidebar + independently scrollable cards */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          {/* List / Empty State: Only cards scrollable, extends to the bottom */}
          <div className="flex-1 overflow-y-auto pr-2 sm:pr-3 space-y-4 pb-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : !matchesList || matchesList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
                <EmptyActivityState type="matches" />
              </div>
            ) : (
              <div className="space-y-4">
                {matchesList.map((match: any) => {
                  const profile = match.user?.profile;
                  if (!profile) return null;

                  return (
                    <UniversalProfileCard
                      key={match.interestId}
                      profile={profile}
                      badge="matched"
                      headerStatusLeft={
                        <span className="text-xs font-semibold text-slate-500">
                          Mutual Match
                        </span>
                      }
                      headerStatusRight={
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80">
                          <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                          <span>Connected</span>
                        </span>
                      }
                      messageSnippet={match.message}
                      actionsFooter={
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenChat(match.user?.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-rose-600 hover:bg-rose-100/60 transition-colors font-bold text-xs cursor-pointer group"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                            <span>Message</span>
                          </button>

                          {match.user?.phoneNumber ? (
                            <a
                              href={`tel:${match.user.phoneNumber}`}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-emerald-600 hover:bg-emerald-50 transition-colors font-bold text-xs cursor-pointer group"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                              <span>Call</span>
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                alert(`Call audio/video invitation sent to ${profile.displayName || "Member"}!`)
                              }
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-emerald-600 hover:bg-emerald-50 transition-colors font-bold text-xs cursor-pointer group"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                              <span>Call</span>
                            </button>
                          )}
                        </>
                      }
                    />
                  );
                })}
              </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
};
