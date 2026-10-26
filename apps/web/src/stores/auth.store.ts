import { create } from "zustand";
import { api } from "../lib/api";

interface User {
  id: string;
  phoneNumber?: string;
  email?: string;
  role: string;
  isVerified?: boolean;
}

interface Profile {
  id: string;
  userId: string;
  displayName: string;
  gender: string;
  orientation: string;
  pronouns?: string;
  outnessStatus: string;
  photoVisibility: string;
  ghostModeEnabled: boolean;
  city: string;
  state: string;
  bio?: string;
  photos?: Array<{ id: string; url: string; isPrimary: boolean; isBlurred: boolean }>;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  sendOtp: (phoneNumber: string) => Promise<any>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<any>;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  register: (phoneNumber: string, otp?: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: !!localStorage.getItem("everpride_access_token"),
  isLoading: true,
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  sendOtp: async (phoneNumber: string) => {
    const res = await api.post("/auth/send-otp", { phoneNumber });
    return res.data;
  },

  verifyOtp: async (phoneNumber: string, otp: string) => {
    const res = await api.post("/auth/verify-otp", { phoneNumber, otp });
    return res.data;
  },

  login: async (phoneNumber: string, otp: string) => {
    const res = await api.post("/auth/login", { phoneNumber, otp });
    const { user, accessToken, refreshToken } = res.data;
    localStorage.setItem("everpride_access_token", accessToken);
    localStorage.setItem("everpride_refresh_token", refreshToken);
    set({ user, isAuthenticated: true });
    await get().fetchProfile();
  },

  register: async (phoneNumber: string, otp?: string) => {
    const res = await api.post("/auth/register", { phoneNumber, otp });
    const { user, accessToken, refreshToken } = res.data;
    localStorage.setItem("everpride_access_token", accessToken);
    localStorage.setItem("everpride_refresh_token", refreshToken);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("everpride_access_token");
    localStorage.removeItem("everpride_refresh_token");
    set({ user: null, profile: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const res = await api.get("/profiles/me");
      const profile = res.data;
      set((state) => ({
        profile,
        user: state.user || (profile?.userId ? { id: profile.userId, role: "USER" } : null),
      }));
    } catch {
      set({ profile: null });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("everpride_access_token");
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      await get().fetchProfile();
      set({ isAuthenticated: true, isLoading: false });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
