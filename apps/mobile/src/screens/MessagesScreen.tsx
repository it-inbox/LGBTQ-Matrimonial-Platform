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
  Circle,
  Clock,
} from "lucide-react-native";

export const MessagesScreen: React.FC<{ initialPartnerUserId?: string | null }> = ({
  initialPartnerUserId,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [messageText, setMessageText] = useState("");
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

  // If in an active conversation detail view
  if (selectedConversation) {
    const partner =
      selectedConversation.partner ||
      (selectedConversation.user1Id === user?.id
        ? selectedConversation.user2
        : selectedConversation.user1) ||
      {};
    const partnerProfile = partner.profile || partner;
    const photo =
      partnerProfile.photos?.[0]?.url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

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

          <Image
            source={{ uri: photo }}
            className="w-10 h-10 rounded-full border border-rose-200"
            contentFit="cover"
          />

          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-slate-900 font-bold text-base">
                {partnerProfile.displayName || "Member"}
              </Text>
              {partner.isVerified && (
                <Shield size={13} color="#10b981" style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text className="text-slate-500 text-xs">
              {[partnerProfile.city, partnerProfile.state].filter(Boolean).join(", ") || "India"}
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
                        ? "bg-rose-600 rounded-tr-none shadow-xs"
                        : "bg-white border border-slate-200 rounded-tl-none shadow-xs"
                    }`}
                  >
                    <Text
                      className={`text-sm leading-5 ${
                        isMine ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {item.content}
                    </Text>
                  </View>
                  <Text className="text-[10px] text-slate-400 mt-1 px-1">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-24">
                <MessageSquare size={36} color="#cbd5e1" />
                <Text className="text-slate-700 font-bold text-sm mt-3">
                  Say hello to {partnerProfile.displayName}!
                </Text>
                <Text className="text-slate-400 text-xs mt-1 text-center max-w-xs">
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

  // Conversations List View
  return (
    <View className="flex-1 bg-slate-50">
      {/* Title Header */}
      <View className="px-5 py-4 bg-white border-b border-slate-200/90">
        <Text className="text-xl font-bold text-slate-900">Messages</Text>
      </View>

      {loadingConversations ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e11d48" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id || String(Math.random())}
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
          renderItem={({ item }) => {
            const partner =
              item.partner ||
              (item.user1Id === user?.id ? item.user2 : item.user1) ||
              {};
            const partnerProfile = partner.profile || partner;
            const photo =
              partnerProfile.photos?.[0]?.url ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

            return (
              <TouchableOpacity
                onPress={() => setSelectedConversation(item)}
                className="flex-row items-center p-4 bg-white border-b border-slate-100 active:bg-slate-50"
              >
                <Image
                  source={{ uri: photo }}
                  className="w-14 h-14 rounded-full border border-rose-200"
                  contentFit="cover"
                />
                <View className="ml-3.5 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-900 font-bold text-base">
                      {partnerProfile.displayName || "Member"}
                    </Text>
                    {item.lastMessageAt && (
                      <Text className="text-[11px] text-slate-400">
                        {new Date(item.lastMessageAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    )}
                  </View>
                  <Text numberOfLines={1} className="text-slate-500 text-xs mt-1">
                    {item.lastMessageContent || "Start a new conversation..."}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24 px-6">
              <MessageSquare size={48} color="#cbd5e1" />
              <Text className="text-slate-800 text-base font-bold mt-4 text-center">
                No active conversations
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
