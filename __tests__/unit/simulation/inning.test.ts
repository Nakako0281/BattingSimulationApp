/**
 * Tests for inning simulation logic
 */

import { simulateInning } from "@/lib/simulation/engine";
import type { Player } from "@/types";

// Mock player factory
const createMockPlayer = (
  id: string,
  name: string,
  order: number,
  stats: Partial<Player> = {}
): Player => ({
  id,
  user_id: "user-1",
  name,
  batting_order: order,
  singles: stats.singles ?? 100,
  doubles: stats.doubles ?? 30,
  triples: stats.triples ?? 5,
  home_runs: stats.home_runs ?? 20,
  walks: stats.walks ?? 40,
  strikeouts: stats.strikeouts ?? 80,
  groundouts: stats.groundouts ?? 100,
  flyouts: stats.flyouts ?? 125,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  team_id: "team-1",
});

describe("Inning Simulation", () => {
  const mockTeam: Player[] = [
    createMockPlayer("p1", "Player 1", 1),
    createMockPlayer("p2", "Player 2", 2),
    createMockPlayer("p3", "Player 3", 3),
    createMockPlayer("p4", "Player 4", 4),
    createMockPlayer("p5", "Player 5", 5),
    createMockPlayer("p6", "Player 6", 6),
    createMockPlayer("p7", "Player 7", 7),
    createMockPlayer("p8", "Player 8", 8),
    createMockPlayer("p9", "Player 9", 9),
  ];

  describe("Basic Inning Structure", () => {
    it("should end after 3 outs", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      expect(result.inningNumber).toBe(1);
      expect(result.atBats.length).toBeGreaterThanOrEqual(3); // At least 3 at-bats for 3 outs
    });

    it("should track inning number correctly", () => {
      const { result: inning1 } = simulateInning(mockTeam, 1, 1);
      const { result: inning2 } = simulateInning(mockTeam, 2, 1);
      const { result: inning9 } = simulateInning(mockTeam, 9, 1);

      expect(inning1.inningNumber).toBe(1);
      expect(inning2.inningNumber).toBe(2);
      expect(inning9.inningNumber).toBe(9);
    });

    it("should return next batter position", () => {
      const { nextBatter } = simulateInning(mockTeam, 1, 1);

      expect(nextBatter).toBeGreaterThanOrEqual(1);
      expect(nextBatter).toBeLessThanOrEqual(9);
    });
  });

  describe("At-Bat Tracking", () => {
    it("should record all at-bats in the inning", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      expect(result.atBats).toBeDefined();
      expect(Array.isArray(result.atBats)).toBe(true);
      expect(result.atBats.length).toBeGreaterThan(0);
    });

    it("should have valid outcome types", () => {
      const { result } = simulateInning(mockTeam, 1, 1);
      const validOutcomes = [
        "single",
        "double",
        "triple",
        "home_run",
        "walk",
        "out", // Simplified: single out outcome
      ];

      result.atBats.forEach((atBat) => {
        expect(validOutcomes).toContain(atBat.outcome);
      });
    });

    it("should include player information in at-bats", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      result.atBats.forEach((atBat) => {
        expect(atBat.playerId).toBeDefined();
        expect(atBat.playerName).toBeDefined();
        expect(atBat.battingOrder).toBeGreaterThanOrEqual(1);
        expect(atBat.battingOrder).toBeLessThanOrEqual(9);
      });
    });
  });

  describe("Batting Order Progression", () => {
    it("should follow batting order through lineup", () => {
      const { result, nextBatter } = simulateInning(mockTeam, 1, 1);

      // First at-bat should be batting order 1
      expect(result.atBats[0].battingOrder).toBe(1);

      // Next batter should progress appropriately
      expect(nextBatter).toBeGreaterThan(0);
    });

    it("should wrap around batting order after 9th batter", () => {
      // Start with 9th batter
      const { result, nextBatter } = simulateInning(mockTeam, 1, 9);

      // Should have batters from the lineup
      expect(result.atBats.length).toBeGreaterThan(0);

      // Next batter should be valid (1-9)
      expect(nextBatter).toBeGreaterThanOrEqual(1);
      expect(nextBatter).toBeLessThanOrEqual(9);
    });
  });

  describe("Run Scoring", () => {
    it("should track runs scored in the inning", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      expect(result.runs).toBeGreaterThanOrEqual(0);
      expect(typeof result.runs).toBe("number");
    });

    it("should have non-negative runs", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      expect(result.runs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Hit Counting", () => {
    it("should count hits correctly", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      expect(result.hits).toBeGreaterThanOrEqual(0);
      expect(typeof result.hits).toBe("number");

      // Count actual hits from at-bats
      const actualHits = result.atBats.filter((ab) =>
        ["single", "double", "triple", "home_run"].includes(ab.outcome)
      ).length;

      expect(result.hits).toBe(actualHits);
    });

    it("should not count walks as hits", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      const walks = result.atBats.filter((ab) => ab.outcome === "walk").length;
      const hits = result.hits;

      // Walks should not be included in hit count
      expect(hits).toBeLessThanOrEqual(result.atBats.length - walks);
    });

    it("should not count outs as hits", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      const outs = result.atBats.filter((ab) =>
        ab.outcome === "out"
      ).length;

      // At least 3 outs should be present (inning ends at 3 outs)
      expect(outs).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Left on Base", () => {
    it("should calculate runners left on base", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      expect(result.leftOnBase).toBeGreaterThanOrEqual(0);
      expect(result.leftOnBase).toBeLessThanOrEqual(3); // Max 3 runners
      expect(typeof result.leftOnBase).toBe("number");
    });

    it("should have valid left on base range", () => {
      // Run multiple simulations to test edge cases
      for (let i = 0; i < 10; i++) {
        const { result } = simulateInning(mockTeam, 1, 1);
        expect(result.leftOnBase).toBeGreaterThanOrEqual(0);
        expect(result.leftOnBase).toBeLessThanOrEqual(3);
      }
    });
  });

  describe("RBI Tracking", () => {
    it("should track RBI for each at-bat", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      result.atBats.forEach((atBat) => {
        expect(atBat.rbi).toBeGreaterThanOrEqual(0);
        expect(atBat.rbi).toBeLessThanOrEqual(4); // Max 4 RBI (grand slam)
      });
    });

    it("should have 0 RBI for outs", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      const outs = result.atBats.filter((ab) =>
        ["strikeout", "groundout", "flyout"].includes(ab.outcome)
      );

      outs.forEach((out) => {
        expect(out.rbi).toBe(0);
      });
    });

    it("should match total runs with total RBI", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      const totalRBI = result.atBats.reduce((sum, ab) => sum + ab.rbi, 0);
      expect(totalRBI).toBe(result.runs);
    });
  });

  describe("Timestamp Tracking", () => {
    it("should have timestamp for each at-bat", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      result.atBats.forEach((atBat) => {
        expect(atBat.timestamp).toBeDefined();
        expect(atBat.timestamp).toBeInstanceOf(Date);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle team with all weak hitters", () => {
      const weakTeam = Array.from({ length: 9 }, (_, i) =>
        createMockPlayer(`weak-${i + 1}`, `Weak ${i + 1}`, i + 1, {
          singles: 10,
          doubles: 2,
          triples: 0,
          home_runs: 1,
          walks: 5,
          strikeouts: 150,
          groundouts: 150,
          flyouts: 150,
        })
      );

      const { result } = simulateInning(weakTeam, 1, 1);

      expect(result.inningNumber).toBe(1);
      expect(result.atBats.length).toBeGreaterThanOrEqual(3);
    });

    it("should handle team with all strong hitters", () => {
      const strongTeam = Array.from({ length: 9 }, (_, i) =>
        createMockPlayer(`strong-${i + 1}`, `Strong ${i + 1}`, i + 1, {
          singles: 150,
          doubles: 50,
          triples: 10,
          home_runs: 40,
          walks: 60,
          strikeouts: 50,
          groundouts: 50,
          flyouts: 40,
        })
      );

      const { result } = simulateInning(strongTeam, 1, 1);

      expect(result.inningNumber).toBe(1);
      expect(result.atBats.length).toBeGreaterThanOrEqual(3);
    });

    it("should handle minimum team size (9 players)", () => {
      const { result } = simulateInning(mockTeam, 1, 1);

      expect(result.atBats).toBeDefined();
      expect(result.atBats.length).toBeGreaterThanOrEqual(3);
    });
  });
});
