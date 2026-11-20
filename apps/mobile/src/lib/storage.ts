import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "everpride_access_token";
const REFRESH_TOKEN_KEY = "everpride_refresh_token";
const ONBOARDING_DRAFT_KEY = "everpride_mobile_onboarding_draft";
const ONBOARDING_STEP_KEY = "everpride_mobile_onboarding_step";

const isWeb = Platform.OS === "web";

export const onboardingStorage = {
  async getDraft(): Promise<{ formData?: any; step?: number } | null> {
    try {
      const rawDraft = isWeb
        ? typeof window !== "undefined"
          ? localStorage.getItem(ONBOARDING_DRAFT_KEY)
          : null
        : await SecureStore.getItemAsync(ONBOARDING_DRAFT_KEY);

      const rawStep = isWeb
        ? typeof window !== "undefined"
          ? localStorage.getItem(ONBOARDING_STEP_KEY)
          : null
        : await SecureStore.getItemAsync(ONBOARDING_STEP_KEY);

      if (!rawDraft) return null;
      return {
        formData: JSON.parse(rawDraft),
        step: rawStep ? parseInt(rawStep, 10) : 1,
      };
    } catch {
      return null;
    }
  },

  async saveDraft(formData: any, step: number): Promise<void> {
    try {
      const serialized = JSON.stringify(formData);
      if (isWeb) {
        if (typeof window !== "undefined") {
          localStorage.setItem(ONBOARDING_DRAFT_KEY, serialized);
          localStorage.setItem(ONBOARDING_STEP_KEY, String(step));
        }
        return;
      }
      await SecureStore.setItemAsync(ONBOARDING_DRAFT_KEY, serialized);
      await SecureStore.setItemAsync(ONBOARDING_STEP_KEY, String(step));
    } catch (e) {
      console.warn("Failed to save onboarding draft:", e);
    }
  },

  async clearDraft(): Promise<void> {
    try {
      if (isWeb) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(ONBOARDING_DRAFT_KEY);
          localStorage.removeItem(ONBOARDING_STEP_KEY);
        }
        return;
      }
      await SecureStore.deleteItemAsync(ONBOARDING_DRAFT_KEY);
      await SecureStore.deleteItemAsync(ONBOARDING_STEP_KEY);
    } catch (e) {
      console.warn("Failed to clear onboarding draft:", e);
    }
  },
};

export const authStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return typeof window !== "undefined"
          ? localStorage.getItem(ACCESS_TOKEN_KEY)
          : null;
      }
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setAccessToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        if (typeof window !== "undefined") {
          localStorage.setItem(ACCESS_TOKEN_KEY, token);
        }
        return;
      }
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (e) {
      console.warn("Failed to set access token:", e);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return typeof window !== "undefined"
          ? localStorage.getItem(REFRESH_TOKEN_KEY)
          : null;
      }
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        if (typeof window !== "undefined") {
          localStorage.setItem(REFRESH_TOKEN_KEY, token);
        }
        return;
      }
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (e) {
      console.warn("Failed to set refresh token:", e);
    }
  },

  async clearTokens(): Promise<void> {
    try {
      if (isWeb) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
        return;
      }
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (e) {
      console.warn("Failed to clear tokens:", e);
    }
  },
};
