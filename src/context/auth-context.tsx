"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTheme } from "next-themes";
import { apiGet, apiSend } from "@/lib/client-api";
import { UserSession } from "@/types";

type AuthContextType = {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserSession>;
  register: (username: string, email: string, password: string) => Promise<UserSession>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  applyUser: (user: UserSession) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthPayload = {
  user: UserSession;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();

  const applyUser = useCallback(
    (nextUser: UserSession) => {
      setUser(nextUser);
      setTheme(nextUser.darkMode ? "dark" : "light");
    },
    [setTheme],
  );

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiGet<AuthPayload>("/api/auth/me");
      applyUser(response.user);
    } catch {
      setUser(null);
      setTheme("light");
    } finally {
      setLoading(false);
    }
  }, [applyUser, setTheme]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiSend<AuthPayload>("/api/auth/login", "POST", {
        email,
        password,
      });

      applyUser(response.user);
      return response.user;
    },
    [applyUser],
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const response = await apiSend<AuthPayload>("/api/auth/register", "POST", {
        username,
        email,
        password,
      });

      applyUser(response.user);
      return response.user;
    },
    [applyUser],
  );

  const logout = useCallback(async () => {
    await apiSend("/api/auth/logout", "POST");
    setUser(null);
    setTheme("light");
  }, [setTheme]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser,
      applyUser,
    }),
    [user, loading, login, register, logout, refreshUser, applyUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
