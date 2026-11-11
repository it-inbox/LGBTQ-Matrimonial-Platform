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
import { Sparkles, Heart, MessageSquare, User } from "lucide-react-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

type TabType = "discover" | "matches" | "messages" | "profile";

function MainContent() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<TabType>("discover");

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
          <View className="flex-1 items-center justify-center p-6">
            <Heart size={40} color="#f43f5e" />
            <Text className="text-white text-lg font-bold mt-3">Mutual Matches</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Conversations unlock here when both of you express mutual interest!
            </Text>
          </View>
        )}
        {activeTab === "messages" && (
          <View className="flex-1 items-center justify-center p-6">
            <MessageSquare size={40} color="#38bdf8" />
            <Text className="text-white text-lg font-bold mt-3">Private Messenger</Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              End-to-end encrypted messaging with verified connections.
            </Text>
          </View>
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
