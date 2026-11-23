import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import { Eye, ShieldAlert } from "lucide-react-native";
import { MobileProfileCard } from "../components/MobileProfileCard";
import { ProfileDetailScreen } from "./ProfileDetailScreen";

export const UnblurScreen: React.FC<{ onNavigateToChat?: (partnerId: string) => void }> = ({
  onNavigateToChat,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  // Fetch Received Unblur Requests
  const {
    data: receivedRequests = [],
    isLoading: loadingReceived,
    refetch: refetchReceived,
    isRefetching: refetchingReceived,
  } = useQuery({
    queryKey: QUERY_KEYS.receivedUnblur,
    queryFn: async () => {
      const res = await api.get("/matches/photo-access/received");
      return res.data;
    },
    enabled: activeTab === "received",
  });

  // Fetch Sent Unblur Requests
  const {
    data: sentRequests = [],
    isLoading: loadingSent,
    refetch: refetchSent,
    isRefetching: refetchingSent,
  } = useQuery({
    queryKey: QUERY_KEYS.sentUnblur,
    queryFn: async () => {
      const res = await api.get("/matches/photo-access/sent");
      return res.data;
    },
    enabled: activeTab === "sent",
  });

  // Respond mutation
  const respondMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "ACCEPTED" | "DECLINED";
    }) => {
      return api.post(`/matches/photo-access/${id}/respond`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.receivedUnblur });
    },
  });

  const isLoading = activeTab === "received" ? loadingReceived : loadingSent;
  const isRefetching = activeTab === "received" ? refetchingReceived : refetchingSent;
  const onRefresh = activeTab === "received" ? refetchReceived : refetchSent;
  const currentData = activeTab === "received" ? receivedRequests : sentRequests;

  const renderEmptyState = () => (
    <View className="py-16 items-center justify-center px-4">
      <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center mb-4">
        <Eye size={28} color="#e11d48" />
      </View>
      <Text className="text-slate-800 font-bold text-lg text-center mb-1">
        {activeTab === "received"
          ? "No Photo Requests"
          : "No Sent Photo Requests"}
      </Text>
      <Text className="text-slate-500 text-sm text-center max-w-xs leading-5">
        {activeTab === "received"
          ? "When other members request permission to view your blurred photos, they will appear here."
          : "Photo access requests you have sent to other members will be displayed here."}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const isReceived = activeTab === "received";
    return (
      <MobileProfileCard
        item={item}
        isReceived={isReceived}
        onAccept={
          isReceived && item.status === "PENDING"
            ? () => respondMutation.mutate({ id: item.id, status: "ACCEPTED" })
            : undefined
        }
        onDecline={
          isReceived && item.status === "PENDING"
            ? () => respondMutation.mutate({ id: item.id, status: "DECLINED" })
            : undefined
        }
        onPressProfile={(uid) => setDetailUserId(uid)}
        isResponding={respondMutation.isPending}
      />
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Tabs Container without Header */}
      <View className="px-4 pt-3 pb-2.5 bg-white border-b border-slate-200">
        {/* Tabs: Received / Sent */}
        <View className="flex-row bg-slate-100 rounded-xl p-1">
          <TouchableOpacity
            onPress={() => setActiveTab("received")}
            className={`flex-1 py-1.5 rounded-lg items-center ${activeTab === "received" ? "bg-white shadow-xs" : ""
              }`}
          >
            <Text
              className={`text-xs font-bold ${activeTab === "received" ? "text-rose-600" : "text-slate-600"
                }`}
            >
              Received
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("sent")}
            className={`flex-1 py-1.5 rounded-lg items-center ${activeTab === "sent" ? "bg-white shadow-xs" : ""
              }`}
          >
            <Text
              className={`text-xs font-bold ${activeTab === "sent" ? "text-rose-600" : "text-slate-600"
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
      {/* Profile Detail Screen on card tap */}
      <ProfileDetailScreen
        userId={detailUserId}
        visible={!!detailUserId}
        onClose={() => setDetailUserId(null)}
        onNavigateToChat={onNavigateToChat}
      />
    </View>
  );
};
