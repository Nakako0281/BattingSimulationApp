/**
 * Season simulation engine
 */

import type { Player, SeasonResult, SeasonStats, PlayerSeasonStats } from "@/types";
import { simulateGame } from "./engine";
import { calculateBattingAverage, calculateOnBasePercentage, calculateSluggingPercentage, calculateOPS } from "../utils/stats";

/**
 * Simulate a complete season (multiple games)
 */
export function simulateSeason(
  teamId: string,
  teamName: string,
  players: Player[],
  numberOfGames: number,
  innings: number = 9
): SeasonResult {
  if (players.length === 0) {
    throw new Error("Cannot simulate season with no players");
  }

  if (numberOfGames < 1 || numberOfGames > 162) {
    throw new Error("Number of games must be between 1 and 162");
  }

  const games = [];

  // Simulate each game
  for (let i = 0; i < numberOfGames; i++) {
    const gameResult = simulateGame(teamId, teamName, players, innings);
    games.push(gameResult);
  }

  // Aggregate season statistics
  const seasonStats = aggregateSeasonStats(games, players);

  return {
    teamId,
    teamName,
    games,
    seasonStats,
  };
}

/**
 * Aggregate statistics across all games in a season
 */
function aggregateSeasonStats(games: any[], players: Player[]): SeasonStats {
  const totalRuns = games.reduce((sum, game) => sum + game.totalRuns, 0);
  const totalHits = games.reduce((sum, game) => sum + game.totalHits, 0);
  const totalAtBats = games.reduce((sum, game) => {
    return sum + game.playerStats.reduce((atBatSum: number, player: any) => atBatSum + player.atBats, 0);
  }, 0);

  // Initialize player season stats
  const playerStatsMap = new Map<string, any>();

  players.forEach((player) => {
    playerStatsMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      games: 0,
      atBats: 0,
      hits: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      runs: 0,
      rbi: 0,
      walks: 0,
      strikeouts: 0,
    });
  });

  // Aggregate stats from all games
  games.forEach((game) => {
    game.innings.forEach((inning: any) => {
      inning.atBats.forEach((atBat: any) => {
        const stats = playerStatsMap.get(atBat.playerId);
        if (!stats) return;

        // Count games played (once per game)
        if (stats.lastGameProcessed !== game) {
          stats.games = (stats.games || 0) + 1;
          stats.lastGameProcessed = game;
        }

        // Count at-bats (walks don't count)
        if (atBat.outcome !== "walk") {
          stats.atBats++;
        }

        // Count outcomes
        switch (atBat.outcome) {
          case "single":
            stats.hits++;
            stats.singles++;
            break;
          case "double":
            stats.hits++;
            stats.doubles++;
            break;
          case "triple":
            stats.hits++;
            stats.triples++;
            break;
          case "home_run":
            stats.hits++;
            stats.homeRuns++;
            stats.runs++; // Batter scores on home run
            break;
          case "walk":
            stats.walks++;
            break;
          case "strikeout":
            stats.strikeouts++;
            break;
        }

        // Count RBIs
        stats.rbi += atBat.rbi;
      });
    });
  });

  // Calculate advanced stats for each player
  const playerSeasonStats: PlayerSeasonStats[] = Array.from(playerStatsMap.values())
    .map((stats) => {
      // Remove temporary field
      delete stats.lastGameProcessed;

      const battingAverage = calculateBattingAverage(stats.hits, stats.atBats);
      const onBasePercentage = calculateOnBasePercentage(
        stats.hits,
        stats.walks,
        stats.atBats
      );
      const sluggingPercentage = calculateSluggingPercentage(
        stats.singles,
        stats.doubles,
        stats.triples,
        stats.homeRuns,
        stats.atBats
      );
      const ops = calculateOPS(onBasePercentage, sluggingPercentage);

      return {
        ...stats,
        battingAverage,
        onBasePercentage,
        sluggingPercentage,
        ops,
      };
    })
    .sort((a, b) => {
      // Sort by batting average (descending)
      return b.battingAverage - a.battingAverage;
    });

  const averageRunsPerGame = totalRuns / games.length;
  const averageBattingAverage = totalAtBats > 0 ? totalHits / totalAtBats : 0;

  return {
    totalGames: games.length,
    totalRuns,
    totalHits,
    totalAtBats,
    averageRunsPerGame,
    averageBattingAverage,
    playerSeasonStats,
  };
}

/**
 * Calculate season statistics summary for display
 */
export function getSeasonSummary(seasonResult: SeasonResult) {
  const { games, seasonStats } = seasonResult;

  // Find best game (most runs)
  const bestGame = games.reduce((best, game) =>
    game.totalRuns > best.totalRuns ? game : best
  , games[0]);

  // Find worst game (least runs)
  const worstGame = games.reduce((worst, game) =>
    game.totalRuns < worst.totalRuns ? game : worst
  , games[0]);

  // Calculate win rate (assuming 4+ runs is a win - simplified)
  const wins = games.filter(game => game.totalRuns >= 4).length;
  const winRate = wins / games.length;

  return {
    totalGames: seasonStats.totalGames,
    wins,
    losses: seasonStats.totalGames - wins,
    winRate,
    averageRunsPerGame: seasonStats.averageRunsPerGame,
    totalRuns: seasonStats.totalRuns,
    totalHits: seasonStats.totalHits,
    bestGameRuns: bestGame.totalRuns,
    worstGameRuns: worstGame.totalRuns,
  };
}
