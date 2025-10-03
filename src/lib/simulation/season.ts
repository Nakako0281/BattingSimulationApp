/**
 * Season simulation engine
 */

import type {
  Player,
  Team,
  SeasonResult,
  SeasonStats,
  PlayerSeasonStats,
  MatchResult,
  TeamSeasonStats
} from "@/types";
import { simulateGame, simulateMatch } from "./engine";
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
    homeTeamId: teamId,
    awayTeamId: "",
    homeTeamName: teamName,
    awayTeamName: "",
    matches: games as any,
    seasonStats: seasonStats as any,
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
          case "out":
            stats.strikeouts++; // Track outs as strikeouts for compatibility
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
    homeWins: 0,
    awayWins: 0,
    ties: 0,
    homeTeamStats: {
      teamId: "",
      teamName: "",
      totalRuns,
      totalHits,
      totalAtBats,
      averageRunsPerGame,
      averageBattingAverage,
      playerSeasonStats,
    },
    awayTeamStats: {
      teamId: "",
      teamName: "",
      totalRuns: 0,
      totalHits: 0,
      totalAtBats: 0,
      averageRunsPerGame: 0,
      averageBattingAverage: 0,
      playerSeasonStats: [],
    },
  };
}

/**
 * Calculate season statistics summary for display
 */
export function getSeasonSummary(seasonResult: SeasonResult) {
  const { matches, seasonStats } = seasonResult;

  // Find best game (most runs)
  const bestGame = matches.reduce((best: any, game: any) =>
    game.finalScore.home > best.finalScore.home ? game : best
  , matches[0]);

  // Find worst game (least runs)
  const worstGame = matches.reduce((worst: any, game: any) =>
    game.finalScore.home < worst.finalScore.home ? game : worst
  , matches[0]);

  // Calculate win rate (assuming 4+ runs is a win - simplified)
  const wins = matches.filter((game: any) => game.finalScore.home >= 4).length;
  const winRate = wins / matches.length;

  return {
    totalGames: seasonStats.totalGames,
    wins,
    losses: seasonStats.totalGames - wins,
    winRate,
    averageRunsPerGame: seasonStats.homeTeamStats.averageRunsPerGame,
    totalRuns: seasonStats.homeTeamStats.totalRuns,
    totalHits: seasonStats.homeTeamStats.totalHits,
    bestGameRuns: bestGame.finalScore.home,
    worstGameRuns: worstGame.finalScore.home,
  };
}

/**
 * Simulate a season between two teams (V2)
 */
export function simulateMatchSeason(
  homeTeam: Team,
  homePlayers: Player[],
  awayTeam: Team,
  awayPlayers: Player[],
  numberOfGames: number,
  innings: number = 9
): SeasonResult {
  if (homePlayers.length === 0 || awayPlayers.length === 0) {
    throw new Error("Cannot simulate season with teams that have no players");
  }

  if (numberOfGames < 1 || numberOfGames > 162) {
    throw new Error("Number of games must be between 1 and 162");
  }

  const matches: MatchResult[] = [];

  // Simulate each match
  for (let i = 0; i < numberOfGames; i++) {
    const matchResult = simulateMatch(homeTeam, homePlayers, awayTeam, awayPlayers, innings);
    matches.push(matchResult);
  }

  // Aggregate season statistics
  const seasonStats = aggregateMatchSeasonStats(matches, homeTeam, homePlayers, awayTeam, awayPlayers);

  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeTeamName: homeTeam.name,
    awayTeamName: awayTeam.name,
    matches,
    seasonStats,
  };
}

/**
 * Aggregate match statistics for season (V2)
 */
function aggregateMatchSeasonStats(
  matches: MatchResult[],
  homeTeam: Team,
  homePlayers: Player[],
  awayTeam: Team,
  awayPlayers: Player[]
): SeasonStats {
  // Count wins/losses/ties
  let homeWins = 0;
  let awayWins = 0;
  let ties = 0;

  matches.forEach(match => {
    if (match.winner === "home") homeWins++;
    else if (match.winner === "away") awayWins++;
    else ties++;
  });

  // Aggregate home team stats
  const homeTeamStats = aggregateTeamStats(
    matches.map(m => m.homeTeam),
    homeTeam,
    homePlayers
  );

  // Aggregate away team stats
  const awayTeamStats = aggregateTeamStats(
    matches.map(m => m.awayTeam),
    awayTeam,
    awayPlayers
  );

  return {
    totalGames: matches.length,
    homeWins,
    awayWins,
    ties,
    homeTeamStats,
    awayTeamStats,
  };
}

/**
 * Aggregate stats for a single team across games
 */
function aggregateTeamStats(games: any[], team: Team, players: Player[]): TeamSeasonStats {
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
          case "out":
            stats.strikeouts++; // Track outs as strikeouts for compatibility
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
    teamId: team.id,
    teamName: team.name,
    totalRuns,
    totalHits,
    totalAtBats,
    averageRunsPerGame,
    averageBattingAverage,
    playerSeasonStats,
  };
}

/**
 * Get season summary for 2-team match season (V2)
 */
export function getMatchSeasonSummary(seasonResult: SeasonResult) {
  const { matches, seasonStats } = seasonResult;

  return {
    totalGames: seasonStats.totalGames,
    homeWins: seasonStats.homeWins,
    awayWins: seasonStats.awayWins,
    ties: seasonStats.ties,
    homeWinRate: seasonStats.homeWins / seasonStats.totalGames,
    awayWinRate: seasonStats.awayWins / seasonStats.totalGames,
    homeTeamStats: seasonStats.homeTeamStats,
    awayTeamStats: seasonStats.awayTeamStats,
  };
}
