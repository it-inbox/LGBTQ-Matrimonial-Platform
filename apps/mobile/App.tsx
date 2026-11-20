import React, { useEffect, useState } from "react";
import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./src/lib/queryClient";
import { View, Text, TouchableOpacity, ActivityIndicator, AppState, AppStateStatus } from "react-native";
import { useAuthStore } from "./src/stores/auth.store";
import { useChatStore } from "./src/stores/chat.store";
import { DiscoverScreen } from "./src/screens/DiscoverScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
import { MatchesScreen } from "./src/screens/MatchesScreen";
import { MessagesScreen } from "./src/screens/MessagesScreen";
import { InterestsScreen } from "./src/screens/InterestsScreen";
import { UnblurScreen } from "./src/screens/UnblurScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { AppHeader } from "./src/components/AppHeader";
import { AppLoadingScreen } from "./src/components/AppLoadingScreen";
import {
  Compass,
  Sparkles,
  MessageSquare,
  Send,
  Eye,
} from "lucide-react-native";

// (queryClient initialized from ./src/lib/queryClient)

type TabType = "discover" | "matches" | "connect" | "interests" | "unblur";

function MainContent() {
  const { isAuthenticated, isLoading, profile, fetchProfile, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<TabType>("discover");
  const [chatPartnerUserId, setChatPartnerUserId] = React.useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInsideChatThread, setIsInsideChatThread] = useState(false);

  const handleOpenChatWithPartner = (partnerUserId: string) => {
    setChatPartnerUserId(partnerUserId);
    setActiveTab("connect");
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Connect socket when user is authenticated and app is active
  const { connectSocket, disconnectSocket } = useChatStore();
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        if (isAuthenticated) connectSocket();
      } else if (nextAppState === "background") {
        disconnectSocket();
      }
    });

    return () => {
      subscription.remove();
      disconnectSocket();
    };
  }, [isAuthenticated, connectSocket, disconnectSocket]);

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // If user is authenticated but has no profile, show onboarding wizard
  if (!profile || showOnboarding) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
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
    <SafeAreaView className="flex-1 bg-slate-50" edges={["top", "bottom"]}>
      {/* Top Navigation Bar with Logo and Hamburger */}
      <AppHeader
        onOpenOnboarding={() => setShowOnboarding(true)}
        onNavigateToChat={handleOpenChatWithPartner}
      />

      {/* Screen view based on active tab */}
      <View className="flex-1">
        {activeTab === "discover" && (
          <DiscoverScreen
            onOpenOnboarding={() => setShowOnboarding(true)}
            onNavigateToChat={handleOpenChatWithPartner}
          />
        )}
        {activeTab === "matches" && (
          <MatchesScreen onNavigateToChat={handleOpenChatWithPartner} />
        )}
        {activeTab === "connect" && (
          <MessagesScreen
            initialPartnerUserId={chatPartnerUserId}
            onActiveConversationChange={setIsInsideChatThread}
          />
        )}
        {activeTab === "interests" && (
          <InterestsScreen onNavigateToChat={handleOpenChatWithPartner} />
        )}
        {activeTab === "unblur" && <UnblurScreen />}
      </View>

      {/* Bottom Sticky Navigation Bar matching Web parity (Hidden when user is inside an active chat thread) */}
      {!(activeTab === "connect" && isInsideChatThread) && (
        <View className="flex-row items-center justify-around py-1.5 px-2 bg-white border-t border-slate-200/90 shadow-lg">
          {/* Discover */}
          <TouchableOpacity
            onPress={() => setActiveTab("discover")}
            className={`flex-1 items-center justify-center py-1.5 rounded-xl ${
              activeTab === "discover" ? "bg-rose-50/80" : ""
            }`}
            activeOpacity={0.7}
          >
            <Compass
              size={20}
              color={activeTab === "discover" ? "#e11d48" : "#64748b"}
              strokeWidth={activeTab === "discover" ? 2.5 : 1.75}
            />
            <Text
              className={`text-[11px] mt-0.5 ${
                activeTab === "discover"
                  ? "text-rose-600 font-bold"
                  : "text-slate-600 font-medium"
              }`}
            >
              Discover
            </Text>
          </TouchableOpacity>

          {/* Matches */}
          <TouchableOpacity
            onPress={() => setActiveTab("matches")}
            className={`flex-1 items-center justify-center py-1.5 rounded-xl ${
              activeTab === "matches" ? "bg-rose-50/80" : ""
            }`}
            activeOpacity={0.7}
          >
            <Sparkles
              size={20}
              color={activeTab === "matches" ? "#e11d48" : "#64748b"}
              strokeWidth={activeTab === "matches" ? 2.5 : 1.75}
            />
            <Text
              className={`text-[11px] mt-0.5 ${
                activeTab === "matches"
                  ? "text-rose-600 font-bold"
                  : "text-slate-600 font-medium"
              }`}
            >
              Matches
            </Text>
          </TouchableOpacity>

          {/* Connect (Messages) */}
          <TouchableOpacity
            onPress={() => setActiveTab("connect")}
            className={`flex-1 items-center justify-center py-1.5 rounded-xl ${
              activeTab === "connect" ? "bg-rose-50/80" : ""
            }`}
            activeOpacity={0.7}
          >
            <MessageSquare
              size={20}
              color={activeTab === "connect" ? "#e11d48" : "#64748b"}
              strokeWidth={activeTab === "connect" ? 2.5 : 1.75}
            />
            <Text
              className={`text-[11px] mt-0.5 ${
                activeTab === "connect"
                  ? "text-rose-600 font-bold"
                  : "text-slate-600 font-medium"
              }`}
            >
              Connect
            </Text>
          </TouchableOpacity>

          {/* Interests */}
          <TouchableOpacity
            onPress={() => setActiveTab("interests")}
            className={`flex-1 items-center justify-center py-1.5 rounded-xl ${
              activeTab === "interests" ? "bg-rose-50/80" : ""
            }`}
            activeOpacity={0.7}
          >
            <Send
              size={20}
              color={activeTab === "interests" ? "#e11d48" : "#64748b"}
              strokeWidth={activeTab === "interests" ? 2.5 : 1.75}
            />
            <Text
              className={`text-[11px] mt-0.5 ${
                activeTab === "interests"
                  ? "text-rose-600 font-bold"
                  : "text-slate-600 font-medium"
              }`}
            >
              Interests
            </Text>
          </TouchableOpacity>

          {/* Unblur */}
          <TouchableOpacity
            onPress={() => setActiveTab("unblur")}
            className={`flex-1 items-center justify-center py-1.5 rounded-xl ${
              activeTab === "unblur" ? "bg-rose-50/80" : ""
            }`}
            activeOpacity={0.7}
          >
            <Eye
              size={20}
              color={activeTab === "unblur" ? "#e11d48" : "#64748b"}
              strokeWidth={activeTab === "unblur" ? 2.5 : 1.75}
            />
            <Text
              className={`text-[11px] mt-0.5 ${
                activeTab === "unblur"
                  ? "text-rose-600 font-bold"
                  : "text-slate-600 font-medium"
              }`}
            >
              Unblur
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <MainContent />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
