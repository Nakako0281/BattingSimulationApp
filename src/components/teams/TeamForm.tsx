"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Team } from "@/types";

interface TeamFormProps {
  team?: Team;
  mode: "create" | "edit";
}

export default function TeamForm({ team, mode }: TeamFormProps) {
  const router = useRouter();
  const [name, setName] = useState(team?.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const url = mode === "create" ? "/api/teams" : `/api/teams/${team?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "保存に失敗しました");
        return;
      }

      // 成功時、チーム一覧へリダイレクト
      router.push("/teams");
    } catch (err) {
      console.error("Form submission error:", err);
      setError("保存に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/teams");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          チーム名 <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="例: 東京タイガース"
          required
          maxLength={100}
        />
        <p className="mt-1 text-xs text-gray-500">
          1-100文字で入力してください
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading
            ? "保存中..."
            : mode === "create"
            ? "チームを作成"
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
    </form>
  );
}
