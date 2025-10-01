"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SimulationResultWithTeam } from "@/types/database";

export default function HistoryPage() {
  const router = useRouter();
  const [results, setResults] = useState<SimulationResultWithTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/simulate/history");
      const result = await response.json();

      if (!result.success) {
        setError(result.error || "履歴の取得に失敗しました");
        return;
      }

      setResults(result.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("履歴の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この記録を削除しますか？")) return;

    try {
      const response = await fetch(`/api/simulate/history/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "削除に失敗しました");
        return;
      }

      // Remove from local state
      setResults(results.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error deleting result:", err);
      setError("削除に失敗しました");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          シミュレーション履歴
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">保存されたシミュレーション結果がありません</p>
            <button
              onClick={() => router.push("/simulate")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              → シミュレーションを実行
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {result.team.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(result.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {result.simulation_type === "single_game" ? "単一試合" : "シーズン"}
                    </span>
                    <button
                      onClick={() => handleDelete(result.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      削除
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {result.simulation_type === "single_game" ? (
                    <>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {result.total_runs}
                        </div>
                        <div className="text-sm text-gray-600">得点</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {result.total_hits}
                        </div>
                        <div className="text-sm text-gray-600">安打</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {result.total_errors}
                        </div>
                        <div className="text-sm text-gray-600">失策</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {result.innings_played}
                        </div>
                        <div className="text-sm text-gray-600">イニング</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {result.wins}
                        </div>
                        <div className="text-sm text-gray-600">勝</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {result.losses}
                        </div>
                        <div className="text-sm text-gray-600">敗</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {result.wins && result.games_played
                            ? ((result.wins / result.games_played) * 100).toFixed(1)
                            : "0.0"}%
                        </div>
                        <div className="text-sm text-gray-600">勝率</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {result.games_played}
                        </div>
                        <div className="text-sm text-gray-600">試合</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
