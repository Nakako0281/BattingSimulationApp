"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Card from "@/components/ui/Card";
import type { Team, MatchResult } from "@/types";
import { formatBattingAverage } from "@/lib/utils/stats";

export default function SimulatePage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [innings, setInnings] = useState(9);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTeams, setIsFetchingTeams] = useState(true);
  const [error, setError] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
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
    setMatchResult(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          homeTeamId,
          awayTeamId,
          innings,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "シミュレーションに失敗しました");
        return;
      }

      setMatchResult(result.data);
    } catch (err) {
      console.error("Simulation error:", err);
      setError("シミュレーションに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!matchResult) return;

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
          homeTeamId,
          awayTeamId,
          result: matchResult,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
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
                {isLoading ? "シミュレーション中..." : "試合シミュレーション実行"}
              </button>
            </div>
          )}
        </div>

        {/* 結果表示 */}
        {matchResult && (
          <div className="space-y-6">
            {/* スコアボード */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
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

              {/* スコアボード */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex justify-center items-center gap-8 mb-4">
                  <div className="text-center flex-1">
                    <div className="text-sm text-gray-600 mb-2">ホーム</div>
                    <div className="text-xl font-bold text-gray-900 mb-2">{matchResult.homeTeam.teamName}</div>
                    <div className={`text-5xl font-bold ${
                      matchResult.winner === "home" ? "text-blue-600" : "text-gray-400"
                    }`}>
                      {matchResult.finalScore.home}
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-gray-400">-</div>

                  <div className="text-center flex-1">
                    <div className="text-sm text-gray-600 mb-2">アウェイ</div>
                    <div className="text-xl font-bold text-gray-900 mb-2">{matchResult.awayTeam.teamName}</div>
                    <div className={`text-5xl font-bold ${
                      matchResult.winner === "away" ? "text-blue-600" : "text-gray-400"
                    }`}>
                      {matchResult.finalScore.away}
                    </div>
                  </div>
                </div>

                {matchResult.winner !== "tie" && (
                  <div className="text-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-lg font-bold text-blue-600">
                      {matchResult.winner === "home" ? matchResult.homeTeam.teamName : matchResult.awayTeam.teamName} の勝利！
                    </span>
                  </div>
                )}
                {matchResult.winner === "tie" && (
                  <div className="text-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-600">引き分け</span>
                  </div>
                )}
              </div>

              {/* チーム統計 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">{matchResult.homeTeam.teamName}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">安打</span>
                      <span className="font-medium text-gray-900">{matchResult.homeTeam.totalHits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">失策</span>
                      <span className="font-medium text-gray-900">{matchResult.homeTeam.totalErrors}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">{matchResult.awayTeam.teamName}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">安打</span>
                      <span className="font-medium text-gray-900">{matchResult.awayTeam.totalHits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">失策</span>
                      <span className="font-medium text-gray-900">{matchResult.awayTeam.totalErrors}</span>
                    </div>
                  </div>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">チーム</th>
                      {matchResult.homeTeam.innings.map((inning) => (
                        <th key={inning.inningNumber} className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                          {inning.inningNumber}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                        計
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{matchResult.homeTeam.teamName}</td>
                      {matchResult.homeTeam.innings.map((inning) => (
                        <td key={inning.inningNumber} className="px-4 py-3 text-center text-gray-900 font-medium">
                          {inning.runs}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center text-blue-600 font-bold">
                        {matchResult.finalScore.home}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{matchResult.awayTeam.teamName}</td>
                      {matchResult.awayTeam.innings.map((inning) => (
                        <td key={inning.inningNumber} className="px-4 py-3 text-center text-gray-900 font-medium">
                          {inning.runs}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center text-blue-600 font-bold">
                        {matchResult.finalScore.away}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ホームチーム選手成績 */}
            <Card>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">{matchResult.homeTeam.teamName} - 選手成績</h3>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-900">打順</th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-900">選手名</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">打数</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">安打</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">2塁打</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">3塁打</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">本塁打</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">打点</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">四球</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">三振</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">打率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {matchResult.homeTeam.playerStats
                      .sort((a, b) => a.battingOrder - b.battingOrder)
                      .map((player) => (
                        <tr key={player.playerId} className="hover:bg-gray-50">
                          <td className="px-3 py-3 text-sm text-gray-900">{player.battingOrder}</td>
                          <td className="px-3 py-3 text-sm font-medium text-gray-900">{player.playerName}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.atBats}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.hits}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.doubles}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.triples}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.homeRuns}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.rbi}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.walks}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.strikeouts}</td>
                          <td className="px-3 py-3 text-sm text-gray-900 text-right font-medium">
                            {formatBattingAverage(player.battingAverage)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {matchResult.homeTeam.playerStats
                  .sort((a, b) => a.battingOrder - b.battingOrder)
                  .map((player) => (
                    <div key={player.playerId} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-900">
                          {player.battingOrder}. {player.playerName}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatBattingAverage(player.battingAverage)}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.atBats}</div>
                          <div className="text-gray-600">打数</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.hits}</div>
                          <div className="text-gray-600">安打</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.homeRuns}</div>
                          <div className="text-gray-600">本塁打</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.rbi}</div>
                          <div className="text-gray-600">打点</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-gray-200">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.doubles}</div>
                          <div className="text-gray-600">2塁打</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.walks}</div>
                          <div className="text-gray-600">四球</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.strikeouts}</div>
                          <div className="text-gray-600">三振</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {/* アウェイチーム選手成績 */}
            <Card>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">{matchResult.awayTeam.teamName} - 選手成績</h3>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-900">打順</th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-900">選手名</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">打数</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">安打</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">2塁打</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">3塁打</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">本塁打</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">打点</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">四球</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">三振</th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-900">打率</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {matchResult.awayTeam.playerStats
                      .sort((a, b) => a.battingOrder - b.battingOrder)
                      .map((player) => (
                        <tr key={player.playerId} className="hover:bg-gray-50">
                          <td className="px-3 py-3 text-sm text-gray-900">{player.battingOrder}</td>
                          <td className="px-3 py-3 text-sm font-medium text-gray-900">{player.playerName}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.atBats}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.hits}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.doubles}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.triples}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.homeRuns}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.rbi}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.walks}</td>
                          <td className="px-3 py-3 text-sm text-gray-600 text-right">{player.strikeouts}</td>
                          <td className="px-3 py-3 text-sm text-gray-900 text-right font-medium">
                            {formatBattingAverage(player.battingAverage)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {matchResult.awayTeam.playerStats
                  .sort((a, b) => a.battingOrder - b.battingOrder)
                  .map((player) => (
                    <div key={player.playerId} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-900">
                          {player.battingOrder}. {player.playerName}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatBattingAverage(player.battingAverage)}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.atBats}</div>
                          <div className="text-gray-600">打数</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.hits}</div>
                          <div className="text-gray-600">安打</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.homeRuns}</div>
                          <div className="text-gray-600">本塁打</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.rbi}</div>
                          <div className="text-gray-600">打点</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-gray-200">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.doubles}</div>
                          <div className="text-gray-600">2塁打</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.walks}</div>
                          <div className="text-gray-600">四球</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{player.strikeouts}</div>
                          <div className="text-gray-600">三振</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
