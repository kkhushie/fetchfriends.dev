// lib/auth-context.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  login: (token: string, userData?: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for token on mount
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }
    }
  }, []);

  const login = (newToken: string, userData?: any) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    
    if (userData) {
      localStorage.setItem("auth_user", JSON.stringify(userData));
      setUser(userData);
    }
    
    // Optionally fetch user data from API
    fetchUserData(newToken);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    router.push("/");
  };

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("auth_user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}