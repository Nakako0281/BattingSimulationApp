"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Card from "@/components/ui/Card";
import type { Team, SeasonResult } from "@/types";
import { formatBattingAverage, formatPercentage, formatOPS } from "@/lib/utils/stats";
import { getMatchSeasonSummary } from "@/lib/simulation/season";

export default function SimulateSeasonPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [numberOfGames, setNumberOfGames] = useState(10);
  const [innings, setInnings] = useState(9);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTeams, setIsFetchingTeams] = useState(true);
  const [error, setError] = useState("");
  const [seasonResult, setSeasonResult] = useState<SeasonResult | null>(null);
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
        setHomeTeamId(result.data[0].id);
        if (result.data.length > 1) {
          setAwayTeamId(result.data[1].id);
        }
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("チームの取得に失敗しました");
    } finally {
      setIsFetchingTeams(false);
    }
  };

  const handleSimulate = async () => {
    if (!homeTeamId || !awayTeamId) {
      setError("ホームチームとアウェイチームを選択してください");
      return;
    }

    if (homeTeamId === awayTeamId) {
      setError("異なるチームを選択してください");
      return;
    }

    setError("");
    setIsLoading(true);
    setSeasonResult(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/simulate/season", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeTeamId,
          awayTeamId,
          numberOfGames,
          innings,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "シミュレーションに失敗しました");
        return;
      }

      setSeasonResult(result.data);
    } catch (err) {
      console.error("Season simulation error:", err);
      setError("シミュレーションに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!seasonResult) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/simulate/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "season",
          homeTeamId,
          awayTeamId,
          result: seasonResult,
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
    return <LoadingScreen />;
  }

  const summary = seasonResult ? getMatchSeasonSummary(seasonResult) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
          シーズンシミュレーション
        </h1>

        {/* 設定パネル */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">シミュレーション設定</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {teams.length < 2 ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
              <p className="mb-2">シミュレーションを実行するには2つのチームが必要です（現在: {teams.length}チーム）</p>
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
                <label htmlFor="homeTeam" className="block text-sm font-medium mb-2">
                  ホームチーム
                </label>
                <select
                  id="homeTeam"
                  value={homeTeamId}
                  onChange={(e) => setHomeTeamId(e.target.value)}
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
                <label htmlFor="awayTeam" className="block text-sm font-medium mb-2">
                  アウェイチーム
                </label>
                <select
                  id="awayTeam"
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(e.target.value)}
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
                <label htmlFor="games" className="block text-sm font-medium mb-2">
                  試合数 (1-162)
                </label>
                <input
                  id="games"
                  type="number"
                  value={numberOfGames}
                  onChange={(e) => setNumberOfGames(Number(e.target.value))}
                  disabled={isLoading}
                  min="1"
                  max="162"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                />
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
                disabled={isLoading || !homeTeamId || !awayTeamId || homeTeamId === awayTeamId}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? "シミュレーション中..." : "シーズンシミュレーション実行"}
              </button>
            </div>
          )}
        </div>

        {/* 結果表示 */}
        {seasonResult && summary && (
          <div className="space-y-6">
            {/* シーズンサマリー */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">シーズン成績</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">総試合数</div>
                  <div className="text-3xl font-bold text-gray-900">{summary.totalGames}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">ホーム勝利</div>
                  <div className="text-3xl font-bold text-blue-600">{summary.homeWins}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    勝率: {(summary.homeWinRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">アウェイ勝利</div>
                  <div className="text-3xl font-bold text-red-600">{summary.awayWins}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    勝率: {(summary.awayWinRate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {summary.ties > 0 && (
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-600 mb-1">引き分け</div>
                  <div className="text-2xl font-bold text-gray-500">{summary.ties}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">{seasonResult.homeTeamName}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">平均得点</span>
                      <span className="font-medium text-gray-900">
                        {summary.homeTeamStats.averageRunsPerGame.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">総得点</span>
                      <span className="font-medium text-gray-900">{summary.homeTeamStats.totalRuns}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">総安打</span>
                      <span className="font-medium text-gray-900">{summary.homeTeamStats.totalHits}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">{seasonResult.awayTeamName}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">平均得点</span>
                      <span className="font-medium text-gray-900">
                        {summary.awayTeamStats.averageRunsPerGame.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">総得点</span>
                      <span className="font-medium text-gray-900">{summary.awayTeamStats.totalRuns}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">総安打</span>
                      <span className="font-medium text-gray-900">{summary.awayTeamStats.totalHits}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ホームチーム選手シーズン成績 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{seasonResult.homeTeamName} - 選手シーズン成績</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">選手名</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">試合</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">打数</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">安打</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">本塁打</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">打点</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">打率</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">出塁率</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">長打率</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">OPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {seasonResult.seasonStats.homeTeamStats.playerSeasonStats.map((player) => (
                      <tr key={player.playerId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{player.playerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.games}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.atBats}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.hits}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.homeRuns}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.rbi}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {formatBattingAverage(player.battingAverage)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatPercentage(player.onBasePercentage)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatPercentage(player.sluggingPercentage)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {formatOPS(player.ops)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* アウェイチーム選手シーズン成績 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{seasonResult.awayTeamName} - 選手シーズン成績</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">選手名</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">試合</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">打数</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">安打</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">本塁打</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">打点</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">打率</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">出塁率</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">長打率</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">OPS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {seasonResult.seasonStats.awayTeamStats.playerSeasonStats.map((player) => (
                      <tr key={player.playerId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{player.playerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.games}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.atBats}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.hits}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.homeRuns}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{player.rbi}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {formatBattingAverage(player.battingAverage)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatPercentage(player.onBasePercentage)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">
                          {formatPercentage(player.sluggingPercentage)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {formatOPS(player.ops)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 試合結果一覧 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">試合結果一覧</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
                {seasonResult.matches.map((match, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded text-center ${
                      match.winner === "home"
                        ? "bg-blue-50 border border-blue-200"
                        : match.winner === "away"
                        ? "bg-red-50 border border-red-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <div className="text-xs text-gray-600 mb-1">第{index + 1}戦</div>
                    <div className="text-sm font-bold text-gray-900">
                      {match.finalScore.home} - {match.finalScore.away}
                    </div>
                    <div className={`text-xs font-medium ${
                      match.winner === "home" ? "text-blue-600" :
                      match.winner === "away" ? "text-red-600" : "text-gray-600"
                    }`}>
                      {match.winner === "home" ? "ホーム勝" :
                       match.winner === "away" ? "アウェイ勝" : "引分"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
