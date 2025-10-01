import { hashPassword, verifyPassword, checkPasswordStrength } from "@/lib/auth/password";

describe("Password Utilities", () => {
  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should create different hashes for the same password", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword("wrongPassword", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("checkPasswordStrength", () => {
    it("should return weak score for short password", () => {
      const result = checkPasswordStrength("abc");
      expect(result.score).toBeLessThan(2);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it("should return strong score for complex password", () => {
      const result = checkPasswordStrength("Complex123!@#");
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it("should provide feedback for missing requirements", () => {
      const result = checkPasswordStrength("alllowercase");
      expect(result.feedback).toContain("大文字を含めてください");
      expect(result.feedback).toContain("数字を含めてください");
    });

    it("should have no feedback for strong password", () => {
      const result = checkPasswordStrength("StrongPass123!");
      expect(result.feedback.length).toBe(0);
    });
  });
});
