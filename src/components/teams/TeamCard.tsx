"use client";

import { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { MdVisibility, MdEdit, MdDelete } from "react-icons/md";
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
        <div className="flex gap-3">
          <div className="relative group inline-block">
            <Link
              href={`/teams/${team.id}`}
              className="text-blue-600 hover:text-blue-800 inline-flex items-center justify-center"
              aria-label="詳細"
            >
              <MdVisibility size={20} />
            </Link>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
              詳細
            </span>
          </div>
          <div className="relative group inline-block">
            <Link
              href={`/teams/${team.id}/edit`}
              className="text-green-600 hover:text-green-800 inline-flex items-center justify-center"
              aria-label="編集"
            >
              <MdEdit size={20} />
            </Link>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden md:block">
              編集
            </span>
          </div>
          {onDelete && (
            <div className="relative group inline-block">
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
      </div>

      <div className="text-sm text-gray-500">
        作成日: {formattedDate}
      </div>
    </div>
  );
}

export default memo(TeamCard);
