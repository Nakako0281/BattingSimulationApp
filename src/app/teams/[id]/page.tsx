"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { TeamWithPlayers } from "@/types";
import { calculatePlayerStats, calculateTeamStats, formatBattingAverage, formatPercentage, formatOPS } from "@/lib/utils/stats";

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const [team, setTeam] = useState<TeamWithPlayers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/teams/${teamId}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || "チームの取得に失敗しました");
        return;
      }

      setTeam(result.data);
    } catch (err) {
      console.error("Error fetching team:", err);
      setError("チームの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`「${playerName}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/players/${playerId}?team_id=${teamId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || "削除に失敗しました");
        return;
      }

      // 選手リストから削除
      if (team) {
        setTeam({
          ...team,
          players: team.players.filter((p) => p.id !== playerId),
        });
      }
    } catch (err) {
      console.error("Error deleting player:", err);
      alert("削除に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || "チームが見つかりません"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {team.name}
            </h1>
            <p className="text-gray-600">
              作成日: {new Date(team.created_at).toLocaleDateString("ja-JP")}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/teams/${teamId}/edit`)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >
              編集
            </button>
            <button
              onClick={() => router.push("/teams")}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              一覧へ戻る
            </button>
          </div>
        </div>

        {/* チーム統計サマリー */}
        {team.players.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">チーム成績</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(() => {
                const teamStats = calculateTeamStats(team.players);
                return (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatBattingAverage(teamStats.batting_average)}
                      </div>
                      <div className="text-sm text-gray-600">チーム打率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPercentage(teamStats.on_base_percentage)}
                      </div>
                      <div className="text-sm text-gray-600">チーム出塁率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercentage(teamStats.slugging_percentage)}
                      </div>
                      <div className="text-sm text-gray-600">チーム長打率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatOPS(teamStats.ops)}
                      </div>
                      <div className="text-sm text-gray-600">チームOPS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {teamStats.home_runs}
                      </div>
                      <div className="text-sm text-gray-600">本塁打</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">選手一覧</h2>
            <button
              onClick={() => router.push(`/teams/${teamId}/players/new`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              disabled={team.players.length >= 9}
            >
              選手を追加
            </button>
          </div>

          {team.players.length >= 9 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
              選手は最大9人まで登録できます
            </div>
          )}

          {team.players.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">まだ選手が登録されていません</p>
              <button
                onClick={() => router.push(`/teams/${teamId}/players/new`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                最初の選手を追加
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      打順
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                      選手名
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      打数
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      安打
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      本塁打
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      打率
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      出塁率
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      長打率
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      OPS
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {team.players.map((player) => {
                    const stats = calculatePlayerStats(player);
                    return (
                      <tr key={player.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {player.batting_order}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {player.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {stats.at_bats}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {stats.hits}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {stats.home_runs}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {formatBattingAverage(stats.batting_average)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatPercentage(stats.on_base_percentage)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatPercentage(stats.slugging_percentage)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {formatOPS(stats.ops)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <button
                            onClick={() =>
                              router.push(`/teams/${teamId}/players/${player.id}/edit`)
                            }
                            className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player.id, player.name)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
