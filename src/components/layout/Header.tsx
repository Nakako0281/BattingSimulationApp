"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // ログイン・登録ページではヘッダーを表示しない
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "ダッシュボード" },
    { href: "/teams", label: "チーム管理" },
    { href: "/simulate", label: "シミュレーション" },
    { href: "/history", label: "履歴" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" role="banner">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14 md:h-16">
          <div className="flex items-center gap-4 md:gap-8 overflow-x-auto">
            <Link
              href="/dashboard"
              className="text-base md:text-xl font-bold text-gray-900 whitespace-nowrap"
              aria-label="ホームページに戻る"
            >
              野球シミュレーター
            </Link>
            <nav className="flex gap-3 md:gap-6" role="navigation" aria-label="メインナビゲーション">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`text-xs md:text-sm font-medium transition whitespace-nowrap ${
                    pathname === item.href
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {user && (
              <>
                <span className="text-xs md:text-sm text-gray-600 hidden sm:inline" aria-label="ログインユーザー">
                  {user.nickname}
                </span>
                <button
                  onClick={logout}
                  className="text-xs md:text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                  aria-label="ログアウトする"
                >
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
