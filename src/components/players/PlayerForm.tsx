"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Player } from "@/types";

interface PlayerFormProps {
  teamId: string;
  player?: Player;
  mode: "create" | "edit";
  existingBattingOrders?: number[];
  initialData?: Player;
  initialBattingOrder?: number;
  existingPlayers?: Player[]; // 上書き確認用
}

export default function PlayerForm({
  teamId,
  player,
  mode,
  existingBattingOrders = [],
  initialData,
  initialBattingOrder,
  existingPlayers = [],
}: PlayerFormProps) {
  const router = useRouter();

  // コピーモード: initialDataがある場合は成績のみコピー、名前と打順は空/デフォルト
  // 編集モード: playerデータを使用
  const sourcePlayer = player || initialData;

  const [formData, setFormData] = useState({
    name: player?.name || "",
    // コピーモード時はinitialDataの打順を使わない（成績のみコピー）
    batting_order: player?.batting_order || initialBattingOrder || 1,
    // 成績データは編集モードまたはコピーモードで取得
    singles: sourcePlayer?.singles || 0,
    doubles: sourcePlayer?.doubles || 0,
    triples: sourcePlayer?.triples || 0,
    home_runs: sourcePlayer?.home_runs || 0,
    walks: sourcePlayer?.walks || 0,
    at_bats: sourcePlayer?.at_bats || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [overwriteConfirm, setOverwriteConfirm] = useState<{
    show: boolean;
    existingPlayer?: Player;
  }>({ show: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
    // Clear warnings when user makes changes
    setValidationWarnings([]);
  };

  const validateStats = (): boolean => {
    const warnings: string[] = [];

    // 打数と結果の整合性チェック
    const hits = formData.singles + formData.doubles + formData.triples + formData.home_runs;

    // 安打数が打数を超えていないかチェック
    if (hits > formData.at_bats) {
      warnings.push("安打数が打数を超えています");
    }

    // 統計の整合性の推奨チェック（警告のみ）
    if (formData.at_bats > 0 && hits === 0 && formData.walks === 0) {
      warnings.push("打数が設定されていますが、結果が入力されていません");
    }

    // 打数がゼロなのに結果がある場合
    if (formData.at_bats === 0 && hits > 0) {
      warnings.push("打数がゼロですが安打が記録されています");
    }

    setValidationWarnings(warnings);

    // エラー（安打数が打数を超える）の場合はfalseを返す
    if (hits > formData.at_bats) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーションチェック
    if (!validateStats()) {
      setError("入力データに誤りがあります");
      return;
    }

    // 新規作成時: 選択された打順に既存選手がいるかチェック
    if (mode === "create") {
      const existingPlayer = existingPlayers.find(
        (p) => p.batting_order === formData.batting_order
      );

      if (existingPlayer) {
        // 上書き確認モーダルを表示
        setOverwriteConfirm({
          show: true,
          existingPlayer: existingPlayer,
        });
        return;
      }
    }

    // 通常の登録/更新処理
    await submitForm();
  };

  const submitForm = async () => {
    setIsLoading(true);

    try {
      const url = mode === "create" ? "/api/players" : `/api/players/${player?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const payload =
        mode === "create"
          ? { team_id: teamId, ...formData }
          : { team_id: teamId, ...formData };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "保存に失敗しました");
        return;
      }

      // 成功時、チーム詳細ページへリダイレクト
      router.push(`/teams/${teamId}`);
    } catch (err) {
      console.error("Form submission error:", err);
      setError("保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverwrite = async () => {
    if (!overwriteConfirm.existingPlayer) return;

    setIsLoading(true);
    setOverwriteConfirm({ show: false });

    try {
      // 1. 既存選手を削除
      const deleteResponse = await fetch(
        `/api/players/${overwriteConfirm.existingPlayer.id}?team_id=${teamId}`,
        { method: "DELETE" }
      );

      const deleteResult = await deleteResponse.json();

      if (!deleteResult.success) {
        setError("既存選手の削除に失敗しました");
        setIsLoading(false);
        return;
      }

      // 2. 新規選手を登録
      await submitForm();
    } catch (err) {
      console.error("Overwrite error:", err);
      setError("上書き処理に失敗しました");
      setIsLoading(false);
    }
  };

  const handleCancelOverwrite = () => {
    setOverwriteConfirm({ show: false });
  };

  const handleCancel = () => {
    router.push(`/teams/${teamId}`);
  };

  // 打順選択可否の判定
  const isBattingOrderDisabled = mode === "edit";

  // 利用可能な打順を計算
  const availableBattingOrders = Array.from({ length: 9 }, (_, i) => i + 1).filter(
    (order) => {
      // 編集モード: 自分の打順のみ
      if (mode === "edit") {
        return order === player?.batting_order;
      }

      // コピーモード: コピー元の打順を除外
      if (initialData && order === initialData.batting_order) {
        return false;
      }

      // 新規作成モード: すべて選択可能
      return true;
    }
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {validationWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="font-medium mb-2">⚠️ 入力内容を確認してください：</p>
          <ul className="list-disc list-inside space-y-1">
            {validationWarnings.map((warning, index) => (
              <li key={index} className="text-sm">{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本情報 */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">基本情報</h3>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            選手名 <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100"
            placeholder="例: 山田太郎"
            required
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="batting_order" className="block text-sm font-medium mb-2">
            打順 <span className="text-red-600">*</span>
          </label>
          <select
            id="batting_order"
            name="batting_order"
            value={formData.batting_order}
            onChange={handleChange}
            disabled={isLoading || isBattingOrderDisabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            {availableBattingOrders.map((order) => (
              <option key={order} value={order}>
                {order}番
              </option>
            ))}
          </select>
          {mode === "edit" && (
            <p className="mt-1 text-sm text-gray-500">
              ※ 打順は編集できません
            </p>
          )}
        </div>

        {/* 打撃成績 */}
        <div className="md:col-span-2 mt-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">打撃成績</h3>
        </div>

        <div>
          <label htmlFor="at_bats" className="block text-sm font-medium mb-2">
            打数
          </label>
          <input
            id="at_bats"
            name="at_bats"
            type="number"
            value={formData.at_bats}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="singles" className="block text-sm font-medium mb-2">
            単打
          </label>
          <input
            id="singles"
            name="singles"
            type="number"
            value={formData.singles}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="doubles" className="block text-sm font-medium mb-2">
            二塁打
          </label>
          <input
            id="doubles"
            name="doubles"
            type="number"
            value={formData.doubles}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="triples" className="block text-sm font-medium mb-2">
            三塁打
          </label>
          <input
            id="triples"
            name="triples"
            type="number"
            value={formData.triples}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="home_runs" className="block text-sm font-medium mb-2">
            本塁打
          </label>
          <input
            id="home_runs"
            name="home_runs"
            type="number"
            value={formData.home_runs}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="walks" className="block text-sm font-medium mb-2">
            四球
          </label>
          <input
            id="walks"
            name="walks"
            type="number"
            value={formData.walks}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
            min="0"
          />
        </div>
      </div>

      {/* Note: Out details (strikeouts, groundouts, flyouts) removed for simpler UX */}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading || !formData.name.trim()}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading
            ? "保存中..."
            : mode === "create"
            ? "選手を登録"
            : "変更を保存"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          キャンセル
        </button>
      </div>

      {/* 上書き確認モーダル */}
      {overwriteConfirm.show && overwriteConfirm.existingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              選手の上書き確認
            </h3>
            <p className="text-gray-700 mb-6">
              打順{overwriteConfirm.existingPlayer.batting_order}番には既に「
              {overwriteConfirm.existingPlayer.name}」が登録されています。
              <br />
              上書きしますか？
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleCancelOverwrite}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleOverwrite}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium"
              >
                {isLoading ? "処理中..." : "上書きする"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
