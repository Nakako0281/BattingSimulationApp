"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdEdit, MdDelete, MdContentCopy, MdAdd } from "react-icons/md";
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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {team.name}
              </h1>
              <div className="relative group inline-block">
                <Link
                  href={`/teams/${teamId}/edit`}
                  className="text-blue-600 hover:text-blue-800 inline-flex items-center justify-center"
                  aria-label="チーム名を編集"
                >
                  <MdEdit size={24} />
                </Link>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
                  編集
                </span>
              </div>
            </div>
            <p className="text-gray-600">
              作成日: {new Date(team.created_at).toLocaleDateString("ja-JP")}
            </p>
          </div>
          <div>
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
          </div>

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
                {Array.from({ length: 9 }, (_, i) => {
                  const order = i + 1;
                  const player = team.players.find((p) => p.batting_order === order);

                  if (player) {
                    const stats = calculatePlayerStats(player);
                    return (
                      <tr key={order} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order}
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
                          <div className="relative group inline-block mr-3">
                            <button
                              onClick={() =>
                                router.push(`/teams/${teamId}/players/${player.id}/edit`)
                              }
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center justify-center"
                              aria-label="編集"
                            >
                              <MdEdit size={20} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
                              編集
                            </span>
                          </div>
                          <div className="relative group inline-block mr-3">
                            <button
                              onClick={() =>
                                router.push(`/teams/${teamId}/players/new?copyFrom=${player.id}`)
                              }
                              className="text-green-600 hover:text-green-800 inline-flex items-center justify-center"
                              aria-label="コピー"
                            >
                              <MdContentCopy size={20} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
                              コピー
                            </span>
                          </div>
                          <div className="relative group inline-block">
                            <button
                              onClick={() => handleDeletePlayer(player.id, player.name)}
                              className="text-red-600 hover:text-red-800 inline-flex items-center justify-center"
                              aria-label="削除"
                            >
                              <MdDelete size={20} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
                              削除
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr key={order} className="bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 italic">
                          (未登録)
                        </td>
                        <td colSpan={7} className="px-4 py-3 text-sm text-center text-gray-400">
                          -
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <div className="relative group inline-block">
                            <button
                              onClick={() =>
                                router.push(`/teams/${teamId}/players/new?battingOrder=${order}`)
                              }
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center justify-center"
                              aria-label="追加"
                            >
                              <MdAdd size={20} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
                              追加
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
