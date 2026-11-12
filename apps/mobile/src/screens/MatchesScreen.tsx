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
import { Heart, MessageCircle, Sparkles } from "lucide-react-native";

export const MatchesScreen: React.FC<{ onNavigateToChat?: (partnerId: string) => void }> = ({
  onNavigateToChat,
}) => {
  const queryClient = useQueryClient();

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

  const renderItem = ({ item }: { item: any }) => {
    const partner = item.targetUser || item.user || item.partner || {};
    const photoUrl =
      partner.photos?.find((p: any) => p.isPrimary)?.thumbnailUrl ||
      partner.photos?.[0]?.thumbnailUrl ||
      partner.photoUrl;

    return (
      <View className="bg-white rounded-2xl p-4 mb-3 border border-slate-200/80 shadow-xs flex-row items-center">
        <View className="relative">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              className="w-14 h-14 rounded-full bg-slate-100"
              contentFit="cover"
            />
          ) : (
            <View className="w-14 h-14 rounded-full bg-rose-100 items-center justify-center">
              <Text className="text-rose-600 font-bold text-lg">
                {(partner.displayName || partner.name || "?")[0]?.toUpperCase()}
              </Text>
            </View>
          )}
          <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
        </View>

        <View className="flex-1 ml-3.5">
          <Text className="font-bold text-base text-slate-800">
            {partner.displayName || partner.name || "Member"}
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
            {[partner.age ? `${partner.age} yrs` : null, partner.city, partner.state]
              .filter(Boolean)
              .join(" • ") || "Connected Match"}
          </Text>
        </View>

        {onNavigateToChat && partner.id && (
          <TouchableOpacity
            onPress={() => onNavigateToChat(partner.id)}
            className="p-2.5 bg-rose-50 rounded-full border border-rose-100"
            activeOpacity={0.7}
          >
            <MessageCircle size={18} color="#e11d48" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-5 pt-3 pb-3 bg-white border-b border-slate-200">
        <Text className="text-xl font-bold text-slate-900">Matches</Text>
        <Text className="text-xs text-slate-500 mt-0.5">
          Members you've mutually connected with
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#e11d48" />
        </View>
      ) : (
        <FlatList
          data={acceptedMatches}
          keyExtractor={(item) => item.id || String(Math.random())}
          renderItem={renderItem}
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
