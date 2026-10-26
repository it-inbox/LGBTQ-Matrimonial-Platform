import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Search, Phone, ArrowRight } from "lucide-react";
import { ActivitySidebar } from "../../components/layout/ActivitySidebar";
import { ActiveChatView } from "../../components/chat/ActiveChatView";
import { api } from "../../lib/api";
import { useChatStore, ConversationItem } from "../../stores/chat.store";

export const MessengerPage: React.FC = () => {
  const connectSocket = useChatStore((s) => s.connectSocket);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const onlineUserIds = useChatStore((s) => s.onlineUserIds);
  const setTotalUnreadCount = useChatStore((s) => s.setTotalUnreadCount);

  const [mainTab, setMainTab] = useState<"messages" | "calls">("messages");
  const [filterPill, setFilterPill] = useState<"all" | "unread" | "online">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Connect socket on mount
  useEffect(() => {
    connectSocket();
  }, [connectSocket]);

  // 1. Fetch conversations
  const {
    data: conversations = [],
    isLoading: loadingConversations,
  } = useQuery<ConversationItem[]>({
    queryKey: ["conversations", filterPill],
    queryFn: async () => {
      const res = await api.get(`/chat/conversations?filter=${filterPill}`);
      return res.data;
    },
    refetchInterval: 12000,
  });

  // Calculate total unread
  useEffect(() => {
    if (!conversations || conversations.length === 0) {
      setTotalUnreadCount(0);
      return;
    }
    const total = conversations.reduce((acc, c) => acc + (c?.unreadCount || 0), 0);
    setTotalUnreadCount(total);
  }, [conversations, setTotalUnreadCount]);

  // Filter conversations by local search query
  const filteredConversations = (conversations || []).filter((c) => {
    if (!c || !c.partner) return false;
    if (!searchQuery.trim()) return true;
    const name = c.partner.displayName || "Member";
    const city = c.partner.city || "";
    const nameMatch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const cityMatch = city.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || cityMatch;
  });

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 h-full flex flex-col">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Left Sidebar */}
        <ActivitySidebar activeTab="messenger" />

        {/* Center Main Content: Connect Column */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          {/* Connect Main Card */}
          <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
            {/* Conversations Section Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5 shrink-0">
              {/* Messages | Calls Primary Navigation Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-100 text-xs sm:text-sm font-bold pb-2">
                <button
                  type="button"
                  onClick={() => setMainTab("messages")}
                  className={`pb-1 relative cursor-pointer transition-colors ${
                    mainTab === "messages"
                      ? "text-slate-900 after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-rose-500"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Messages
                </button>
                <button
                  type="button"
                  onClick={() => setMainTab("calls")}
                  className={`pb-1 relative cursor-pointer transition-colors ${
                    mainTab === "calls"
                      ? "text-slate-900 after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-rose-500"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Calls
                </button>
              </div>

              {/* Sub-Filters: All (Pill) | Unread (Pill) | Online (Pill) */}
              {mainTab === "messages" && (
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none text-xs">
                  {(["all", "unread", "online"] as const).map((pill) => {
                    const isSelected = filterPill === pill;
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setFilterPill(pill)}
                        className={`px-3 py-1.5 rounded-full font-semibold shrink-0 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-rose-50 border border-rose-500 text-rose-600 shadow-2xs"
                            : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {pill.charAt(0).toUpperCase() + pill.slice(1)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {mainTab === "calls" ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-50/50">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Call History</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Audio & video calls with your accepted matches will appear here.
                </p>
              </div>
            ) : (
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
              {/* Left Column: Conversation List */}
              <div
                className={`w-full lg:w-80 border-r border-slate-100 flex flex-col h-full overflow-hidden ${
                  activeConversation ? "hidden lg:flex" : "flex"
                }`}
              >
                {/* Search in conversations */}
                <div className="p-3 border-b border-slate-100 shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-500 text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Conversation List Stream */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {loadingConversations ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                          <div className="w-11 h-11 bg-slate-200 rounded-full" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 bg-slate-200 rounded w-24" />
                            <div className="h-2.5 bg-slate-100 rounded w-36" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    /* Empty State styled identical to screenshot illustration */
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="w-20 h-16 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-center p-2 shadow-xs">
                        <div className="flex items-center gap-1 text-amber-500">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {filterPill === "online"
                          ? "No one is online right now"
                          : "No conversations found"}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        {filterPill === "online"
                          ? "Your online conversations will appear here when someone comes online."
                          : "Accept mutual interests or start chatting with your matches."}
                      </p>
                      {filterPill !== "all" && (
                        <button
                          type="button"
                          onClick={() => setFilterPill("all")}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer pt-1"
                        >
                          <span>View All Messages</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      if (!conv || !conv.partner) return null;
                      const partnerName = conv.partner.displayName || "Member";
                      const isSelected = conv.id === activeConversationId;
                      const isOnline =
                        conv.partner.isOnline || (conv.partner.id ? onlineUserIds.has(conv.partner.id) : false);

                      return (
                        <button
                          key={conv.id}
                          type="button"
                          onClick={() => setActiveConversationId(conv.id)}
                          className={`w-full text-left p-3.5 flex items-center gap-3 transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-rose-50/60 border-l-4 border-rose-500"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-brand-600 to-rose-400">
                              {conv.partner.avatarUrl ? (
                                <img
                                  src={conv.partner.avatarUrl}
                                  alt={partnerName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                  {partnerName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            {isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {partnerName}
                              </h4>
                              {conv.lastMessage && (
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-xs text-slate-500 truncate max-w-[170px]">
                                {conv.lastMessage?.content || "Say hello..."}
                              </p>
                              {conv.unreadCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Active Thread / Select Conversation Placeholder */}
              <div
                className={`flex-1 h-full min-h-0 ${
                  activeConversation ? "flex" : "hidden lg:flex"
                }`}
              >
                {activeConversation ? (
                  <div className="flex-1 h-full min-h-0">
                    <ActiveChatView
                      conversation={activeConversation}
                      onBack={() => setActiveConversationId(null)}
                    />
                  </div>
                ) : (
                  <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-brand-600 mb-3">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Select a Conversation
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      Pick a conversation from the list to start chatting.
                    </p>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
