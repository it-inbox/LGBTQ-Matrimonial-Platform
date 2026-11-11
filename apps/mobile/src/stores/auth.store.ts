import { create } from "zustand";
import { api } from "../lib/api";
import { authStorage } from "../lib/storage";

export interface User {
  id: string;
  phoneNumber?: string;
  email?: string;
  role: string;
  isVerified?: boolean;
}

export interface Profile {
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
  occupation?: string;
  heightCm?: number;
  dateOfBirth?: string;
  age?: number;
  photos?: Array<{
    id: string;
    url?: string;
    originalUrl?: string;
    blurredUrl?: string | null;
    isPrimary: boolean;
    isBlurred?: boolean;
  }>;
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
  sendOtp: (phoneNumber: string) => Promise<any>;
  verifyOtp: (phoneNumber: string, otp: string) => Promise<any>;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  register: (phoneNumber: string, otp?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setProfile: (profile: Profile | null) => void;
  checkAuth: () => Promise<void>;
}

let checkAuthPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  membership: null,
  isAuthenticated: false,
  isLoading: true,

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
    if (accessToken) await authStorage.setAccessToken(accessToken);
    if (refreshToken) await authStorage.setRefreshToken(refreshToken);
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
    if (accessToken) await authStorage.setAccessToken(accessToken);
    if (refreshToken) await authStorage.setRefreshToken(refreshToken);
    set({
      user,
      profile: profile || null,
      membership: membership || null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    await authStorage.clearTokens();
    set({
      user: null,
      profile: null,
      membership: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchProfile: async () => {
    try {
      const res = await api.get("/profiles/me");
      const profile = res.data;
      set((state) => ({
        profile,
        user:
          state.user ||
          (profile?.userId ? { id: profile.userId, role: "USER" } : null),
      }));
    } catch {
      set({ profile: null });
    }
  },

  setProfile: (profile: Profile | null) => {
    set((state) => ({
      profile,
      user:
        state.user ||
        (profile?.userId ? { id: profile.userId, role: "USER" } : null),
    }));
  },

  checkAuth: async () => {
    if (checkAuthPromise) return checkAuthPromise;

    checkAuthPromise = (async () => {
      const token = await authStorage.getAccessToken();
      if (!token) {
        set({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          profile: null,
          membership: null,
        });
        return;
      }

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
        if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          !(await authStorage.getAccessToken())
        ) {
          await authStorage.clearTokens();
          set({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            profile: null,
            membership: null,
          });
        } else {
          set({ isLoading: false });
        }
      } finally {
        checkAuthPromise = null;
      }
    })();

    return checkAuthPromise;
  },
}));
