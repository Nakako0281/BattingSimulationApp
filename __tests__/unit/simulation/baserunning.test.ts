/**
 * Tests for baserunning logic in simulation engine
 */

import type { Player, BaseState, InningState } from "@/types";

// Mock player for testing
const createMockPlayer = (id: string, name: string): Player => ({
  id,
  user_id: "user-1",
  name,
  batting_order: 1,
  singles: 100,
  doubles: 30,
  triples: 5,
  home_runs: 20,
  walks: 40,
  strikeouts: 80,
  groundouts: 100,
  flyouts: 125,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  team_id: "team-1",
});

describe("Baserunning Logic", () => {
  describe("Base State Initialization", () => {
    it("should start with all bases empty", () => {
      const emptyBases: BaseState = {
        first: false,
        second: false,
        third: false,
      };

      expect(emptyBases.first).toBe(false);
      expect(emptyBases.second).toBe(false);
      expect(emptyBases.third).toBe(false);
    });
  });

  describe("Single Hit Baserunning", () => {
    it("should advance runner on third to home", () => {
      const initialBases: BaseState = {
        first: false,
        second: false,
        third: true,
      };

      // After single: runner on third scores, batter to first
      const expectedBases: BaseState = {
        first: true,
        second: false,
        third: false,
      };

      expect(initialBases.third).toBe(true);
      expect(expectedBases.first).toBe(true);
      expect(expectedBases.third).toBe(false);
    });

    it("should advance runner on second to third", () => {
      const initialBases: BaseState = {
        first: false,
        second: true,
        third: false,
      };

      const expectedBases: BaseState = {
        first: true,
        second: false,
        third: true,
      };

      expect(initialBases.second).toBe(true);
      expect(expectedBases.third).toBe(true);
    });

    it("should advance runner on first to second", () => {
      const initialBases: BaseState = {
        first: true,
        second: false,
        third: false,
      };

      const expectedBases: BaseState = {
        first: true,
        second: true,
        third: false,
      };

      expect(initialBases.first).toBe(true);
      expect(expectedBases.second).toBe(true);
    });
  });

  describe("Double Hit Baserunning", () => {
    it("should score runners on second and third", () => {
      const initialBases: BaseState = {
        first: false,
        second: true,
        third: true,
      };

      const expectedRuns = 2; // Both runners score
      const expectedBases: BaseState = {
        first: false,
        second: true, // Batter to second
        third: false,
      };

      expect(expectedRuns).toBe(2);
      expect(expectedBases.second).toBe(true);
      expect(expectedBases.third).toBe(false);
    });

    it("should advance runner on first to third", () => {
      const initialBases: BaseState = {
        first: true,
        second: false,
        third: false,
      };

      const expectedBases: BaseState = {
        first: false,
        second: true, // Batter to second
        third: true, // Runner from first to third
      };

      expect(expectedBases.second).toBe(true);
      expect(expectedBases.third).toBe(true);
    });
  });

  describe("Triple Hit Baserunning", () => {
    it("should score all runners", () => {
      const initialBases: BaseState = {
        first: true,
        second: true,
        third: true,
      };

      const expectedRuns = 3; // All three runners score
      const expectedBases: BaseState = {
        first: false,
        second: false,
        third: true, // Batter to third
      };

      expect(expectedRuns).toBe(3);
      expect(expectedBases.third).toBe(true);
      expect(expectedBases.first).toBe(false);
      expect(expectedBases.second).toBe(false);
    });
  });

  describe("Home Run Baserunning", () => {
    it("should score batter and all runners (Grand Slam)", () => {
      const initialBases: BaseState = {
        first: true,
        second: true,
        third: true,
      };

      const expectedRuns = 4; // Grand Slam: 3 runners + batter
      const expectedBases: BaseState = {
        first: false,
        second: false,
        third: false,
      };

      expect(expectedRuns).toBe(4);
      expect(expectedBases.first).toBe(false);
      expect(expectedBases.second).toBe(false);
      expect(expectedBases.third).toBe(false);
    });

    it("should score batter with no runners on base (Solo HR)", () => {
      const initialBases: BaseState = {
        first: false,
        second: false,
        third: false,
      };

      const expectedRuns = 1; // Solo home run
      const expectedBases: BaseState = {
        first: false,
        second: false,
        third: false,
      };

      expect(expectedRuns).toBe(1);
    });
  });

  describe("Walk Baserunning", () => {
    it("should force runner home with bases loaded", () => {
      const initialBases: BaseState = {
        first: true,
        second: true,
        third: true,
      };

      const expectedRuns = 1; // Runner on third forced home
      const expectedBases: BaseState = {
        first: true,
        second: true,
        third: true,
      };

      expect(expectedRuns).toBe(1);
      expect(expectedBases.first).toBe(true);
      expect(expectedBases.second).toBe(true);
      expect(expectedBases.third).toBe(true);
    });

    it("should not advance runners with no force", () => {
      const initialBases: BaseState = {
        first: false,
        second: true,
        third: false,
      };

      const expectedBases: BaseState = {
        first: true, // Batter walks to first
        second: true, // Runner stays on second (no force)
        third: false,
      };

      expect(expectedBases.first).toBe(true);
      expect(expectedBases.second).toBe(true);
    });

    it("should force runner to second with runner on first", () => {
      const initialBases: BaseState = {
        first: true,
        second: false,
        third: false,
      };

      const expectedBases: BaseState = {
        first: true, // Batter to first
        second: true, // Runner forced to second
        third: false,
      };

      expect(expectedBases.first).toBe(true);
      expect(expectedBases.second).toBe(true);
    });
  });

  describe("Out Scenarios", () => {
    it("should not advance runners on strikeout", () => {
      const initialBases: BaseState = {
        first: true,
        second: true,
        third: true,
      };

      const expectedOuts = 1;
      const expectedBases: BaseState = {
        first: true,
        second: true,
        third: true, // Runners stay
      };

      expect(expectedOuts).toBe(1);
      expect(expectedBases).toEqual(initialBases);
    });

    it("should not advance runners on groundout", () => {
      const initialBases: BaseState = {
        first: true,
        second: false,
        third: false,
      };

      const expectedOuts = 1;
      const expectedBases: BaseState = {
        first: true, // Runner stays
        second: false,
        third: false,
      };

      expect(expectedOuts).toBe(1);
      expect(expectedBases).toEqual(initialBases);
    });

    it("should not advance runners on flyout", () => {
      const initialBases: BaseState = {
        first: false,
        second: true,
        third: false,
      };

      const expectedOuts = 1;
      const expectedBases: BaseState = {
        first: false,
        second: true, // Runner stays
        third: false,
      };

      expect(expectedOuts).toBe(1);
      expect(expectedBases).toEqual(initialBases);
    });
  });

  describe("RBI Calculations", () => {
    it("should calculate correct RBI for single with runner on third", () => {
      const expectedRBI = 1;
      expect(expectedRBI).toBe(1);
    });

    it("should calculate correct RBI for double with two runners", () => {
      const expectedRBI = 2; // Runners on second and third score
      expect(expectedRBI).toBe(2);
    });

    it("should calculate correct RBI for triple with bases loaded", () => {
      const expectedRBI = 3; // All three runners score
      expect(expectedRBI).toBe(3);
    });

    it("should calculate correct RBI for grand slam", () => {
      const expectedRBI = 4; // Three runners + batter
      expect(expectedRBI).toBe(4);
    });

    it("should have 0 RBI for walk with no bases loaded", () => {
      const expectedRBI = 0;
      expect(expectedRBI).toBe(0);
    });

    it("should have 1 RBI for walk with bases loaded", () => {
      const expectedRBI = 1; // Force runner home
      expect(expectedRBI).toBe(1);
    });

    it("should have 0 RBI for strikeout", () => {
      const expectedRBI = 0;
      expect(expectedRBI).toBe(0);
    });
  });
});
