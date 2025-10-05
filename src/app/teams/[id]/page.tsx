"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MdEdit, MdDelete, MdContentCopy, MdContentPaste } from "react-icons/md";
import type { TeamWithPlayers, Player } from "@/types";
import { calculatePlayerStats, calculateTeamStats, formatBattingAverage, formatPercentage, formatOPS } from "@/lib/utils/stats";

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;
  const [team, setTeam] = useState<TeamWithPlayers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // インライン編集用のstate
  const [formData, setFormData] = useState<Record<string, Player>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // コピー&ペースト用のstate
  const [copiedPlayerStats, setCopiedPlayerStats] = useState<{
    at_bats: number;
    singles: number;
    doubles: number;
    triples: number;
    home_runs: number;
    walks: number;
  } | null>(null);

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

      // フォームデータを初期化
      const initialFormData: Record<string, Player> = {};
      result.data.players.forEach((player: Player) => {
        initialFormData[player.id] = { ...player };
      });
      setFormData(initialFormData);
    } catch (err) {
      console.error("Error fetching team:", err);
      setError("チームの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // 変更検知
  const hasChanges = useMemo(() => {
    if (!team) return false;
    return team.players.some(player => {
      const current = formData[player.id];
      if (!current) return false;
      return JSON.stringify(player) !== JSON.stringify(current);
    });
  }, [formData, team]);

  // 入力変更ハンドラー
  const handleChange = (playerId: string, field: keyof Player, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: field === 'name' ? value : Number(value)
      }
    }));

    // バリデーション
    const updated = { ...formData[playerId], [field]: field === 'name' ? value : Number(value) };
    const hits = (updated.singles || 0) + (updated.doubles || 0) + (updated.triples || 0) + (updated.home_runs || 0);

    if (hits > (updated.at_bats || 0)) {
      setValidationErrors(prev => ({
        ...prev,
        [playerId]: '安打数が打数を超えています'
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        [playerId]: ''
      }));
    }
  };

  // コピーハンドラー
  const handleCopyStats = (player: Player) => {
    setCopiedPlayerStats({
      at_bats: player.at_bats,
      singles: player.singles,
      doubles: player.doubles,
      triples: player.triples,
      home_runs: player.home_runs,
      walks: player.walks,
    });
  };

  // ペーストハンドラー
  const handlePasteStats = (playerId: string) => {
    if (!copiedPlayerStats) return;

    setFormData(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        at_bats: copiedPlayerStats.at_bats,
        singles: copiedPlayerStats.singles,
        doubles: copiedPlayerStats.doubles,
        triples: copiedPlayerStats.triples,
        home_runs: copiedPlayerStats.home_runs,
        walks: copiedPlayerStats.walks,
      }
    }));

    // バリデーションをクリア
    setValidationErrors(prev => ({
      ...prev,
      [playerId]: ''
    }));
  };

  // 一括保存ハンドラー
  const handleBulkSave = async () => {
    if (!team) return;

    // バリデーションエラーチェック
    const hasErrors = Object.values(validationErrors).some(err => err !== '');
    if (hasErrors) {
      alert('入力エラーがあります。修正してください。');
      return;
    }

    setIsSaving(true);

    try {
      // 変更があった選手を抽出
      const changedPlayers = team.players.filter(player => {
        const current = formData[player.id];
        return JSON.stringify(player) !== JSON.stringify(current);
      });

      // 並列でUPDATE
      await Promise.all(
        changedPlayers.map(player =>
          fetch(`/api/players/${player.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData[player.id],
              team_id: teamId
            })
          })
        )
      );

      // 成功時: チーム情報を再取得してコピー状態をクリア
      await fetchTeam();
      setCopiedPlayerStats(null);
      alert('保存しました');
    } catch (err) {
      console.error('Bulk save error:', err);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPlayer = async (player: Player) => {
    if (!confirm(`「${player.name}」を初期状態に戻してもよろしいですか？\n（名前: 選手${player.batting_order}、成績: すべて0）`)) {
      return;
    }

    try {
      const response = await fetch(`/api/players/${player.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `選手${player.batting_order}`,
          at_bats: 0,
          singles: 0,
          doubles: 0,
          triples: 0,
          home_runs: 0,
          walks: 0,
          team_id: teamId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || "リセットに失敗しました");
        return;
      }

      // チーム情報を再取得
      await fetchTeam();
      alert("選手を初期状態に戻しました");
    } catch (err) {
      console.error("Error resetting player:", err);
      alert("リセットに失敗しました");
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
            <button
              onClick={handleBulkSave}
              disabled={!hasChanges || isSaving}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                hasChanges && !isSaving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? '保存中...' : hasChanges ? '変更を保存' : '変更なし'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-16" /> {/* 打順 */}
                <col className="w-48" /> {/* 選手名 */}
                <col className="w-24" /> {/* 打数 */}
                <col className="w-20" /> {/* 単打 */}
                <col className="w-20" /> {/* 二塁打 */}
                <col className="w-20" /> {/* 三塁打 */}
                <col className="w-20" /> {/* 本塁打 */}
                <col className="w-20" /> {/* 四球 */}
                <col className="w-20" /> {/* 打率 */}
                <col className="w-28" /> {/* 操作 */}
              </colgroup>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-3 text-left text-sm font-medium text-gray-900">打順</th>
                  <th className="px-2 py-3 text-left text-sm font-medium text-gray-900">選手名</th>
                  <th className="px-2 py-3 text-right text-sm font-medium text-gray-900">打数</th>
                  <th className="px-2 py-3 text-right text-sm font-medium text-gray-900">単打</th>
                  <th className="px-2 py-3 text-right text-sm font-medium text-gray-900">二塁打</th>
                  <th className="px-2 py-3 text-right text-sm font-medium text-gray-900">三塁打</th>
                  <th className="px-2 py-3 text-right text-sm font-medium text-gray-900">本塁打</th>
                  <th className="px-2 py-3 text-right text-sm font-medium text-gray-900">四球</th>
                  <th className="px-2 py-3 text-right text-sm font-medium text-gray-900">打率</th>
                  <th className="px-2 py-3 text-center text-sm font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from({ length: 9 }, (_, i) => {
                  const order = i + 1;
                  const player = team.players.find((p) => p.batting_order === order);

                  // 選手が存在しない場合はスキップ（常に9人いる前提だが念のため）
                  if (!player) return null;

                  const currentData = formData[player.id] || player;
                  const stats = calculatePlayerStats(currentData);
                  const hasError = validationErrors[player.id];

                  return (
                    <tr key={order} className="hover:bg-gray-50">
                        <td className="px-2 py-2 text-sm text-gray-900">{order}</td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={currentData.name}
                            onChange={(e) => handleChange(player.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={currentData.at_bats}
                            onChange={(e) => handleChange(player.id, 'at_bats', e.target.value)}
                            className="w-20 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={currentData.singles}
                            onChange={(e) => handleChange(player.id, 'singles', e.target.value)}
                            className="w-16 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={currentData.doubles}
                            onChange={(e) => handleChange(player.id, 'doubles', e.target.value)}
                            className="w-16 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={currentData.triples}
                            onChange={(e) => handleChange(player.id, 'triples', e.target.value)}
                            className="w-16 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={currentData.home_runs}
                            onChange={(e) => handleChange(player.id, 'home_runs', e.target.value)}
                            className="w-16 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={currentData.walks}
                            onChange={(e) => handleChange(player.id, 'walks', e.target.value)}
                            className="w-16 px-2 py-1 text-sm text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            min="0"
                          />
                        </td>
                        <td className="px-2 py-2 text-sm text-gray-900 text-right font-medium">
                          {hasError ? (
                            <span className="text-red-600 text-xs">{hasError}</span>
                          ) : (
                            formatBattingAverage(stats.batting_average)
                          )}
                        </td>
                        <td className="px-2 py-2 text-sm text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* コピーボタンまたはペーストボタン */}
                            {copiedPlayerStats ? (
                              <div className="relative group">
                                <button
                                  onClick={() => handlePasteStats(player.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                  aria-label="ペースト"
                                >
                                  <MdContentPaste size={18} />
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block z-10">
                                  ペースト
                                </span>
                              </div>
                            ) : (
                              <div className="relative group">
                                <button
                                  onClick={() => handleCopyStats(player)}
                                  className="text-green-600 hover:text-green-800"
                                  aria-label="コピー"
                                >
                                  <MdContentCopy size={18} />
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block z-10">
                                  コピー
                                </span>
                              </div>
                            )}

                            {/* リセットボタン */}
                            <div className="relative group">
                              <button
                                onClick={() => handleResetPlayer(player)}
                                className="text-orange-600 hover:text-orange-800"
                                aria-label="リセット"
                              >
                                <MdDelete size={18} />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block z-10">
                                リセット
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
