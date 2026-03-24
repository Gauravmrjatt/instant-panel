"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authFetch(`${apiConfig.baseUrl}/get/user`);
    
      if (res.ok) {
        const data = await res.json();
    
        // Handle different response structures
        if (data.status === true || data.success === true || data.user) {
          const userData = data.user || data;
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
        // Don't remove token - just keep user as null
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Don't remove token on error - just keep user as null
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authFetch(`${apiConfig.baseUrl}/logout`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
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
