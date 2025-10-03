/**
 * Tests for validation schemas
 */

import {
  loginSchema,
  registerSchema,
  createTeamSchema,
  createPlayerSchema,
  updatePlayerSchema,
} from "@/lib/utils/validation";

describe("Validation Schemas", () => {
  describe("Login Schema", () => {
    it("should accept valid login data", () => {
      const validData = {
        nickname: "testuser",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject nickname shorter than 3 characters", () => {
      const invalidData = {
        nickname: "ab",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("3文字以上");
      }
    });

    it("should reject nickname longer than 50 characters", () => {
      const invalidData = {
        nickname: "a".repeat(51),
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("50文字以下");
      }
    });

    it("should reject nickname with invalid characters", () => {
      const invalidData = {
        nickname: "test@user",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("英数字");
      }
    });

    it("should accept nickname with allowed special characters", () => {
      const validData = {
        nickname: "test_user-123",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject password shorter than 8 characters", () => {
      const invalidData = {
        nickname: "testuser",
        password: "pass",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("8文字以上");
      }
    });

    it("should reject password longer than 100 characters", () => {
      const invalidData = {
        nickname: "testuser",
        password: "p".repeat(101),
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("100文字以下");
      }
    });
  });

  describe("Register Schema", () => {
    it("should accept valid registration data", () => {
      const validData = {
        nickname: "newuser",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject when passwords don't match", () => {
      const invalidData = {
        nickname: "newuser",
        password: "password123",
        confirmPassword: "different",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("一致しません");
      }
    });

    it("should apply same nickname rules as login", () => {
      const invalidData = {
        nickname: "ab",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Create Team Schema", () => {
    it("should accept valid team name", () => {
      const validData = {
        name: "Test Team",
      };

      const result = createTeamSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty team name", () => {
      const invalidData = {
        name: "",
      };

      const result = createTeamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("必須");
      }
    });

    it("should reject team name longer than 100 characters", () => {
      const invalidData = {
        name: "T".repeat(101),
      };

      const result = createTeamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("100文字以下");
      }
    });
  });

  describe("Create Player Schema", () => {
    const validPlayerData = {
      team_id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test Player",
      batting_order: 1,
      singles: 100,
      doubles: 30,
      triples: 5,
      home_runs: 20,
      walks: 40,
      strikeouts: 80,
      groundouts: 100,
      flyouts: 125,
      at_bats: 500,
    };

    it("should accept valid player data", () => {
      const result = createPlayerSchema.safeParse(validPlayerData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID for team_id", () => {
      const invalidData = {
        ...validPlayerData,
        team_id: "invalid-uuid",
      };

      const result = createPlayerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty player name", () => {
      const invalidData = {
        ...validPlayerData,
        name: "",
      };

      const result = createPlayerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("必須");
      }
    });

    it("should reject batting order less than 1", () => {
      const invalidData = {
        ...validPlayerData,
        batting_order: 0,
      };

      const result = createPlayerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("1以上");
      }
    });

    it("should reject batting order greater than 9", () => {
      const invalidData = {
        ...validPlayerData,
        batting_order: 10,
      };

      const result = createPlayerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("9以下");
      }
    });

    it("should reject negative stat values", () => {
      const invalidData = {
        ...validPlayerData,
        singles: -10,
      };

      const result = createPlayerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("0以上");
      }
    });

    it("should reject when hits exceed at-bats", () => {
      const invalidData = {
        ...validPlayerData,
        singles: 200,
        doubles: 100,
        triples: 50,
        home_runs: 100,
        at_bats: 400, // Total hits = 450 > 400 at-bats
      };

      const result = createPlayerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("安打数が打数を超える");
      }
    });

    it("should accept when hits equal at-bats", () => {
      const validData = {
        ...validPlayerData,
        singles: 100,
        doubles: 30,
        triples: 5,
        home_runs: 20,
        at_bats: 155, // Total hits = 155
      };

      const result = createPlayerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept default values for stats", () => {
      const minimalData = {
        team_id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Minimal Player",
        batting_order: 1,
      };

      const result = createPlayerSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.singles).toBe(0);
        expect(result.data.doubles).toBe(0);
        expect(result.data.at_bats).toBe(0);
      }
    });

    it("should reject non-integer stat values", () => {
      const invalidData = {
        ...validPlayerData,
        singles: 100.5,
      };

      const result = createPlayerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Update Player Schema", () => {
    it("should accept partial updates", () => {
      const validData = {
        name: "Updated Name",
      };

      const result = updatePlayerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept batting order update", () => {
      const validData = {
        batting_order: 5,
      };

      const result = updatePlayerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid batting order", () => {
      const invalidData = {
        batting_order: 10,
      };

      const result = updatePlayerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("9以下");
      }
    });

    it("should accept multiple stat updates", () => {
      const validData = {
        singles: 120,
        doubles: 35,
        home_runs: 25,
      };

      const result = updatePlayerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject negative stat values", () => {
      const invalidData = {
        singles: -5,
      };

      const result = updatePlayerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Check that the error is related to negative values (message may vary by locale)
        expect(result.error.issues[0].path).toContain("singles");
      }
    });

    it("should accept empty update object", () => {
      const validData = {};

      const result = updatePlayerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
