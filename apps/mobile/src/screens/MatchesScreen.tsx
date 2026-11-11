import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import {
  Heart,
  Check,
  X,
  Clock,
  Sparkles,
  Shield,
  MessageCircle,
} from "lucide-react-native";

type MatchesTab = "received" | "accepted" | "sent";

export const MatchesScreen: React.FC<{ onNavigateToChat?: (partnerId: string) => void }> = ({
  onNavigateToChat,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MatchesTab>("received");

  // Fetch Received Interests
  const {
    data: receivedInterests = [],
    isLoading: loadingReceived,
    refetch: refetchReceived,
    isRefetching: refetchingReceived,
  } = useQuery({
    queryKey: QUERY_KEYS.receivedInterests,
    queryFn: async () => {
      const res = await api.get("/matches/interests/received");
      return res.data;
    },
    enabled: activeTab === "received",
  });

  // Fetch Accepted Matches
  const {
    data: acceptedMatches = [],
    isLoading: loadingAccepted,
    refetch: refetchAccepted,
    isRefetching: refetchingAccepted,
  } = useQuery({
    queryKey: QUERY_KEYS.matchesRecent,
    queryFn: async () => {
      const res = await api.get("/matches/accepted");
      return res.data;
    },
    enabled: activeTab === "accepted",
  });

  // Fetch Sent Interests
  const {
    data: sentInterests = [],
    isLoading: loadingSent,
    refetch: refetchSent,
    isRefetching: refetchingSent,
  } = useQuery({
    queryKey: QUERY_KEYS.sentInterests,
    queryFn: async () => {
      const res = await api.get("/matches/interests/sent");
      return res.data;
    },
    enabled: activeTab === "sent",
  });

  // Respond to interest (ACCEPT or DECLINE)
  const respondMutation = useMutation({
    mutationFn: async ({
      interestId,
      action,
    }: {
      interestId: string;
      action: "ACCEPT" | "DECLINE";
    }) => {
      return api.post(`/matches/interest/${interestId}/respond`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receivedInterests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matchesRecent });
    },
  });

  const isLoading =
    (activeTab === "received" && loadingReceived) ||
    (activeTab === "accepted" && loadingAccepted) ||
    (activeTab === "sent" && loadingSent);

  const isRefetching =
    (activeTab === "received" && refetchingReceived) ||
    (activeTab === "accepted" && refetchingAccepted) ||
    (activeTab === "sent" && refetchingSent);

  const handleRefresh = () => {
    if (activeTab === "received") refetchReceived();
    else if (activeTab === "accepted") refetchAccepted();
    else if (activeTab === "sent") refetchSent();
  };

  const renderReceivedItem = ({ item }: { item: any }) => {
    const senderProfile = item.sender?.profile || item.profile || {};
    const photo = senderProfile.photos?.[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

    return (
      <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <Image
            source={{ uri: photo }}
            className="w-14 h-14 rounded-full border border-brand-500/40"
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <Text className="text-white font-bold text-base">
              {senderProfile.displayName || "Member"}, {senderProfile.age || "28"}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {senderProfile.city || "Mumbai"} • {senderProfile.occupation || "Professional"}
            </Text>
            {item.message ? (
              <Text numberOfLines={1} className="text-pink-300 text-xs mt-1 italic">
                "{item.message}"
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => respondMutation.mutate({ interestId: item.id, action: "DECLINE" })}
            className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center border border-slate-700"
          >
            <X size={18} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => respondMutation.mutate({ interestId: item.id, action: "ACCEPT" })}
            className="w-10 h-10 rounded-full bg-brand-600 items-center justify-center shadow-md shadow-brand-500/30"
          >
            <Check size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAcceptedItem = ({ item }: { item: any }) => {
    const partner = item.user?.profile || item.profile || item;
    const photo = partner.photos?.[0]?.url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";
    const partnerUserId = item.user?.id || item.userId || partner.userId;

    return (
      <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <Image
            source={{ uri: photo }}
            className="w-14 h-14 rounded-full border border-emerald-500"
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-base">
                {partner.displayName || "Partner"}
              </Text>
              <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full ml-2">
                <Text className="text-emerald-400 text-[10px] font-bold">MATCH</Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs mt-0.5">
              {partner.city || "India"} • Mutual connection
            </Text>
          </View>
        </View>

        {onNavigateToChat && partnerUserId && (
          <TouchableOpacity
            onPress={() => onNavigateToChat(partnerUserId)}
            className="px-4 py-2 bg-brand-600 rounded-xl flex-row items-center shadow-sm"
          >
            <MessageCircle size={15} color="#ffffff" />
            <Text className="text-white font-semibold text-xs ml-1.5">Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSentItem = ({ item }: { item: any }) => {
    const receiverProfile = item.receiver?.profile || item.profile || {};
    const photo = receiverProfile.photos?.[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

    return (
      <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <Image
            source={{ uri: photo }}
            className="w-14 h-14 rounded-full border border-slate-700"
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <Text className="text-white font-bold text-base">
              {receiverProfile.displayName || "Member"}
            </Text>
            <Text className="text-slate-400 text-xs mt-0.5">
              {receiverProfile.city || "India"} • {receiverProfile.occupation || "Member"}
            </Text>
          </View>
        </View>

        <View className="bg-slate-800 px-3 py-1.5 rounded-full flex-row items-center border border-slate-700">
          <Clock size={12} color="#f59e0b" />
          <Text className="text-amber-400 text-xs font-semibold ml-1">
            {item.status || "PENDING"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-950 p-4">
      {/* Header Tabs */}
      <View className="flex-row bg-slate-900 rounded-2xl p-1 mb-4 border border-slate-800">
        <TouchableOpacity
          onPress={() => setActiveTab("received")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "received" ? "bg-brand-600" : ""
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              activeTab === "received" ? "text-white" : "text-slate-400"
            }`}
          >
            Received
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("accepted")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "accepted" ? "bg-brand-600" : ""
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              activeTab === "accepted" ? "text-white" : "text-slate-400"
            }`}
          >
            Matches
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("sent")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "sent" ? "bg-brand-600" : ""
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              activeTab === "sent" ? "text-white" : "text-slate-400"
            }`}
          >
            Sent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f43f5e" />
        </View>
      ) : (
        <FlatList
          data={
            activeTab === "received"
              ? receivedInterests
              : activeTab === "accepted"
              ? acceptedMatches
              : sentInterests
          }
          keyExtractor={(item) => item.id || String(Math.random())}
          renderItem={
            activeTab === "received"
              ? renderReceivedItem
              : activeTab === "accepted"
              ? renderAcceptedItem
              : renderSentItem
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#f43f5e"
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-4">
              <Sparkles size={40} color="#64748b" />
              <Text className="text-white text-base font-bold mt-4 text-center">
                {activeTab === "received"
                  ? "No received interests yet"
                  : activeTab === "accepted"
                  ? "No mutual matches yet"
                  : "No sent interests yet"}
              </Text>
              <Text className="text-slate-400 text-xs text-center mt-1">
                {activeTab === "received"
                  ? "When members express interest in your profile, they will appear here!"
                  : activeTab === "accepted"
                  ? "When both members send interest, conversations unlock here!"
                  : "Explore the Discover tab and send interests to connect."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};
