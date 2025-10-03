/**
 * Tests for statistics calculation in simulation
 */

import { simulateGame, simulateMatch } from "@/lib/simulation/engine";
import type { Player, Team } from "@/types";

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

const createMockTeam = (id: string, name: string): Team => ({
  id,
  user_id: "user-1",
  name,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe("Statistics Calculations", () => {
  const mockPlayers: Player[] = Array.from({ length: 9 }, (_, i) =>
    createMockPlayer(`player-${i + 1}`, `Player ${i + 1}`, i + 1)
  );

  describe("Game Statistics", () => {
    it("should calculate total runs correctly", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      expect(gameResult.totalRuns).toBeGreaterThanOrEqual(0);
      expect(typeof gameResult.totalRuns).toBe("number");

      // Total runs should match sum of inning runs
      const calculatedTotal = gameResult.innings.reduce(
        (sum, inning) => sum + inning.runs,
        0
      );
      expect(gameResult.totalRuns).toBe(calculatedTotal);
    });

    it("should calculate total hits correctly", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      expect(gameResult.totalHits).toBeGreaterThanOrEqual(0);
      expect(typeof gameResult.totalHits).toBe("number");

      // Total hits should match sum of inning hits
      const calculatedTotal = gameResult.innings.reduce(
        (sum, inning) => sum + inning.hits,
        0
      );
      expect(gameResult.totalHits).toBe(calculatedTotal);
    });

    it("should have correct number of innings", () => {
      const game9 = simulateGame("team-1", "Test Team", mockPlayers, 9);
      const game5 = simulateGame("team-1", "Test Team", mockPlayers, 5);

      expect(game9.innings.length).toBe(9);
      expect(game5.innings.length).toBe(5);
    });
  });

  describe("Player Statistics", () => {
    it("should calculate player stats for all players", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      expect(gameResult.playerStats).toBeDefined();
      expect(Array.isArray(gameResult.playerStats)).toBe(true);
      expect(gameResult.playerStats.length).toBeGreaterThan(0);
      expect(gameResult.playerStats.length).toBeLessThanOrEqual(9);
    });

    it("should calculate batting average correctly", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      gameResult.playerStats.forEach((stats) => {
        if (stats.atBats > 0) {
          const expectedBA = stats.hits / stats.atBats;
          expect(stats.battingAverage).toBeCloseTo(expectedBA, 5);
        } else {
          expect(stats.battingAverage).toBe(0);
        }

        // Batting average should be between 0 and 1
        expect(stats.battingAverage).toBeGreaterThanOrEqual(0);
        expect(stats.battingAverage).toBeLessThanOrEqual(1);
      });
    });

    it("should track at-bats correctly (excluding walks)", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      gameResult.playerStats.forEach((stats) => {
        // At-bats should not include walks
        expect(stats.atBats).toBeGreaterThanOrEqual(0);

        // Hits should not exceed at-bats
        expect(stats.hits).toBeLessThanOrEqual(stats.atBats);
      });
    });

    it("should count individual hit types correctly", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      gameResult.playerStats.forEach((stats) => {
        // Total hits should equal sum of individual hit types
        const totalHits = stats.singles + stats.doubles + stats.triples + stats.homeRuns;
        expect(stats.hits).toBe(totalHits);
      });
    });

    it("should track walks separately from at-bats", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      gameResult.playerStats.forEach((stats) => {
        expect(stats.walks).toBeGreaterThanOrEqual(0);
        expect(typeof stats.walks).toBe("number");
      });
    });

    it("should track strikeouts correctly", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      gameResult.playerStats.forEach((stats) => {
        expect(stats.strikeouts).toBeGreaterThanOrEqual(0);
        expect(typeof stats.strikeouts).toBe("number");
      });
    });

    it("should track RBI correctly", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      gameResult.playerStats.forEach((stats) => {
        expect(stats.rbi).toBeGreaterThanOrEqual(0);
        expect(typeof stats.rbi).toBe("number");
      });

      // Total RBI should equal total runs
      const totalRBI = gameResult.playerStats.reduce((sum, s) => sum + s.rbi, 0);
      expect(totalRBI).toBe(gameResult.totalRuns);
    });

    it("should track home runs and runs scored", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      gameResult.playerStats.forEach((stats) => {
        // Runs should at least equal home runs (batter scores on HR)
        expect(stats.runs).toBeGreaterThanOrEqual(stats.homeRuns);
      });
    });

    it("should include player identification info", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 9);

      gameResult.playerStats.forEach((stats) => {
        expect(stats.playerId).toBeDefined();
        expect(stats.playerName).toBeDefined();
        expect(stats.battingOrder).toBeGreaterThanOrEqual(1);
        expect(stats.battingOrder).toBeLessThanOrEqual(9);
      });
    });
  });

  describe("Match Statistics", () => {
    const homeTeam = createMockTeam("home-1", "Home Team");
    const awayTeam = createMockTeam("away-1", "Away Team");
    const homePlayers = mockPlayers;
    const awayPlayers = Array.from({ length: 9 }, (_, i) =>
      createMockPlayer(`away-${i + 1}`, `Away ${i + 1}`, i + 1)
    );

    it("should calculate winner correctly", () => {
      const matchResult = simulateMatch(
        homeTeam,
        homePlayers,
        awayTeam,
        awayPlayers,
        9
      );

      expect(matchResult.winner).toBeDefined();
      expect(["home", "away", "tie"]).toContain(matchResult.winner);
    });

    it("should determine home team wins correctly", () => {
      const matchResult = simulateMatch(
        homeTeam,
        homePlayers,
        awayTeam,
        awayPlayers,
        9
      );

      if (matchResult.winner === "home") {
        expect(matchResult.finalScore.home).toBeGreaterThan(
          matchResult.finalScore.away
        );
        expect(matchResult.homeTeam.totalRuns).toBeGreaterThan(
          matchResult.awayTeam.totalRuns
        );
      }
    });

    it("should determine away team wins correctly", () => {
      const matchResult = simulateMatch(
        homeTeam,
        homePlayers,
        awayTeam,
        awayPlayers,
        9
      );

      if (matchResult.winner === "away") {
        expect(matchResult.finalScore.away).toBeGreaterThan(
          matchResult.finalScore.home
        );
        expect(matchResult.awayTeam.totalRuns).toBeGreaterThan(
          matchResult.homeTeam.totalRuns
        );
      }
    });

    it("should determine ties correctly", () => {
      const matchResult = simulateMatch(
        homeTeam,
        homePlayers,
        awayTeam,
        awayPlayers,
        9
      );

      if (matchResult.winner === "tie") {
        expect(matchResult.finalScore.home).toBe(matchResult.finalScore.away);
        expect(matchResult.homeTeam.totalRuns).toBe(matchResult.awayTeam.totalRuns);
      }
    });

    it("should have final score match game results", () => {
      const matchResult = simulateMatch(
        homeTeam,
        homePlayers,
        awayTeam,
        awayPlayers,
        9
      );

      expect(matchResult.finalScore.home).toBe(matchResult.homeTeam.totalRuns);
      expect(matchResult.finalScore.away).toBe(matchResult.awayTeam.totalRuns);
    });

    it("should include both team game results", () => {
      const matchResult = simulateMatch(
        homeTeam,
        homePlayers,
        awayTeam,
        awayPlayers,
        9
      );

      expect(matchResult.homeTeam).toBeDefined();
      expect(matchResult.awayTeam).toBeDefined();
      expect(matchResult.homeTeam.teamId).toBe(homeTeam.id);
      expect(matchResult.awayTeam.teamId).toBe(awayTeam.id);
    });

    it("should have correct number of innings for both teams", () => {
      const matchResult = simulateMatch(
        homeTeam,
        homePlayers,
        awayTeam,
        awayPlayers,
        5
      );

      expect(matchResult.innings).toBe(5);
      expect(matchResult.homeTeam.innings.length).toBe(5);
      expect(matchResult.awayTeam.innings.length).toBe(5);
    });
  });

  describe("Edge Cases", () => {
    it("should throw error for game with no players", () => {
      expect(() => {
        simulateGame("team-1", "Empty Team", [], 9);
      }).toThrow("Cannot simulate game with no players");
    });

    it("should handle minimum inning count", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 1);

      expect(gameResult.innings.length).toBe(1);
      expect(gameResult.totalRuns).toBeGreaterThanOrEqual(0);
    });

    it("should handle extended innings", () => {
      const gameResult = simulateGame("team-1", "Test Team", mockPlayers, 15);

      expect(gameResult.innings.length).toBe(15);
    });

    it("should handle players with zero stats", () => {
      const zeroStatPlayers = Array.from({ length: 9 }, (_, i) =>
        createMockPlayer(`zero-${i + 1}`, `Zero ${i + 1}`, i + 1, {
          singles: 0,
          doubles: 0,
          triples: 0,
          home_runs: 0,
          walks: 0,
          strikeouts: 0,
          groundouts: 0,
          flyouts: 0,
        })
      );

      const gameResult = simulateGame(
        "team-1",
        "Zero Stat Team",
        zeroStatPlayers,
        9
      );

      expect(gameResult).toBeDefined();
      expect(gameResult.innings.length).toBe(9);
    });
  });
});
