"use client";

import { useEffect } from "react";
import { logger } from "@/lib/utils/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Global error caught", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-red-200 rounded-lg p-6 md:p-8 max-w-lg w-full">
        <div className="text-red-600 text-6xl mb-4">500</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          エラーが発生しました
        </h1>
        <p className="text-gray-600 mb-4">
          予期しないエラーが発生しました。再試行するか、ホームに戻ってください。
        </p>
        {error.message && (
          <details className="mb-4">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              エラー詳細
            </summary>
            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            再試行
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
