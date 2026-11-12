import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import { useAuthStore } from "../stores/auth.store";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Shield,
  PhoneCall,
  Check,
  CheckCheck,
} from "lucide-react-native";

type ConnectTab = "messages" | "calls";
type ChatFilter = "ALL" | "UNREAD" | "ONLINE";

export const MessagesScreen: React.FC<{ initialPartnerUserId?: string | null }> = ({
  initialPartnerUserId,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState<ConnectTab>("messages");
  const [chatFilter, setChatFilter] = useState<ChatFilter>("ALL");
  const flatListRef = useRef<FlatList>(null);

  // 1. Fetch conversations list
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: QUERY_KEYS.conversations,
    queryFn: async () => {
      const res = await api.get("/chat/conversations");
      return res.data;
    },
    refetchInterval: 5000,
  });

  // 2. Fetch messages for active conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: QUERY_KEYS.messages(selectedConversation?.id || ""),
    queryFn: async () => {
      if (!selectedConversation?.id) return [];
      const res = await api.get(`/chat/conversations/${selectedConversation.id}/messages`);
      return res.data;
    },
    enabled: !!selectedConversation?.id,
    refetchInterval: 3000,
  });

  // Automatically select conversation if partnerUserId was passed
  useEffect(() => {
    if (initialPartnerUserId && conversations.length > 0) {
      const match = conversations.find(
        (c: any) =>
          c.partner?.userId === initialPartnerUserId ||
          c.partner?.id === initialPartnerUserId ||
          c.user1Id === initialPartnerUserId ||
          c.user2Id === initialPartnerUserId
      );
      if (match) setSelectedConversation(match);
    }
  }, [initialPartnerUserId, conversations]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      return api.post(`/chat/conversations/${selectedConversation.id}/messages`, {
        content: text,
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.messages(selectedConversation?.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.conversations });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation?.id) return;
    sendMutation.mutate(messageText.trim());
  };

  // Helper to extract partner photo and display info
  const getPartnerInfo = (conversationItem: any) => {
    const partner =
      conversationItem.partner ||
      (conversationItem.user1Id === user?.id
        ? conversationItem.user2
        : conversationItem.user1) ||
      {};
    const partnerProfile = partner.profile || partner;
    const displayName = partner.displayName || partnerProfile.displayName || "Member";

    const photoUrl =
      partner.avatarUrl ||
      partnerProfile.photos?.find((p: any) => p.isPrimary)?.originalUrl ||
      partnerProfile.photos?.find((p: any) => p.isPrimary)?.thumbnailUrl ||
      partnerProfile.photos?.[0]?.originalUrl ||
      partnerProfile.photos?.[0]?.url ||
      partnerProfile.photoUrl ||
      null;

    const isOnline = !!partner.isOnline;
    const initial = (displayName || "?")[0]?.toUpperCase();
    const initials = (displayName || "Member")
      .trim()
      .split(/\s+/)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return {
      partner,
      partnerProfile,
      displayName,
      photoUrl,
      isOnline,
      initial,
      initials,
    };
  };

  // Calculate filter counts
  const allCount = conversations.length;
  const unreadCount = conversations.filter(
    (c: any) => (c.unreadCount || 0) > 0 || (c.lastMessage && !c.lastMessage.isRead && !c.lastMessage.isOwn)
  ).length;
  const onlineCount = conversations.filter((c: any) => {
    const info = getPartnerInfo(c);
    return info.isOnline;
  }).length;

  // Filter conversations
  const filteredConversations = conversations.filter((c: any) => {
    if (chatFilter === "UNREAD") {
      return (c.unreadCount || 0) > 0 || (c.lastMessage && !c.lastMessage.isRead && !c.lastMessage.isOwn);
    }
    if (chatFilter === "ONLINE") {
      const info = getPartnerInfo(c);
      return info.isOnline;
    }
    return true;
  });

  // If in an active conversation detail view
  if (selectedConversation) {
    const { partner, partnerProfile, displayName, photoUrl, isOnline, initial } =
      getPartnerInfo(selectedConversation);

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-slate-50"
      >
        {/* Header Bar */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-200/90 shadow-xs">
          <TouchableOpacity
            onPress={() => setSelectedConversation(null)}
            className="p-1.5 -ml-1.5 mr-2 rounded-full active:bg-slate-100"
          >
            <ArrowLeft size={20} color="#334155" />
          </TouchableOpacity>

          <View style={{ width: 44, height: 44 }} className="relative shrink-0">
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
                className="bg-slate-100 border border-slate-200"
                contentFit="cover"
              />
            ) : (
              <View
                style={{ width: 44, height: 44, borderRadius: 22 }}
                className="bg-white border-2 border-rose-500 items-center justify-center shadow-xs"
              >
                <Text className="text-rose-600 font-bold text-xs tracking-wider">
                  {selectedConversation ? getPartnerInfo(selectedConversation).initials : initial}
                </Text>
              </View>
            )}
            {isOnline && (
              <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            )}
          </View>

          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>
                {displayName}
              </Text>
              {partner.isVerified && (
                <Shield size={13} color="#10b981" style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text className="text-slate-500 text-xs" numberOfLines={1}>
              {isOnline
                ? "Online"
                : [partnerProfile.city, partnerProfile.state].filter(Boolean).join(", ") || "Connected"}
            </Text>
          </View>
        </View>

        {/* Message Thread List */}
        {loadingMessages ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#e11d48" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id || String(Math.random())}
            showsVerticalScrollIndicator={true}
            indicatorStyle="black"
            contentContainerStyle={{ padding: 16 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isMine = item.senderId === user?.id;
              return (
                <View
                  className={`mb-3 max-w-[80%] ${
                    isMine ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <View
                    className={`px-4 py-2.5 rounded-2xl ${
                      isMine
                        ? "bg-rose-600 rounded-br-xs"
                        : "bg-white border border-slate-200/90 rounded-bl-xs"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        isMine ? "text-white font-medium" : "text-slate-800"
                      }`}
                    >
                      {item.content}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20 px-6">
                <Text className="text-slate-800 text-sm font-bold text-center">
                  Say Hello to {displayName}!
                </Text>
                <Text className="text-slate-500 text-xs text-center mt-1 max-w-xs leading-4">
                  Your chat is end-to-end encrypted and completely private.
                </Text>
              </View>
            }
          />
        )}

        {/* Chat Input Bar */}
        <View className="flex-row items-center p-3 bg-white border-t border-slate-200/90">
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#94a3b8"
            value={messageText}
            onChangeText={setMessageText}
            onSubmitEditing={handleSendMessage}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-800 text-sm max-h-24"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sendMutation.isPending}
            className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${
              messageText.trim() ? "bg-rose-600 active:bg-rose-700" : "bg-slate-200"
            }`}
          >
            <Send
              size={18}
              color={messageText.trim() ? "#ffffff" : "#94a3b8"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Conversations / Calls List View
  return (
    <View className="flex-1 bg-slate-50">
      {/* Top Segmented Control & Filter Pills (No "Messages" header) */}
      <View className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200">
        {/* Messages / Calls Radio-style Toggle */}
        <View className="flex-row bg-slate-100 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("messages")}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              activeTab === "messages" ? "bg-white shadow-xs" : ""
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "messages" ? "text-rose-600" : "text-slate-600"
              }`}
            >
              Messages
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("calls")}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              activeTab === "calls" ? "bg-white shadow-xs" : ""
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "calls" ? "text-rose-600" : "text-slate-600"
              }`}
            >
              Calls
            </Text>
          </TouchableOpacity>
        </View>

        {/* All / Unread / Online Filter Pills (for Messages tab) */}
        {activeTab === "messages" && (
          <View className="flex-row items-center gap-2 mt-3">
            {[
              { id: "ALL", label: `All (${allCount})` },
              { id: "UNREAD", label: `Unread (${unreadCount})` },
              { id: "ONLINE", label: `Online (${onlineCount})` },
            ].map((chip) => {
              const isSelected = chatFilter === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  onPress={() => setChatFilter(chip.id as ChatFilter)}
                  className={`px-3 py-1.5 rounded-full ${
                    isSelected ? "bg-slate-900" : "bg-slate-100"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isSelected ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Calls Tab Content */}
      {activeTab === "calls" ? (
        <View className="flex-1 items-center justify-center py-24 px-6">
          <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center mb-4">
            <PhoneCall size={32} color="#e11d48" />
          </View>
          <Text className="text-slate-800 text-base font-bold text-center">
            No Call History
          </Text>
          <Text className="text-slate-500 text-xs text-center mt-1.5 max-w-xs leading-4">
            Audio and video call records with your mutual matches will appear here.
          </Text>
        </View>
      ) : loadingConversations ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e11d48" />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id || String(Math.random())}
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
          renderItem={({ item }) => {
            const { displayName, photoUrl, isOnline, initials } = getPartnerInfo(item);
            const lastMsg = item.lastMessage;
            const hasUnread =
              (item.unreadCount || 0) > 0 || (lastMsg && !lastMsg.isRead && !lastMsg.isOwn);

            return (
              <TouchableOpacity
                onPress={() => setSelectedConversation(item)}
                className="flex-row items-center p-4 bg-white border-b border-slate-100 active:bg-slate-50"
                activeOpacity={0.7}
              >
                {/* Real User Picture with Fallback Circle Initial */}
                <View style={{ width: 48, height: 48 }} className="relative shrink-0">
                  {photoUrl ? (
                    <Image
                      source={{ uri: photoUrl }}
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                      className="bg-slate-100 border border-slate-200"
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={{ width: 48, height: 48, borderRadius: 24 }}
                      className="bg-white border-2 border-rose-500 items-center justify-center shadow-xs"
                    >
                      <Text className="text-rose-600 font-bold text-sm tracking-wider">
                        {initials}
                      </Text>
                    </View>
                  )}
                  {isOnline && (
                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </View>

                {/* Conversation Details */}
                <View className="ml-3.5 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-base ${
                        hasUnread ? "font-extrabold text-slate-900" : "font-bold text-slate-800"
                      }`}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                    {item.updatedAt || lastMsg?.createdAt ? (
                      <Text
                        className={`text-[11px] ${
                          hasUnread ? "text-rose-600 font-bold" : "text-slate-400"
                        }`}
                      >
                        {new Date(lastMsg?.createdAt || item.updatedAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    ) : null}
                  </View>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text
                      numberOfLines={1}
                      className={`text-xs flex-1 mr-2 ${
                        hasUnread ? "text-slate-900 font-semibold" : "text-slate-500"
                      }`}
                    >
                      {lastMsg?.content || item.lastMessageContent || "Say hello..."}
                    </Text>
                    {hasUnread && (
                      <View className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24 px-6">
              <MessageSquare size={48} color="#cbd5e1" />
              <Text className="text-slate-800 text-base font-bold mt-4 text-center">
                {chatFilter === "ALL"
                  ? "No active conversations"
                  : `No ${chatFilter.toLowerCase()} conversations`}
              </Text>
              <Text className="text-slate-500 text-xs text-center mt-1.5 max-w-xs leading-4">
                When you connect with mutual matches, direct messaging threads will appear here!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};
