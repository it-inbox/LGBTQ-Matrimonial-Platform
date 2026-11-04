import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4001/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("everpride_access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// In-flight mutex promise to deduplicate concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If a refresh is already in flight, reuse the same promise instead of firing duplicate network calls
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const refreshToken = localStorage.getItem("everpride_refresh_token");
            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            const res = await axios.post(
              `${import.meta.env.VITE_API_URL || "http://localhost:4001/api/v1"}/auth/refresh`,
              { refreshToken },
              { withCredentials: true }
            );

            const { accessToken, refreshToken: newRefreshToken } = res.data;
            if (accessToken) {
              localStorage.setItem("everpride_access_token", accessToken);
            }
            if (newRefreshToken) {
              localStorage.setItem("everpride_refresh_token", newRefreshToken);
            }
            return accessToken as string;
          } catch (refreshErr) {
            localStorage.removeItem("everpride_access_token");
            localStorage.removeItem("everpride_refresh_token");
            window.location.href = "/";
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
