import { useState, useCallback } from "react";
import { handleApiResponse } from "@/lib/utils/errors";

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (url: string, init?: RequestInit) => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(url, init);
        const result = await handleApiResponse<T>(response);

        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
        setError(errorMessage);
        options?.onError?.(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError("");
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, execute, reset };
}

export function useFetch<T = any>(url: string, options?: UseApiOptions) {
  const api = useApi<T>(options);

  const refetch = useCallback(() => {
    return api.execute(url);
  }, [api, url]);

  return { ...api, refetch };
}
