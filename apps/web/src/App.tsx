import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "./components/layout/Navbar";
import { BottomStickyNavbar } from "./components/layout/BottomStickyNavbar";
import { LandingPage } from "./pages/LandingPage";
import { OnboardingWizard } from "./pages/onboarding/OnboardingWizard";
import { DiscoveryFeedPage } from "./pages/matches/DiscoveryFeedPage";
import { MatchesPage } from "./pages/matches/MatchesPage";
import { PrivacySettingsPage } from "./pages/settings/PrivacySettingsPage";
import { EditProfilePage } from "./pages/settings/EditProfilePage";
import { InterestsActivityPage } from "./pages/interests/InterestsActivityPage";
import { UnblurActivityPage } from "./pages/unblur/UnblurActivityPage";
import { MessengerPage } from "./pages/chat/MessengerPage";
import { MemberProfileDetailPage } from "./pages/matches/MemberProfileDetailPage";
import { LoginModal } from "./components/auth/LoginModal";
import { ChatNotificationToast } from "./components/chat/ChatNotificationToast";
import { useAuthStore } from "./stores/auth.store";
import { useChatStore } from "./stores/chat.store";

import { ErrorBoundary } from "./components/common/ErrorBoundary";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireProfile = true }) => {
  const { isAuthenticated, profile, isLoading, openLoginModal } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    openLoginModal();
    return <Navigate to="/" replace />;
  }

  // If user is authenticated but hasn't completed onboarding, enforce /onboarding
  if (requireProfile && !profile) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const PublicLandingRoute: React.FC = () => {
  const { isAuthenticated, profile, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (!profile) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/discover" replace />;
  }

  return <LandingPage />;
};

export function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const connectSocket = useChatStore((s) => s.connectSocket);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Connect user's real-time socket across all pages once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    }
  }, [isAuthenticated, connectSocket]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="h-screen h-[100dvh] overflow-hidden flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <BottomStickyNavbar />
            <LoginModal />
            <ChatNotificationToast />
            <main className="flex-1 min-h-0 overflow-y-auto pb-16 lg:pb-0">
              <ErrorBoundary>
                <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLandingRoute />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute requireProfile={false}>
                    <OnboardingWizard />
                  </ProtectedRoute>
                }
              />
              <Route path="/register" element={<Navigate to="/onboarding" replace />} />

              {/* Protected Routes (Require Completed Profile) */}
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <EditProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discover"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <DiscoveryFeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <MemberProfileDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <MatchesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <MessengerPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Consolidated Polymorphic Interests Activity Routes */}
              <Route
                path="/interests/sent"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <InterestsActivityPage initialTab="sent" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/interests/received"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <InterestsActivityPage initialTab="received" />
                  </ProtectedRoute>
                }
              />
              <Route path="/interests" element={<Navigate to="/interests/received" replace />} />
              <Route path="/interest/iDeclined" element={<Navigate to="/interests/received" replace />} />
              <Route path="/interest/theyDeclined" element={<Navigate to="/interests/sent" replace />} />
              <Route path="/interests/declined" element={<Navigate to="/interests/received" replace />} />
              <Route path="/interests/iDeclined" element={<Navigate to="/interests/received" replace />} />
              <Route path="/interests/theyDeclined" element={<Navigate to="/interests/sent" replace />} />

              {/* Consolidated Polymorphic Unblur Photo Access Routes */}
              <Route
                path="/unblur/received"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <UnblurActivityPage initialTab="received" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/unblur/sent"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <UnblurActivityPage initialTab="sent" />
                  </ProtectedRoute>
                }
              />
              <Route path="/unblur/iAccepted" element={<Navigate to="/unblur/received" replace />} />
              <Route path="/unblur/theyAccepted" element={<Navigate to="/unblur/sent" replace />} />
              <Route path="/unblur/iDeclined" element={<Navigate to="/unblur/received" replace />} />
              <Route path="/unblur/theyDeclined" element={<Navigate to="/unblur/sent" replace />} />
              <Route path="/photo-access/received" element={<Navigate to="/unblur/received" replace />} />
              <Route path="/photo-access/sent" element={<Navigate to="/unblur/sent" replace />} />
              <Route path="/unblur" element={<Navigate to="/unblur/received" replace />} />
              <Route
                path="/privacy-settings"
                element={
                  <ProtectedRoute requireProfile={true}>
                    <PrivacySettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </ErrorBoundary>
            </main>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
