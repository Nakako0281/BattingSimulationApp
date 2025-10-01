"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (nickname: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (nickname: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id as string,
        nickname: session.user.nickname as string,
        created_at: "",
        updated_at: "",
      });
    } else {
      setUser(null);
    }
  }, [session]);

  const login = async (
    nickname: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await nextAuthSignIn("credentials", {
        nickname,
        password,
        redirect: false,
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error.includes("Too many login attempts")
            ? result.error
            : "ニックネームまたはパスワードが正しくありません",
        };
      }

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
        return { success: true };
      }

      return { success: false, error: "ログインに失敗しました" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "ログインに失敗しました" };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const register = async (
    nickname: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "登録に失敗しました",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "登録に失敗しました" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
