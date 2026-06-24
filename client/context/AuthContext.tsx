"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiConfig, authFetch } from "@/lib/config";

interface User {
  userId: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const checkAuth = async () => {
    try {
      const res = await authFetch(`${apiConfig.baseUrl}/api/v1/users/me`);

      if (res.ok) {
        const data = await res.json();

        // Handle different response structures
        if (data.status === true || data.success === true || data.user || data.data) {
          const userData = data.user || data.data || data;

          // Seed React Query cache so useUserProfile() doesn't re-fetch
          queryClient.setQueryData(["user-profile"], userData);

          setUser({
            userId: userData.userId || userData.id || userData._id,
            name: userData.name,
            email: userData.email,
            username: userData.username,
            phone: userData.phone,
          });
        }
      } else {
        console.log("Auth check failed, status:", res.status);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authFetch(`${apiConfig.baseUrl}/api/v1/auth/logout`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      window.location.href = "/auth/login";
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
