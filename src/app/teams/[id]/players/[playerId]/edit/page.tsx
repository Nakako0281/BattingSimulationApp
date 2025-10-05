"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PlayerForm from "@/components/players/PlayerForm";
import type { Player, TeamWithPlayers } from "@/types";

export default function EditPlayerPage() {
  const params = useParams();
  const teamId = params.id as string;
  const playerId = params.playerId as string;
  const [team, setTeam] = useState<TeamWithPlayers | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [teamId, playerId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // チーム情報と選手情報を並行取得
      const [teamResponse, playerResponse] = await Promise.all([
        fetch(`/api/teams/${teamId}`),
        fetch(`/api/players/${playerId}?team_id=${teamId}`),
      ]);

      const teamResult = await teamResponse.json();
      const playerResult = await playerResponse.json();

      if (!teamResult.success) {
        setError(teamResult.error || "チームの取得に失敗しました");
        return;
      }

      if (!playerResult.success) {
        setError(playerResult.error || "選手の取得に失敗しました");
        return;
      }

      setTeam(teamResult.data);
      setPlayer(playerResult.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("データの取得に失敗しました");
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

  if (error || !team || !player) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || "データが見つかりません"}
          </div>
        </div>
      </div>
    );
  }

  const existingBattingOrders = team.players
    .filter((p) => p.id !== playerId)
    .map((p) => p.batting_order);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            選手編集 - {team.name}
          </h1>
          <p className="text-gray-600">選手情報を編集します</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <PlayerForm
            teamId={teamId}
            player={player}
            mode="edit"
            existingBattingOrders={existingBattingOrders}
            existingPlayers={team.players}
          />
        </div>
      </div>
    </div>
  );
}
