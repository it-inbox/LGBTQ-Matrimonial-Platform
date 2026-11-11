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
    refetchInterval: 5000, // Poll every 5s for mobile web simplicity
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
        (c: any) => c.partner?.userId === initialPartnerUserId || c.partner?.id === initialPartnerUserId
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

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  // Render individual chat conversation in list
  const renderConversationItem = ({ item }: { item: any }) => {
    const partner = item.partner || {};
    const photo = partner.photos?.[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
    const lastMsg = item.lastMessage?.content || "Say hello to your match!";

    return (
      <TouchableOpacity
        onPress={() => setSelectedConversation(item)}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center"
      >
        <Image
          source={{ uri: photo }}
          className="w-13 h-13 rounded-full border border-slate-700"
          style={{ width: 52, height: 52, borderRadius: 26 }}
          contentFit="cover"
        />
        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-bold text-base">
              {partner.displayName || "Match"}
            </Text>
            {item.lastMessage?.createdAt && (
              <Text className="text-slate-500 text-[10px]">
                {new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            )}
          </View>
          <Text numberOfLines={1} className="text-slate-400 text-xs mt-1">
            {lastMsg}
          </Text>
        </View>

        {item.unreadCount > 0 && (
          <View className="bg-brand-600 rounded-full w-5 h-5 items-center justify-center ml-2">
            <Text className="text-white text-[10px] font-bold">{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // If conversation is open, render Chat View
  if (selectedConversation) {
    const partner = selectedConversation.partner || {};
    const photo = partner.photos?.[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-slate-950"
      >
        {/* Chat Header */}
        <View className="flex-row items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <TouchableOpacity
            onPress={() => setSelectedConversation(null)}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1 ml-2">
            <Image
              source={{ uri: photo }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
              contentFit="cover"
            />
            <View className="ml-2.5">
              <Text className="text-white font-bold text-sm">
                {partner.displayName || "Partner"}
              </Text>
              <Text className="text-emerald-400 text-[10px] font-medium">Online</Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        {loadingMessages ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#f43f5e" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(msg) => msg.id || String(Math.random())}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const isMine = item.senderId === user?.id;
              return (
                <View
                  className={`mb-3 max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isMine
                      ? "self-end bg-brand-600 rounded-br-xs"
                      : "self-start bg-slate-800 rounded-bl-xs"
                  }`}
                >
                  <Text className="text-white text-sm">{item.content}</Text>
                  <Text
                    className={`text-[9px] mt-1 self-end ${
                      isMine ? "text-pink-200" : "text-slate-400"
                    }`}
                  >
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
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-slate-400 text-xs">
                  This conversation is end-to-end private. Send a greeting! 👋
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <View className="flex-row items-center p-3 bg-slate-900 border-t border-slate-800">
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type your message..."
            placeholderTextColor="#64748b"
            className="flex-1 bg-slate-800 text-white rounded-full px-4 py-2.5 text-sm mr-2"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!messageText.trim() || sendMutation.isPending}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              messageText.trim() ? "bg-brand-600" : "bg-slate-800"
            }`}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Send size={16} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Otherwise render conversation list
  return (
    <View className="flex-1 bg-slate-950 p-4">
      <Text className="text-white text-xl font-bold mb-4">Messages</Text>

      {loadingConversations ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f43f5e" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id || String(Math.random())}
          renderItem={renderConversationItem}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-24 px-6">
              <MessageSquare size={44} color="#64748b" />
              <Text className="text-white text-base font-bold mt-4 text-center">
                No active conversations
              </Text>
              <Text className="text-slate-400 text-xs text-center mt-1">
                When you connect with mutual matches, direct messaging threads will appear here!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};
