import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api, { tryRefreshSession } from "../utils/api";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuthStorage,
  getStoredUser,
  setStoredUser,
  isAccessTokenExpired,
  getAccessTokenExpiryMs,
} from "../utils/tokens";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  const clearSession = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    clearAuthStorage();
    setUser(null);
  }, []);

  const scheduleAccessRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (!getRefreshToken()) return;

    const expMs = getAccessTokenExpiryMs();
    if (!expMs) return;

    const refreshIn = Math.max(expMs - Date.now() - 60_000, 5_000);

    refreshTimerRef.current = setTimeout(async () => {
      if (!getRefreshToken()) return;
      try {
        await tryRefreshSession();
        scheduleAccessRefresh();
      } catch {
        clearSession();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }, refreshIn);
  }, [clearSession]);

  const bootstrapSession = useCallback(async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const savedUser = getStoredUser();

    if (!accessToken && !refreshToken) {
      setLoading(false);
      return;
    }

    // Sesi lama (hanya access token 7 hari) — paksa login ulang setelah kedaluwarsa
    if (!refreshToken) {
      if (!accessToken || isAccessTokenExpired()) {
        clearSession();
        setLoading(false);
        return;
      }
    }

    if (savedUser) {
      setUser(savedUser);
    }

    try {
      if (refreshToken && (!accessToken || isAccessTokenExpired())) {
        await tryRefreshSession();
      }

      const res = await api.get("/auth/me");
      setUser(res.data.user);
      setStoredUser(res.data.user);
      scheduleAccessRefresh();
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession, scheduleAccessRefresh]);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!getRefreshToken()) return;
      if (isAccessTokenExpired()) {
        tryRefreshSession()
          .then(() => scheduleAccessRefresh())
          .catch(() => {
            clearSession();
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          });
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [clearSession, scheduleAccessRefresh]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, refreshToken, user: userData } = res.data;
      setTokens(token, refreshToken);
      setStoredUser(userData);
      setUser(userData);
      scheduleAccessRefresh();
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password, job, address) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        job,
        address,
      });
      const { token, refreshToken, user: userData } = res.data;
      setTokens(token, refreshToken);
      setStoredUser(userData);
      setUser(userData);
      scheduleAccessRefresh();
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      /* revoke best-effort */
    }
    clearSession();
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
