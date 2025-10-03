import {
  calculatePlayerProbabilities,
  determineOutcome,
  calculateTeamProbabilities,
} from "@/lib/simulation/probability";
import type { Player, PlayerProbabilities } from "@/types";

describe("Probability Calculations", () => {
  const mockPlayer: Player = {
    id: "player-1",
    user_id: "user-1",
    name: "Test Player",
    batting_order: 1,
    singles: 100,
    doubles: 30,
    triples: 5,
    home_runs: 20,
    walks: 40,
    at_bats: 500, // Total at bats
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    team_id: "team-1",
  };

  describe("calculatePlayerProbabilities", () => {
    it("should calculate correct probabilities for player with statistics", () => {
      const probabilities = calculatePlayerProbabilities(mockPlayer);

      // Total outcomes: hits (155) + walks (40) + outs (345) = 540
      // Outs = at_bats (500) - hits (155) = 345
      expect(probabilities.playerId).toBe(mockPlayer.id);
      expect(probabilities.single).toBeCloseTo(100 / 540, 2);
      expect(probabilities.double).toBeCloseTo(30 / 540, 2);
      expect(probabilities.triple).toBeCloseTo(5 / 540, 2);
      expect(probabilities.homeRun).toBeCloseTo(20 / 540, 2);
      expect(probabilities.walk).toBeCloseTo(40 / 540, 2);
      expect(probabilities.out).toBeCloseTo(345 / 540, 2); // Single out probability
    });

    it("should return default probabilities for player with no statistics", () => {
      const emptyPlayer: Player = {
        ...mockPlayer,
        singles: 0,
        doubles: 0,
        triples: 0,
        home_runs: 0,
        walks: 0,
        at_bats: 0,
      };

      const probabilities = calculatePlayerProbabilities(emptyPlayer);

      expect(probabilities.single).toBe(0.15);
      expect(probabilities.double).toBe(0.05);
      expect(probabilities.triple).toBe(0.01);
      expect(probabilities.homeRun).toBe(0.03);
      expect(probabilities.walk).toBe(0.08);
      expect(probabilities.out).toBe(0.68); // Combined out probability
    });

    it("should have probabilities sum to approximately 1", () => {
      const probabilities = calculatePlayerProbabilities(mockPlayer);
      const sum =
        probabilities.single +
        probabilities.double +
        probabilities.triple +
        probabilities.homeRun +
        probabilities.walk +
        probabilities.out;

      expect(sum).toBeCloseTo(1, 2);
    });
  });

  describe("determineOutcome", () => {
    const testProbabilities: PlayerProbabilities = {
      playerId: "test",
      single: 0.2,
      double: 0.1,
      triple: 0.05,
      homeRun: 0.05,
      walk: 0.1,
      out: 0.5, // Simplified single out probability
    };

    it("should return single for random value in single range", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.1); // Within single range (0-0.2)
      const outcome = determineOutcome(testProbabilities);
      expect(outcome).toBe("single");
    });

    it("should return double for random value in double range", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.25); // Within double range (0.2-0.3)
      const outcome = determineOutcome(testProbabilities);
      expect(outcome).toBe("double");
    });

    it("should return home_run for random value in home run range", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.37); // Within home run range (0.35-0.4)
      const outcome = determineOutcome(testProbabilities);
      expect(outcome).toBe("home_run");
    });

    it("should return walk for random value in walk range", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.45); // Within walk range (0.4-0.5)
      const outcome = determineOutcome(testProbabilities);
      expect(outcome).toBe("walk");
    });

    it("should return out for random value in out range", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.65); // Within out range (0.5-1.0)
      const outcome = determineOutcome(testProbabilities);
      expect(outcome).toBe("out");
    });

    it("should return out for random value at end of range", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.95); // Within out range (0.5-1.0)
      const outcome = determineOutcome(testProbabilities);
      expect(outcome).toBe("out");
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });
  });

  describe("calculateTeamProbabilities", () => {
    const mockPlayers: Player[] = [
      {
        ...mockPlayer,
        id: "player-1",
        singles: 100,
        doubles: 30,
        triples: 5,
        home_runs: 20,
        walks: 40,
        at_bats: 500,
      },
      {
        ...mockPlayer,
        id: "player-2",
        singles: 120,
        doubles: 25,
        triples: 3,
        home_runs: 15,
        walks: 50,
        at_bats: 550,
      },
    ];

    it("should calculate average probabilities for team", () => {
      const teamProbs = calculateTeamProbabilities(mockPlayers);

      expect(teamProbs.playerId).toBe("team-average");
      expect(teamProbs.single).toBeGreaterThan(0);
      expect(teamProbs.double).toBeGreaterThan(0);
      expect(teamProbs.homeRun).toBeGreaterThan(0);
    });

    it("should throw error for empty team", () => {
      expect(() => calculateTeamProbabilities([])).toThrow(
        "Cannot calculate probabilities for empty team"
      );
    });

    it("should have team probabilities sum to approximately 1", () => {
      const teamProbs = calculateTeamProbabilities(mockPlayers);
      const sum =
        teamProbs.single +
        teamProbs.double +
        teamProbs.triple +
        teamProbs.homeRun +
        teamProbs.walk +
        teamProbs.out;

      expect(sum).toBeCloseTo(1, 2);
    });

    it("should calculate average for single player team", () => {
      const singlePlayerTeam = [mockPlayers[0]];
      const teamProbs = calculateTeamProbabilities(singlePlayerTeam);
      const playerProbs = calculatePlayerProbabilities(mockPlayers[0]);

      expect(teamProbs.single).toBeCloseTo(playerProbs.single, 5);
      expect(teamProbs.double).toBeCloseTo(playerProbs.double, 5);
      expect(teamProbs.homeRun).toBeCloseTo(playerProbs.homeRun, 5);
    });
  });
});
