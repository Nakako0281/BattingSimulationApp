"use client";

import { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
import type { Team } from "@/types";

interface TeamCardProps {
  team: Team;
  onDelete?: (teamId: string) => void;
}

function TeamCard({ team, onDelete }: TeamCardProps) {
  const handleDelete = useCallback(() => {
    if (confirm(`「${team.name}」を削除してもよろしいですか？`)) {
      onDelete?.(team.id);
    }
  }, [team.name, team.id, onDelete]);

  const formattedDate = useMemo(
    () => new Date(team.created_at).toLocaleDateString("ja-JP"),
    [team.created_at]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition relative">
      <Link
        href={`/teams/${team.id}`}
        className="block p-6"
        aria-label={`${team.name}の詳細を見る`}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>

          {/* 削除ボタンのみ */}
          {onDelete && (
            <div
              className="relative group inline-block"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 inline-flex items-center justify-center"
                aria-label="削除"
              >
                <MdDelete size={20} />
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
                削除
              </span>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          作成日: {formattedDate}
        </div>
      </Link>
    </div>
  );
}

export default memo(TeamCard);
