"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Team, GameResult } from "@/types";
import { formatBattingAverage } from "@/lib/utils/stats";

export default function SimulatePage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [innings, setInnings] = useState(9);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTeams, setIsFetchingTeams] = useState(true);
  const [error, setError] = useState("");
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setIsFetchingTeams(true);
      const response = await fetch("/api/teams");
      const result = await response.json();

      if (!result.success) {
        setError(result.error || "チームの取得に失敗しました");
        return;
      }

      setTeams(result.data || []);
      if (result.data && result.data.length > 0) {
        setSelectedTeamId(result.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("チームの取得に失敗しました");
    } finally {
      setIsFetchingTeams(false);
    }
  };

  const handleSimulate = async () => {
    if (!selectedTeamId) {
      setError("チームを選択してください");
      return;
    }

    setError("");
    setIsLoading(true);
    setGameResult(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: selectedTeamId,
          innings,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "シミュレーションに失敗しました");
        return;
      }

      setGameResult(result.data);
    } catch (err) {
      console.error("Simulation error:", err);
      setError("シミュレーションに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!gameResult) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/simulate/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "single_game",
          teamId: selectedTeamId,
          result: gameResult,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "保存に失敗しました");
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetchingTeams) {
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
          試合シミュレーション
        </h1>

        {/* 設定パネル */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">シミュレーション設定</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {teams.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              <p className="mb-2">シミュレーションを実行するにはチームを作成してください</p>
              <button
                onClick={() => router.push("/teams/new")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                → チームを作成
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="team" className="block text-sm font-medium mb-2">
                  チーム選択
                </label>
                <select
                  id="team"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="innings" className="block text-sm font-medium mb-2">
                  イニング数
                </label>
                <input
                  id="innings"
                  type="number"
                  value={innings}
                  onChange={(e) => setInnings(Number(e.target.value))}
                  disabled={isLoading}
                  min="1"
                  max="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                />
              </div>

              <button
                onClick={handleSimulate}
                disabled={isLoading || !selectedTeamId}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? "シミュレーション中..." : "シミュレーション実行"}
              </button>
            </div>
          )}
        </div>

        {/* 結果表示 */}
        {gameResult && (
          <div className="space-y-6">
            {/* スコアボード */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">試合結果</h2>
                <div className="flex gap-2">
                  {saveSuccess && (
                    <span className="text-green-600 text-sm">保存しました</span>
                  )}
                  <button
                    onClick={handleSaveResult}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isSaving ? "保存中..." : "結果を保存"}
                  </button>
                </div>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {gameResult.totalRuns} 得点
                </div>
                <div className="text-gray-600">{gameResult.teamName}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{gameResult.totalRuns}</div>
                  <div className="text-sm text-gray-600">得点</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{gameResult.totalHits}</div>
                  <div className="text-sm text-gray-600">安打</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{gameResult.totalErrors}</div>
                  <div className="text-sm text-gray-600">失策</div>
                </div>
              </div>
            </div>

            {/* イニング別スコア */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">イニング別スコア</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {gameResult.innings.map((inning) => (
                        <th key={inning.inningNumber} className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                          {inning.inningNumber}回
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                        計
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {gameResult.innings.map((inning) => (
                        <td key={inning.inningNumber} className="px-4 py-3 text-center text-gray-900 font-medium">
                          {inning.runs}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center text-blue-600 font-bold">
                        {gameResult.totalRuns}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 選手成績 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">選手成績</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">打順</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">選手名</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">打数</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">安打</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">打点</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">打率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {gameResult.playerStats
                      .sort((a, b) => a.battingOrder - b.battingOrder)
                      .map((player) => (
                        <tr key={player.playerId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{player.battingOrder}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{player.playerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.atBats}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.hits}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.rbi}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {formatBattingAverage(player.battingAverage)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
