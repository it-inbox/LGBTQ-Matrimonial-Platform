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
    const photo =
      senderProfile.photos?.[0]?.url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

    return (
      <View className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <Image
            source={{ uri: photo }}
            className="w-14 h-14 rounded-full border border-rose-200"
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text className="text-slate-900 font-bold text-base">
                {senderProfile.displayName || "Member"}
              </Text>
              {item.sender?.isVerified && (
                <Shield size={13} color="#10b981" style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text className="text-slate-500 text-xs mt-0.5">
              {[senderProfile.city, senderProfile.state].filter(Boolean).join(", ") || "India"} •{" "}
              {senderProfile.occupation || senderProfile.profession || "Member"}
            </Text>
            {item.message && (
              <Text numberOfLines={1} className="text-slate-600 text-xs italic mt-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                "{item.message}"
              </Text>
            )}
          </View>
        </View>

        {/* Accept / Decline actions */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() =>
              respondMutation.mutate({
                interestId: item.id,
                action: "DECLINE",
              })
            }
            disabled={respondMutation.isPending}
            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 items-center justify-center active:bg-slate-200"
          >
            <X size={16} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              respondMutation.mutate({
                interestId: item.id,
                action: "ACCEPT",
              })
            }
            disabled={respondMutation.isPending}
            className="w-9 h-9 rounded-full bg-rose-600 items-center justify-center active:bg-rose-700 shadow-xs"
          >
            <Check size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAcceptedItem = ({ item }: { item: any }) => {
    const partner = item.user1 || item.user2 || item.partner || {};
    const partnerProfile = partner.profile || item.profile || {};
    const photo =
      partnerProfile.photos?.[0]?.url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

    return (
      <View className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <Image
            source={{ uri: photo }}
            className="w-14 h-14 rounded-full border border-rose-200"
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
            <Text className="text-slate-500 text-xs mt-0.5">
              {[partnerProfile.city, partnerProfile.state].filter(Boolean).join(", ") || "India"} •{" "}
              {partnerProfile.occupation || partnerProfile.profession || "Member"}
            </Text>
          </View>
        </View>

        {onNavigateToChat && (
          <TouchableOpacity
            onPress={() => onNavigateToChat(partner.id || partner.userId)}
            className="bg-rose-600 px-3.5 py-2 rounded-xl flex-row items-center active:bg-rose-700 shadow-xs"
          >
            <MessageCircle size={14} color="#ffffff" />
            <Text className="text-white text-xs font-bold ml-1.5">Chat</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSentItem = ({ item }: { item: any }) => {
    const receiverProfile = item.receiver?.profile || item.profile || {};
    const photo =
      receiverProfile.photos?.[0]?.url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

    return (
      <View className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3">
          <Image
            source={{ uri: photo }}
            className="w-14 h-14 rounded-full border border-slate-200"
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <Text className="text-slate-900 font-bold text-base">
              {receiverProfile.displayName || "Member"}
            </Text>
            <Text className="text-slate-500 text-xs mt-0.5">
              {[receiverProfile.city, receiverProfile.state].filter(Boolean).join(", ") || "India"} •{" "}
              {receiverProfile.occupation || receiverProfile.profession || "Member"}
            </Text>
          </View>
        </View>

        <View className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full flex-row items-center">
          <Clock size={12} color="#d97706" />
          <Text className="text-amber-700 text-xs font-semibold ml-1">
            {item.status || "PENDING"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 p-4">
      {/* Header Segmented Tabs matching Web */}
      <View className="flex-row bg-slate-100 rounded-2xl p-1 mb-4 border border-slate-200">
        <TouchableOpacity
          onPress={() => setActiveTab("received")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "received" ? "bg-rose-600 shadow-xs" : ""
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === "received" ? "text-white" : "text-slate-600"
            }`}
          >
            Received
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("accepted")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "accepted" ? "bg-rose-600 shadow-xs" : ""
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === "accepted" ? "text-white" : "text-slate-600"
            }`}
          >
            Matches
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("sent")}
          className={`flex-1 py-2.5 rounded-xl items-center ${
            activeTab === "sent" ? "bg-rose-600 shadow-xs" : ""
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              activeTab === "sent" ? "text-white" : "text-slate-600"
            }`}
          >
            Sent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e11d48" />
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
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#e11d48"
              colors={["#e11d48"]}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20 px-4">
              <Sparkles size={44} color="#cbd5e1" />
              <Text className="text-slate-800 text-base font-bold mt-4 text-center">
                {activeTab === "received"
                  ? "No received interests yet"
                  : activeTab === "accepted"
                  ? "No mutual matches yet"
                  : "No sent interests yet"}
              </Text>
              <Text className="text-slate-500 text-xs text-center mt-1 max-w-xs leading-4">
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
