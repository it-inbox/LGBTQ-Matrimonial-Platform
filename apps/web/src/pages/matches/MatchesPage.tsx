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
  Ban,
} from "lucide-react";
import { useChatStore } from "../../stores/chat.store";
import { Badge } from "../../components/ui/Badge";

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
                  <div
                    key={i}
                    className="h-64 sm:h-72 rounded-2xl bg-white border border-slate-200/90 shadow-card flex flex-row overflow-hidden animate-pulse"
                  >
                    <div className="w-36 xs:w-44 sm:w-56 md:w-60 h-full shrink-0 bg-slate-200/70" />
                    <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-28 bg-slate-200 rounded-md" />
                          <div className="h-4 w-16 bg-slate-100 rounded-full" />
                        </div>
                        <div className="h-5 w-44 bg-slate-200 rounded-md" />
                        <div className="space-y-2 pt-2">
                          <div className="h-3 w-48 bg-slate-100 rounded-md" />
                          <div className="h-3 w-40 bg-slate-100 rounded-md" />
                        </div>
                      </div>
                      <div className="h-10 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 border-t border-slate-100 bg-slate-50/70" />
                    </div>
                  </div>
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
                      userId={match.user?.id}
                      badge="matched"
                      headerStatusLeft={
                        <span className="text-xs font-semibold text-slate-500">
                          Mutual Match
                        </span>
                      }
                      headerStatusRight={
                        match.isBlockedByMe ? (
                          <Badge variant="danger" icon={<Ban className="w-3.5 h-3.5" />}>
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="success" icon={<Heart className="w-3.5 h-3.5 fill-current" />}>
                            Connected
                          </Badge>
                        )
                      }
                      messageSnippet={match.message}
                      actionsFooter={
                        match.isBlockedByMe ? (
                          <div className="py-2 px-3 text-center text-xs font-semibold text-rose-600 bg-rose-50/50 rounded-xl w-full">
                            You blocked this member. Tap profile to manage.
                          </div>
                        ) : (
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
                        )
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
