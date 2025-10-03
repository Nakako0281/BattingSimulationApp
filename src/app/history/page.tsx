"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import type { SimulationResultWithTeams } from "@/types/database";

export default function HistoryPage() {
  const router = useRouter();
  const [results, setResults] = useState<SimulationResultWithTeams[]>([]);
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
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
          シミュレーション履歴
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm md:text-base">
            {error}
          </div>
        )}

        {results.length === 0 ? (
          <EmptyState
            title="保存されたシミュレーション結果がありません"
            description="シミュレーションを実行して結果を保存しましょう"
            action={{
              label: "シミュレーションを実行",
              onClick: () => router.push("/simulate"),
            }}
          />
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                      {result.homeTeam.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {formatDate(result.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="px-2 md:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs md:text-sm font-medium whitespace-nowrap">
                      {result.simulation_type === "single_game" ? "単一試合" : "シーズン"}
                    </span>
                    <button
                      onClick={() => handleDelete(result.id)}
                      className="text-red-600 hover:text-red-800 text-xs md:text-sm font-medium whitespace-nowrap"
                    >
                      削除
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {result.simulation_type === "single_game" ? (
                    <>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-blue-600">
                          {result.home_runs}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">ホーム得点</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-red-600">
                          {result.away_runs}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">アウェイ得点</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-gray-900">
                          {result.home_hits}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">安打</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-gray-900">
                          {result.innings_played}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">イニング</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-blue-600">
                          {result.home_wins}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">ホーム勝</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-red-600">
                          {result.home_losses}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">ホーム敗</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-green-600">
                          {result.home_wins && result.games_played
                            ? ((result.home_wins / result.games_played) * 100).toFixed(1)
                            : "0.0"}%
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">ホーム勝率</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl md:text-2xl font-bold text-gray-900">
                          {result.games_played}
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">試合</div>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
