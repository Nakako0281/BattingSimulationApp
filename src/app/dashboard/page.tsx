"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ダッシュボード
        </h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ようこそ、{user?.nickname} さん！
          </h2>
          <p className="text-gray-600 mb-6">
            野球シミュレーションアプリへようこそ。チームを作成して、シミュレーションを開始しましょう。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => router.push("/teams")}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              チーム管理
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              チームを作成・編集して選手を登録します
            </p>
            <div className="text-blue-600 font-medium text-sm">→ チーム一覧へ</div>
          </div>

          <div
            onClick={() => router.push("/simulate")}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              試合シミュレーション
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              チームで1試合をシミュレーションします
            </p>
            <div className="text-blue-600 font-medium text-sm">→ シミュレーション開始</div>
          </div>

          <div
            onClick={() => router.push("/simulate/season")}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              シーズンシミュレーション
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              複数試合のシーズンをシミュレーションします
            </p>
            <div className="text-blue-600 font-medium text-sm">→ シーズン開始</div>
          </div>

          <div
            onClick={() => router.push("/history")}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              シミュレーション履歴
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              過去のシミュレーション結果を確認します
            </p>
            <div className="text-blue-600 font-medium text-sm">→ 履歴を見る</div>
          </div>
        </div>
      </div>
    </div>
  );
}
