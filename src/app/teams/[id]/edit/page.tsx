"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TeamForm from "@/components/teams/TeamForm";
import type { Team } from "@/types";

export default function EditTeamPage() {
  const params = useParams();
  const teamId = params.id as string;
  const [team, setTeam] = useState<Team | null>(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            チーム編集
          </h1>
          <p className="text-gray-600">
            チーム情報を編集します
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <TeamForm mode="edit" team={team} />
        </div>
      </div>
    </div>
  );
}
