import React, { useEffect } from "react";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useAuthStore } from "./src/stores/auth.store";
import { DiscoverScreen } from "./src/screens/DiscoverScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { MatchesScreen } from "./src/screens/MatchesScreen";
import { MessagesScreen } from "./src/screens/MessagesScreen";
import { Sparkles, Heart, MessageSquare, User } from "lucide-react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Do not retry 4xx client errors (400, 401, 403, 404)
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

type TabType = "discover" | "matches" | "messages" | "profile";

function MainContent() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<TabType>("discover");
  const [chatPartnerUserId, setChatPartnerUserId] = React.useState<string | null>(null);

  const handleOpenChatWithPartner = (partnerUserId: string) => {
    setChatPartnerUserId(partnerUserId);
    setActiveTab("messages");
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator size="large" color="#f43f5e" />
        <Text className="text-slate-400 mt-4 text-sm font-medium">
          Loading EverPride...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      {/* Screen view based on active tab */}
      <View className="flex-1">
        {activeTab === "discover" && <DiscoverScreen />}
        {activeTab === "matches" && (
          <MatchesScreen onNavigateToChat={handleOpenChatWithPartner} />
        )}
        {activeTab === "messages" && (
          <MessagesScreen initialPartnerUserId={chatPartnerUserId} />
        )}
        {activeTab === "profile" && <ProfileScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View className="flex-row items-center justify-around py-3 bg-slate-900 border-t border-slate-800">
        <TouchableOpacity
          onPress={() => setActiveTab("discover")}
          className="items-center"
        >
          <Sparkles
            size={22}
            color={activeTab === "discover" ? "#f43f5e" : "#64748b"}
          />
          <Text
            className={`text-xs mt-1 ${
              activeTab === "discover"
                ? "text-brand-500 font-bold"
                : "text-slate-400"
            }`}
          >
            Discover
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("matches")}
          className="items-center"
        >
          <Heart
            size={22}
            color={activeTab === "matches" ? "#f43f5e" : "#64748b"}
          />
          <Text
            className={`text-xs mt-1 ${
              activeTab === "matches"
                ? "text-brand-500 font-bold"
                : "text-slate-400"
            }`}
          >
            Matches
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("messages")}
          className="items-center"
        >
          <MessageSquare
            size={22}
            color={activeTab === "messages" ? "#f43f5e" : "#64748b"}
          />
          <Text
            className={`text-xs mt-1 ${
              activeTab === "messages"
                ? "text-brand-500 font-bold"
                : "text-slate-400"
            }`}
          >
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("profile")}
          className="items-center"
        >
          <User
            size={22}
            color={activeTab === "profile" ? "#f43f5e" : "#64748b"}
          />
          <Text
            className={`text-xs mt-1 ${
              activeTab === "profile"
                ? "text-brand-500 font-bold"
                : "text-slate-400"
            }`}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <MainContent />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
