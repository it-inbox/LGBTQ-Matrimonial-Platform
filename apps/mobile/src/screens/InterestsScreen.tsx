import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import { Send } from "lucide-react-native";
import { MobileProfileCard } from "../components/MobileProfileCard";

type StatusFilter = "ALL" | "PENDING" | "ACCEPTED" | "DECLINED";

export const InterestsScreen: React.FC<{ onNavigateToChat?: (partnerId: string) => void }> = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

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
  const rawList = activeTab === "received" ? receivedInterests : sentInterests;

  // Filtered list based on inline selectable pill chips
  const filteredList = (rawList || []).filter((item: any) => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  const renderEmptyState = () => (
    <View className="py-16 items-center justify-center px-4">
      <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center mb-4">
        <Send size={28} color="#e11d48" />
      </View>
      <Text className="text-slate-800 font-bold text-lg text-center mb-1">
        {statusFilter === "ALL"
          ? activeTab === "received"
            ? "No Received Interests"
            : "No Sent Interests"
          : `No ${statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()} Interests`}
      </Text>
      <Text className="text-slate-500 text-sm text-center max-w-xs leading-5">
        {activeTab === "received"
          ? "When other members express interest in your profile, they will show up here."
          : "Profiles you've sent interest to will appear here until they respond."}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Container (Without "Interests" title or subtitle) */}
      <View className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200">
        {/* Preserved Received / Sent Toggle Bar */}
        <View className="flex-row bg-slate-100 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => {
              setActiveTab("received");
              setStatusFilter("ALL");
            }}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              activeTab === "received" ? "bg-white shadow-xs" : ""
            }`}
            activeOpacity={0.7}
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
            onPress={() => {
              setActiveTab("sent");
              setStatusFilter("ALL");
            }}
            className={`flex-1 py-1.5 rounded-lg items-center ${
              activeTab === "sent" ? "bg-white shadow-xs" : ""
            }`}
            activeOpacity={0.7}
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

        {/* Inline Selectable Pill Chips: All Interests, Pending, Accepted, Declined */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3 flex-row"
          contentContainerStyle={{ gap: 8 }}
        >
          {(["ALL", "PENDING", "ACCEPTED", "DECLINED"] as const).map((filter) => {
            const count = (rawList || []).filter((item: any) =>
              filter === "ALL" ? true : item.status === filter
            ).length;
            const isSelected = statusFilter === filter;
            const label =
              filter === "ALL"
                ? "All Interests"
                : filter.charAt(0) + filter.slice(1).toLowerCase();

            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-full flex-row items-center ${
                  isSelected ? "bg-slate-900" : "bg-slate-100"
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? "text-white" : "text-slate-700"
                  }`}
                >
                  {label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#e11d48" />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id || String(Math.random())}
          renderItem={({ item }) => (
            <MobileProfileCard
              item={item}
              isReceived={activeTab === "received"}
              onAccept={() =>
                respondMutation.mutate({ interestId: item.id, action: "ACCEPT" })
              }
              onDecline={() =>
                respondMutation.mutate({ interestId: item.id, action: "DECLINE" })
              }
              isResponding={respondMutation.isPending}
            />
          )}
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
