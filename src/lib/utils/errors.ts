/**
 * Error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: "ログインが必要です",
  INVALID_CREDENTIALS: "ニックネームまたはパスワードが正しくありません",
  SESSION_EXPIRED: "セッションの有効期限が切れました。再度ログインしてください",

  // Teams
  TEAM_NOT_FOUND: "チームが見つかりません",
  TEAM_LIMIT_REACHED: "チームは最大4つまで作成できます",
  TEAM_NAME_EXISTS: "このチーム名は既に使用されています",

  // Players
  PLAYER_NOT_FOUND: "選手が見つかりません",
  PLAYER_LIMIT_REACHED: "選手は最大9人まで登録できます",
  BATTING_ORDER_TAKEN: "この打順は既に使用されています",
  INVALID_STATS: "統計データが不正です",

  // Simulation
  SIMULATION_FAILED: "シミュレーションに失敗しました",
  NO_PLAYERS: "選手が登録されていません",
  SAVE_FAILED: "保存に失敗しました",

  // Network
  NETWORK_ERROR: "ネットワークエラーが発生しました",
  SERVER_ERROR: "サーバーエラーが発生しました",
  TIMEOUT: "リクエストがタイムアウトしました",

  // Generic
  UNKNOWN_ERROR: "予期しないエラーが発生しました",
  VALIDATION_ERROR: "入力内容に誤りがあります",
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Map common error messages to user-friendly messages
    if (error.message.includes("Unauthorized")) {
      return ERROR_MESSAGES.UNAUTHORIZED;
    }
    if (error.message.includes("not found")) {
      return ERROR_MESSAGES.TEAM_NOT_FOUND;
    }
    if (error.message.includes("Network")) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    if (error.message.includes("timeout")) {
      return ERROR_MESSAGES.TIMEOUT;
    }

    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const message = getErrorMessage(error);
  return new AppError(message, 500, "UNKNOWN");
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.error || ERROR_MESSAGES.SERVER_ERROR;
    throw new AppError(message, response.status);
  }

  const data = await response.json();

  if (!data.success) {
    throw new AppError(data.error || ERROR_MESSAGES.UNKNOWN_ERROR);
  }

  return data.data;
}
