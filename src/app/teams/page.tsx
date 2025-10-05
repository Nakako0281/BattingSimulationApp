"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TeamCard from "@/components/teams/TeamCard";
import EmptyState from "@/components/ui/EmptyState";
import { TeamsListSkeleton } from "@/components/ui/Skeleton";
import type { Team } from "@/types";

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/teams");
      const result = await response.json();

      if (!result.success) {
        setError(result.error || "チームの取得に失敗しました");
        return;
      }

      setTeams(result.data || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("チームの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || "削除に失敗しました");
        return;
      }

      // リストから削除
      setTeams(teams.filter((team) => team.id !== teamId));
    } catch (err) {
      console.error("Error deleting team:", err);
      alert("削除に失敗しました");
    }
  };

  if (isLoading) {
    return <TeamsListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">マイチーム</h1>
          <button
            onClick={() => router.push("/teams/new")}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={teams.length >= 4}
          >
            新規チーム作成
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {teams.length >= 4 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
            チームは最大4つまで作成できます
          </div>
        )}

        {teams.length === 0 ? (
          <EmptyState
            title="まだチームがありません"
            description="チームを作成して選手を登録しましょう"
            action={{
              label: "最初のチームを作成",
              onClick: () => router.push("/teams/new"),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
