import axios from "axios";
import { Platform } from "react-native";
import { authStorage } from "./storage";

// Determine local API vs environment variable
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === "web") {
    return "http://localhost:4001/api/v1";
  }
  // Android emulator uses 10.0.2.2 to access host machine, physical devices use host LAN IP
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4001/api/v1";
  }
  return "http://localhost:4001/api/v1";
};

const BASE_URL = getBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await authStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mutex promise to deduplicate concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const refreshToken = await authStorage.getRefreshToken();
            if (!refreshToken) {
              throw new Error("No refresh token");
            }

            const res = await axios.post(`${BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = res.data;
            if (accessToken) {
              await authStorage.setAccessToken(accessToken);
            }
            if (newRefreshToken) {
              await authStorage.setRefreshToken(newRefreshToken);
            }
            return accessToken as string;
          } catch (refreshErr: any) {
            if (
              refreshErr.response?.status === 401 ||
              refreshErr.response?.status === 403
            ) {
              await authStorage.clearTokens();
            }
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const newToken = await refreshPromise;
      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

