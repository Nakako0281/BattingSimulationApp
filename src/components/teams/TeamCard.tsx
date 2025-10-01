"use client";

import Link from "next/link";
import type { Team } from "@/types";

interface TeamCardProps {
  team: Team;
  onDelete?: (teamId: string) => void;
}

export default function TeamCard({ team, onDelete }: TeamCardProps) {
  const handleDelete = () => {
    if (confirm(`「${team.name}」を削除してもよろしいですか？`)) {
      onDelete?.(team.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
        <div className="flex gap-2">
          <Link
            href={`/teams/${team.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            詳細
          </Link>
          <Link
            href={`/teams/${team.id}/edit`}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            編集
          </Link>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              削除
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500">
        作成日: {new Date(team.created_at).toLocaleDateString("ja-JP")}
      </div>
    </div>
  );
}
