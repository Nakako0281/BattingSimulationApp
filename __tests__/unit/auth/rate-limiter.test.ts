import { RateLimiter } from "@/lib/auth/rate-limiter";

describe("RateLimiter", () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      uniqueTokenPerInterval: 10,
      interval: 1000, // 1 second
      maxAttempts: 3,
    });
  });

  it("should allow requests within limit", () => {
    const identifier = "test-user-1";

    const result1 = rateLimiter.check(identifier);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = rateLimiter.check(identifier);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = rateLimiter.check(identifier);
    expect(result3.success).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it("should block requests exceeding limit", () => {
    const identifier = "test-user-2";

    // Use up the limit
    rateLimiter.check(identifier);
    rateLimiter.check(identifier);
    rateLimiter.check(identifier);

    // This should be blocked
    const result = rateLimiter.check(identifier);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset limit for specific identifier", () => {
    const identifier = "test-user-3";

    // Use up the limit
    rateLimiter.check(identifier);
    rateLimiter.check(identifier);
    rateLimiter.check(identifier);

    // Reset
    rateLimiter.reset(identifier);

    // Should be allowed again
    const result = rateLimiter.check(identifier);
    expect(result.success).toBe(true);
  });

  it("should handle multiple identifiers independently", () => {
    const user1 = "test-user-4";
    const user2 = "test-user-5";

    // User 1 uses limit
    rateLimiter.check(user1);
    rateLimiter.check(user1);
    rateLimiter.check(user1);

    // User 1 is blocked
    expect(rateLimiter.check(user1).success).toBe(false);

    // User 2 should still be allowed
    expect(rateLimiter.check(user2).success).toBe(true);
  });

  it("should allow requests after interval expires", async () => {
    const identifier = "test-user-6";
    const shortLimiter = new RateLimiter({
      interval: 100, // 100ms
      maxAttempts: 2,
    });

    // Use up the limit
    shortLimiter.check(identifier);
    shortLimiter.check(identifier);

    // Should be blocked
    expect(shortLimiter.check(identifier).success).toBe(false);

    // Wait for interval to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should be allowed again
    expect(shortLimiter.check(identifier).success).toBe(true);
  });
});
