import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { QUERY_KEYS } from "../lib/queryKeys";
import { Sparkles } from "lucide-react-native";
import { MobileProfileCard } from "../components/MobileProfileCard";

export const MatchesScreen: React.FC<{ onNavigateToChat?: (partnerId: string) => void }> = ({
  onNavigateToChat,
}) => {
  // Fetch Accepted Matches (Mutual Matches)
  const {
    data: acceptedMatches = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: QUERY_KEYS.matchesRecent,
    queryFn: async () => {
      const res = await api.get("/matches/accepted");
      return res.data;
    },
  });

  const renderEmptyState = () => (
    <View className="py-16 items-center justify-center px-4">
      <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center mb-4">
        <Sparkles size={32} color="#e11d48" />
      </View>
      <Text className="text-slate-800 font-bold text-lg text-center mb-1">
        No Matches Yet
      </Text>
      <Text className="text-slate-500 text-sm text-center max-w-xs leading-5">
        When you and another member mutually connect, they'll appear here as your matches.
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#e11d48" />
        </View>
      ) : (
        <FlatList
          data={acceptedMatches}
          keyExtractor={(item) => item.interestId || item.id || String(Math.random())}
          renderItem={({ item }) => (
            <MobileProfileCard
              item={item}
              isReceived={false}
              onChat={
                onNavigateToChat && (item.user?.id || item.targetUser?.id)
                  ? () => onNavigateToChat(item.user?.id || item.targetUser?.id)
                  : undefined
              }
            />
          )}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                refetch();
              }}
              tintColor="#e11d48"
            />
          }
        />
      )}
    </View>
  );
};
