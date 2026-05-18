import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuthStorage,
} from "./tokens";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise = null;

const AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

const isAuthRoute = (url = "") =>
  AUTH_PATHS.some((path) => String(url).includes(path));

const redirectToLogin = () => {
  clearAuthStorage();
  const path = window.location.pathname;
  if (path !== "/login" && path !== "/register") {
    window.location.href = "/login";
  }
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
  const { token, refreshToken: newRefresh } = res.data;
  setTokens(token, newRefresh);
  return token;
};

export const tryRefreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

api.interceptors.request.use(
  async (config) => {
    if (isAuthRoute(config.url)) {
      return config;
    }

    let token = getAccessToken();
    const refreshToken = getRefreshToken();

    if (token && refreshToken) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        if (expiresIn < 60_000) {
          token = await tryRefreshSession();
        }
      } catch {
        /* use existing token; 401 handler will refresh */
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRoute(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const code = error.response?.data?.code;
    const refreshToken = getRefreshToken();

    if (
      !refreshToken ||
      code === "REFRESH_INVALID" ||
      code === "TOKEN_INVALID"
    ) {
      redirectToLogin();
      return Promise.reject(error);
    }

    if (code === "TOKEN_EXPIRED" || code === "NO_TOKEN") {
      originalRequest._retry = true;
      try {
        const newToken = await tryRefreshSession();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
