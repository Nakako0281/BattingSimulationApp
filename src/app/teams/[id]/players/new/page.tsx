"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PlayerForm from "@/components/players/PlayerForm";
import type { TeamWithPlayers } from "@/types";

export default function NewPlayerPage() {
  const params = useParams();
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

  if (team.players.length >= 9) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            選手は最大9人までです。新しい選手を追加するには、既存の選手を削除してください。
          </div>
        </div>
      </div>
    );
  }

  const existingBattingOrders = team.players.map((p) => p.batting_order);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            選手登録 - {team.name}
          </h1>
          <p className="text-gray-600">
            選手情報を入力して登録します（{team.players.length}/9人）
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <PlayerForm
            teamId={teamId}
            mode="create"
            existingBattingOrders={existingBattingOrders}
          />
        </div>
      </div>
    </div>
  );
}
