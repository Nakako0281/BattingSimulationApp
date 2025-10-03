import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createServerClient } from "@/lib/supabase/server";
import { verifyPassword } from "./password";
import { loginRateLimiter } from "./rate-limiter";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        nickname: { label: "Nickname", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.nickname || !credentials?.password) {
          return null;
        }

        const nickname = credentials.nickname as string;
        const password = credentials.password as string;

        // IPアドレスを取得してレート制限をチェック
        const ip =
          request?.headers?.get("x-forwarded-for") ||
          request?.headers?.get("x-real-ip") ||
          "unknown";

        const rateLimit = loginRateLimiter.check(ip);
        if (!rateLimit.success) {
          throw new Error(
            `Too many login attempts. Please try again in ${Math.ceil(
              (rateLimit.resetTime - Date.now()) / 1000
            )} seconds.`
          );
        }

        try {
          const supabase = createServerClient();

          // ユーザーを検索
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("nickname", nickname)
            .single();

          console.log("User lookup:", { nickname, found: !!user, error: error?.message });

          if (error || !user) {
            console.log("User not found or error:", error);
            return null;
          }

          // パスワード検証
          const isValid = await verifyPassword(password, user.password_hash);
          console.log("Password verification:", { isValid });

          if (!isValid) {
            console.log("Invalid password");
            return null;
          }

          // レート制限をリセット（成功した場合）
          loginRateLimiter.reset(ip);

          return {
            id: user.id,
            name: user.nickname,
            nickname: user.nickname,
            email: `${user.nickname}@local`, // NextAuthはemailを期待するためダミー
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nickname = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nickname = token.nickname as string;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute = nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/teams") ||
        nextUrl.pathname.startsWith("/simulate") ||
        nextUrl.pathname.startsWith("/season");

      if (isOnProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // リダイレクトしてログインページへ
      } else if (isLoggedIn) {
        // ログイン済みの場合、ログイン/登録ページからダッシュボードへリダイレクト
        if (nextUrl.pathname === "/login" || nextUrl.pathname === "/register") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
