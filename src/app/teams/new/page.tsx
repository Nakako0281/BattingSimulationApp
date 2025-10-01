"use client";

import TeamForm from "@/components/teams/TeamForm";

export default function NewTeamPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            新規チーム作成
          </h1>
          <p className="text-gray-600">
            チーム名を入力してチームを作成します
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <TeamForm mode="create" />
        </div>
      </div>
    </div>
  );
}
