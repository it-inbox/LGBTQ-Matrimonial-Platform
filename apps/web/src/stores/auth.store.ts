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
  photos?: Array<{ id: string; url?: string; originalUrl?: string; blurredUrl?: string | null; isPrimary: boolean; isBlurred?: boolean }>;
}

export interface UserMembership {
  tier: "FREE" | "PRO" | "PRO_MAX" | "PRO_SUPREME" | "PREMIER_LITE";
  planName: string;
  expiresAt: string | null;
  status: "ACTIVE" | "EXPIRED" | "NONE";
  superInterestsRemaining: number;
  spotlightsRemaining: number;
  hasGoldBadge: boolean;
  canViewPhoneNumbers: boolean;
  lastPaymentAt?: string;
  lastPaymentAmount?: number;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  membership: UserMembership | null;
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
  setProfile: (profile: Profile | null) => void;
  fetchMembership: () => Promise<void>;
  setMembership: (membership: UserMembership) => void;
  checkAuth: () => Promise<void>;
}

let checkAuthPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  membership: null,
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
    const { user, profile, membership, accessToken, refreshToken } = res.data;
    localStorage.setItem("everpride_access_token", accessToken);
    localStorage.setItem("everpride_refresh_token", refreshToken);
    set({
      user,
      profile: profile || null,
      membership: membership || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  register: async (phoneNumber: string, otp?: string) => {
    const res = await api.post("/auth/register", { phoneNumber, otp });
    const { user, profile, membership, accessToken, refreshToken } = res.data;
    localStorage.setItem("everpride_access_token", accessToken);
    localStorage.setItem("everpride_refresh_token", refreshToken);
    set({
      user,
      profile: profile || null,
      membership: membership || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem("everpride_access_token");
    localStorage.removeItem("everpride_refresh_token");
    set({ user: null, profile: null, membership: null, isAuthenticated: false, isLoading: false });
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

  setProfile: (profile: Profile | null) => {
    set((state) => ({
      profile,
      user: state.user || (profile?.userId ? { id: profile.userId, role: "USER" } : null),
    }));
  },

  fetchMembership: async () => {
    try {
      const res = await api.get("/payments/membership");
      set({ membership: res.data });
    } catch {
      // Keep existing or default
    }
  },

  setMembership: (membership: UserMembership) => {
    set({ membership });
  },

  checkAuth: async () => {
    // Return existing in-flight checkAuth promise if one is already running
    if (checkAuthPromise) return checkAuthPromise;

    checkAuthPromise = (async () => {
      const token = localStorage.getItem("everpride_access_token");
      if (!token) {
        set({ isLoading: false, isAuthenticated: false, user: null, membership: null });
        return;
      }

      // If profile and membership are already hydrated (e.g. immediately after login), skip re-fetching
      if (get().profile && get().membership) {
        set({ isAuthenticated: true, isLoading: false });
        return;
      }

      try {
        const res = await api.get("/auth/me");
        const { user, profile, membership } = res.data;
        set({
          user: user || null,
          profile: profile || null,
          membership: membership || null,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (err: any) {
        // If the server explicitly rejected auth (401/403) and refresh failed, clear session
        if (err.response?.status === 401 || err.response?.status === 403 || !localStorage.getItem("everpride_access_token")) {
          set({ isAuthenticated: false, isLoading: false, user: null, profile: null, membership: null });
        } else {
          // On transient network or server connection issues, do not immediately kick out the user
          set({ isLoading: false });
        }
      } finally {
        checkAuthPromise = null;
      }
    })();

    return checkAuthPromise;
  },
}));
