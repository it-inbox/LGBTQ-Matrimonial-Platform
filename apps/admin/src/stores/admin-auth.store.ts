import { create } from "zustand";
import { api } from "../lib/api";

export interface AdminUser {
  id: string;
  email: string;
  phoneNumber?: string | null;
  role: "USER" | "MODERATOR" | "ADMIN";
  displayName?: string;
  isVerified?: boolean;
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("everpride_admin_access_token"),
  isLoading: true,

  login: async (email: string, password: string) => {
    const res = await api.post("/admin/auth/login", { email, password });
    const { user, accessToken, refreshToken } = res.data;

    localStorage.setItem("everpride_admin_access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("everpride_admin_refresh_token", refreshToken);
    }

    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem("everpride_admin_access_token");
    localStorage.removeItem("everpride_admin_refresh_token");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("everpride_admin_access_token");
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const res = await api.get("/auth/me");
      const { user } = res.data;

      if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
        throw new Error("Forbidden");
      }

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem("everpride_admin_access_token");
      localStorage.removeItem("everpride_admin_refresh_token");
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
