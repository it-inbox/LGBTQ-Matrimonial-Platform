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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("everpride_refresh_token");
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:4001/api/v1"}/auth/refresh`,
          refreshToken ? { refreshToken } : {},
          { withCredentials: true }
        );
        const { accessToken, refreshToken: newRefreshToken } = res.data;
        if (accessToken) {
          localStorage.setItem("everpride_access_token", accessToken);
        }
        if (newRefreshToken) {
          localStorage.setItem("everpride_refresh_token", newRefreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("everpride_access_token");
        localStorage.removeItem("everpride_refresh_token");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);
