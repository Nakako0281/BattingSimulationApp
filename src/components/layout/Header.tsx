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
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              野球シミュレーター
            </Link>
            <nav className="flex gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition ${
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

          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">{user.nickname}</span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
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
