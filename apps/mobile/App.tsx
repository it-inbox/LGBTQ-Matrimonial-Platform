import React, { useEffect, useState } from "react";
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
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
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
  const { isAuthenticated, isLoading, profile, fetchProfile, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<TabType>("discover");
  const [chatPartnerUserId, setChatPartnerUserId] = React.useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleOpenChatWithPartner = (partnerUserId: string) => {
    setChatPartnerUserId(partnerUserId);
    setActiveTab("messages");
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#e11d48" />
        <Text className="text-slate-500 mt-4 text-sm font-medium">
          Loading EverPride...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // If user is authenticated but has no profile, show onboarding wizard
  if (!profile || showOnboarding) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <OnboardingScreen
          onSuccess={() => {
            setShowOnboarding(false);
            fetchProfile();
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Screen view based on active tab */}
      <View className="flex-1">
        {activeTab === "discover" && (
          <DiscoverScreen onOpenOnboarding={() => setShowOnboarding(true)} />
        )}
        {activeTab === "matches" && (
          <MatchesScreen onNavigateToChat={handleOpenChatWithPartner} />
        )}
        {activeTab === "messages" && (
          <MessagesScreen initialPartnerUserId={chatPartnerUserId} />
        )}
        {activeTab === "profile" && <ProfileScreen />}
      </View>

      {/* Bottom Navigation Bar with Web Parity Styling */}
      <View className="flex-row items-center justify-around py-3 bg-white border-t border-slate-200/90 shadow-sm">
        <TouchableOpacity
          onPress={() => setActiveTab("discover")}
          className="items-center"
        >
          <Sparkles
            size={22}
            color={activeTab === "discover" ? "#e11d48" : "#94a3b8"}
          />
          <Text
            className={`text-xs mt-1 font-medium ${
              activeTab === "discover"
                ? "text-rose-600 font-bold"
                : "text-slate-500"
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
            color={activeTab === "matches" ? "#e11d48" : "#94a3b8"}
          />
          <Text
            className={`text-xs mt-1 font-medium ${
              activeTab === "matches"
                ? "text-rose-600 font-bold"
                : "text-slate-500"
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
            color={activeTab === "messages" ? "#e11d48" : "#94a3b8"}
          />
          <Text
            className={`text-xs mt-1 font-medium ${
              activeTab === "messages"
                ? "text-rose-600 font-bold"
                : "text-slate-500"
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
            color={activeTab === "profile" ? "#e11d48" : "#94a3b8"}
          />
          <Text
            className={`text-xs mt-1 font-medium ${
              activeTab === "profile"
                ? "text-rose-600 font-bold"
                : "text-slate-500"
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
