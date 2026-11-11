import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "everpride_access_token";
const REFRESH_TOKEN_KEY = "everpride_refresh_token";

const isWeb = Platform.OS === "web";

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
