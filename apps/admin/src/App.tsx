import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAdminAuthStore } from "./stores/admin-auth.store";
import { AdminLayout } from "./components/layout/AdminLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { MembershipsPage } from "./pages/MembershipsPage";
import { DummyDataPage } from "./pages/DummyDataPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAdminAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export function App() {
  const { checkAuth } = useAdminAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedAdminRoute>
                <DashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedAdminRoute>
                <UsersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/memberships"
            element={
              <ProtectedAdminRoute>
                <MembershipsPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/dummy-data"
            element={
              <ProtectedAdminRoute>
                <DummyDataPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

