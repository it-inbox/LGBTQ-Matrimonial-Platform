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
import { Send, Check, X, Clock } from "lucide-react-native";

export const InterestsScreen: React.FC<{ onNavigateToChat?: (partnerId: string) => void }> = ({
  onNavigateToChat,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");

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
      return api.post(`/matches/interests/${interestId}/respond`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receivedInterests });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matchesRecent });
    },
  });

  const isLoading = activeTab === "received" ? loadingReceived : loadingSent;
  const isRefetching = activeTab === "received" ? refetchingReceived : refetchingSent;
  const onRefresh = activeTab === "received" ? refetchReceived : refetchSent;
  const currentData = activeTab === "received" ? receivedInterests : sentInterests;

  const renderEmptyState = () => (
    <View className="py-16 items-center justify-center px-4">
      <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center mb-4">
        <Send size={28} color="#e11d48" />
      </View>
      <Text className="text-slate-800 font-bold text-lg text-center mb-1">
        {activeTab === "received" ? "No Received Interests" : "No Sent Interests"}
      </Text>
      <Text className="text-slate-500 text-sm text-center max-w-xs leading-5">
        {activeTab === "received"
          ? "When other members express interest in your profile, they will show up here."
          : "Profiles you've sent interest to will appear here until they respond."}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const isReceived = activeTab === "received";
    const partner = (isReceived ? item.sender : item.receiver) || {};
    const photoUrl =
      partner.photos?.find((p: any) => p.isPrimary)?.thumbnailUrl ||
      partner.photos?.[0]?.thumbnailUrl ||
      partner.photoUrl;

    const isPending = item.status === "PENDING";
    const isAccepted = item.status === "ACCEPTED";
    const isDeclined = item.status === "DECLINED";

    return (
      <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-200/80 shadow-xs">
        <View className="flex-row items-center">
          <View className="relative">
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                className="w-13 h-13 rounded-full bg-slate-100"
                contentFit="cover"
              />
            ) : (
              <View className="w-13 h-13 rounded-full bg-rose-100 items-center justify-center">
                <Text className="text-rose-600 font-bold text-base">
                  {(partner.displayName || partner.name || "?")[0]?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1 ml-3.5">
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-base text-slate-800" numberOfLines={1}>
                {partner.displayName || partner.name || "Member"}
              </Text>
              <View
                className={`px-2 py-0.5 rounded-full ${
                  isAccepted
                    ? "bg-emerald-50"
                    : isDeclined
                    ? "bg-rose-50"
                    : "bg-amber-50"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    isAccepted
                      ? "text-emerald-700"
                      : isDeclined
                      ? "text-rose-600"
                      : "text-amber-700"
                  }`}
                >
                  {item.status || "PENDING"}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
              {[partner.age ? `${partner.age} yrs` : null, partner.city, partner.state]
                .filter(Boolean)
                .join(" • ") || "Community Member"}
            </Text>
          </View>
        </View>

        {/* Action buttons for received pending interests */}
        {isReceived && isPending && (
          <View className="flex-row items-center justify-end gap-2.5 mt-3 pt-3 border-t border-slate-100">
            <TouchableOpacity
              onPress={() =>
                respondMutation.mutate({ interestId: item.id, action: "DECLINE" })
              }
              disabled={respondMutation.isPending}
              className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white"
            >
              <Text className="text-xs font-semibold text-slate-600">Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                respondMutation.mutate({ interestId: item.id, action: "ACCEPT" })
              }
              disabled={respondMutation.isPending}
              className="px-4 py-1.5 rounded-full bg-rose-600"
            >
              <Text className="text-xs font-bold text-white">Accept Interest</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-5 pt-3 pb-2 bg-white border-b border-slate-200">
        <Text className="text-xl font-bold text-slate-900">Interests</Text>
        <Text className="text-xs text-slate-500 mt-0.5">
          Track and respond to expression of interest
        </Text>

        {/* Tabs: Received / Sent */}
        <View className="flex-row bg-slate-100 rounded-xl p-1 mt-3">
          <TouchableOpacity
            onPress={() => setActiveTab("received")}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              activeTab === "received" ? "bg-white shadow-xs" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "received" ? "text-rose-600" : "text-slate-600"
              }`}
            >
              Received
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("sent")}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              activeTab === "sent" ? "bg-white shadow-xs" : ""
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                activeTab === "sent" ? "text-rose-600" : "text-slate-600"
              }`}
            >
              Sent
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#e11d48" />
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id || String(Math.random())}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                onRefresh();
              }}
              tintColor="#e11d48"
            />
          }
        />
      )}
    </View>
  );
};
