import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import Header from "@/components/layout/Header";
import ToastContainer from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Baseball Batting Simulator",
  description: "野球の打撃成績から試合結果をシミュレーションするWebアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">
          メインコンテンツへスキップ
        </a>
        <ErrorBoundary>
          <SessionProvider>
            <AuthProvider>
              <ToastProvider>
                <Header />
                <main id="main-content">
                  {children}
                </main>
                <ToastContainer />
              </ToastProvider>
            </AuthProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
