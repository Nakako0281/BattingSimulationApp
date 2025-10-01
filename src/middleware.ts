import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isOnProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/teams") ||
    nextUrl.pathname.startsWith("/simulate") ||
    nextUrl.pathname.startsWith("/season");

  const isOnAuthRoute = nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  // 認証が必要なルートへの未認証アクセス
  if (isOnProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // ログイン済みでログイン/登録ページへのアクセス
  if (isOnAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }

  return undefined;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
