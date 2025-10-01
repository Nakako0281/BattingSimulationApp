import { LRUCache } from "lru-cache";

type RateLimitOptions = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  maxAttempts?: number;
};

/**
 * レート制限を実装するクラス
 * IPアドレスごとに一定時間内のリクエスト数を制限
 */
export class RateLimiter {
  private cache: LRUCache<string, number[]>;
  private interval: number;
  private maxAttempts: number;

  constructor(options: RateLimitOptions = {}) {
    const {
      uniqueTokenPerInterval = 500,
      interval = 60 * 1000, // 1分
      maxAttempts = 5,
    } = options;

    this.cache = new LRUCache<string, number[]>({
      max: uniqueTokenPerInterval,
      ttl: interval,
    });

    this.interval = interval;
    this.maxAttempts = maxAttempts;
  }

  /**
   * リクエストをチェックしてレート制限を適用
   * @param identifier - 識別子（通常はIPアドレス）
   * @returns レート制限に引っかかった場合false、許可された場合true
   */
  public check(identifier: string): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const attempts = this.cache.get(identifier) || [];

    // 古いエントリを削除
    const validAttempts = attempts.filter((time) => now - time < this.interval);

    // レート制限チェック
    if (validAttempts.length >= this.maxAttempts) {
      const oldestAttempt = Math.min(...validAttempts);
      const resetTime = oldestAttempt + this.interval;

      return {
        success: false,
        remaining: 0,
        resetTime,
      };
    }

    // 新しいリクエストを記録
    validAttempts.push(now);
    this.cache.set(identifier, validAttempts);

    return {
      success: true,
      remaining: this.maxAttempts - validAttempts.length,
      resetTime: now + this.interval,
    };
  }

  /**
   * 特定の識別子のレート制限をリセット
   * @param identifier - 識別子
   */
  public reset(identifier: string): void {
    this.cache.delete(identifier);
  }
}

// デフォルトのレート制限インスタンス
// ログイン: 5回/分
export const loginRateLimiter = new RateLimiter({
  uniqueTokenPerInterval: 500,
  interval: 60 * 1000, // 1分
  maxAttempts: 5,
});

// 登録: 3回/時間
export const registerRateLimiter = new RateLimiter({
  uniqueTokenPerInterval: 500,
  interval: 60 * 60 * 1000, // 1時間
  maxAttempts: 3,
});
