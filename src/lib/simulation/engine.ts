/**
 * Baseball simulation engine
 */

import type {
  Player,
  Team,
  AtBatResult,
  InningResult,
  GameResult,
  MatchResult,
  WinnerType,
  BaseState,
  InningState,
  OutcomeType,
} from "@/types";
import { calculatePlayerProbabilities, determineOutcome } from "./probability";

/**
 * Initialize base state (all empty)
 */
function initializeBaseState(): BaseState {
  return {
    first: false,
    second: false,
    third: false,
  };
}

/**
 * Process a single at-bat and update game state
 */
function processAtBat(
  player: Player,
  state: InningState
): { outcome: AtBatResult; newState: InningState } {
  const probabilities = calculatePlayerProbabilities(player);
  const outcomeType = determineOutcome(probabilities) as OutcomeType;

  let rbi = 0;
  let newBases = { ...state.bases };
  let newOuts = state.outs;
  let newRuns = state.runs;

  switch (outcomeType) {
    case "single":
      // Runner on third scores
      if (newBases.third) {
        newRuns++;
        rbi++;
      }
      // Runners advance one base
      newBases = {
        first: true,
        second: newBases.first,
        third: newBases.second,
      };
      break;

    case "double":
      // Runners on third and second score
      if (newBases.third) {
        newRuns++;
        rbi++;
      }
      if (newBases.second) {
        newRuns++;
        rbi++;
      }
      // Runner on first to third
      newBases = {
        first: false,
        second: true,
        third: newBases.first,
      };
      break;

    case "triple":
      // All runners score
      if (newBases.first) {
        newRuns++;
        rbi++;
      }
      if (newBases.second) {
        newRuns++;
        rbi++;
      }
      if (newBases.third) {
        newRuns++;
        rbi++;
      }
      newBases = {
        first: false,
        second: false,
        third: true,
      };
      break;

    case "home_run":
      // Batter and all runners score
      rbi++; // Batter scores
      if (newBases.first) {
        newRuns++;
        rbi++;
      }
      if (newBases.second) {
        newRuns++;
        rbi++;
      }
      if (newBases.third) {
        newRuns++;
        rbi++;
      }
      newRuns++; // Batter scores
      newBases = initializeBaseState();
      break;

    case "walk":
      // Force runners if needed
      if (newBases.first) {
        if (newBases.second) {
          if (newBases.third) {
            // Bases loaded - runner on third scores
            newRuns++;
          }
          newBases.third = newBases.second;
        }
        newBases.second = true;
      }
      newBases.first = true;
      break;

    case "strikeout":
    case "groundout":
    case "flyout":
      newOuts++;
      // No runners advance on outs
      break;
  }

  const atBatResult: AtBatResult = {
    playerId: player.id,
    playerName: player.name,
    battingOrder: player.batting_order,
    outcome: outcomeType,
    rbi,
    timestamp: new Date(),
  };

  const newState: InningState = {
    ...state,
    outs: newOuts,
    bases: newBases,
    runs: newRuns,
  };

  return { outcome: atBatResult, newState };
}

/**
 * Simulate a single inning
 */
export function simulateInning(
  players: Player[],
  inningNumber: number,
  startingBatter: number
): { result: InningResult; nextBatter: number } {
  let state: InningState = {
    inningNumber,
    outs: 0,
    bases: initializeBaseState(),
    runs: 0,
    currentBatter: startingBatter,
  };

  const atBats: AtBatResult[] = [];
  let hits = 0;

  // Continue until 3 outs
  while (state.outs < 3) {
    const batterIndex = (state.currentBatter - 1) % players.length;
    const currentPlayer = players[batterIndex];

    const { outcome, newState } = processAtBat(currentPlayer, state);
    atBats.push(outcome);

    // Count hits
    if (
      outcome.outcome === "single" ||
      outcome.outcome === "double" ||
      outcome.outcome === "triple" ||
      outcome.outcome === "home_run"
    ) {
      hits++;
    }

    state = newState;
    state.currentBatter = (state.currentBatter % players.length) + 1;
  }

  const result: InningResult = {
    inningNumber,
    atBats,
    runs: state.runs,
    hits,
    errors: 0, // Not implemented in this version
    leftOnBase: (state.bases.first ? 1 : 0) + (state.bases.second ? 1 : 0) + (state.bases.third ? 1 : 0),
  };

  return { result, nextBatter: state.currentBatter };
}

/**
 * Simulate a complete game
 */
export function simulateGame(
  teamId: string,
  teamName: string,
  players: Player[],
  innings: number = 9
): GameResult {
  if (players.length === 0) {
    throw new Error("Cannot simulate game with no players");
  }

  // Sort players by batting order
  const sortedPlayers = [...players].sort((a, b) => a.batting_order - b.batting_order);

  const inningResults: InningResult[] = [];
  let currentBatter = 1;

  // Simulate each inning
  for (let i = 1; i <= innings; i++) {
    const { result, nextBatter } = simulateInning(sortedPlayers, i, currentBatter);
    inningResults.push(result);
    currentBatter = nextBatter;
  }

  // Calculate totals
  const totalRuns = inningResults.reduce((sum, inning) => sum + inning.runs, 0);
  const totalHits = inningResults.reduce((sum, inning) => sum + inning.hits, 0);

  // Calculate player game stats
  const playerStatsMap = new Map<string, any>();

  inningResults.forEach((inning) => {
    inning.atBats.forEach((atBat) => {
      if (!playerStatsMap.has(atBat.playerId)) {
        playerStatsMap.set(atBat.playerId, {
          playerId: atBat.playerId,
          playerName: atBat.playerName,
          battingOrder: atBat.battingOrder,
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
      }

      const stats = playerStatsMap.get(atBat.playerId);

      if (atBat.outcome !== "walk") {
        stats.atBats++;
      }

      if (["single", "double", "triple", "home_run"].includes(atBat.outcome)) {
        stats.hits++;
      }

      if (atBat.outcome === "single") {
        stats.singles++;
      }

      if (atBat.outcome === "double") {
        stats.doubles++;
      }

      if (atBat.outcome === "triple") {
        stats.triples++;
      }

      if (atBat.outcome === "home_run") {
        stats.homeRuns++;
        stats.runs++;
      }

      stats.rbi += atBat.rbi;

      if (atBat.outcome === "walk") {
        stats.walks++;
      }

      if (atBat.outcome === "strikeout") {
        stats.strikeouts++;
      }
    });
  });

  const playerStats = Array.from(playerStatsMap.values()).map((stats) => ({
    ...stats,
    battingAverage: stats.atBats > 0 ? stats.hits / stats.atBats : 0,
  }));

  return {
    teamId,
    teamName,
    innings: inningResults,
    totalRuns,
    totalHits,
    totalErrors: 0,
    playerStats,
  };
}

/**
 * Simulate a match between two teams (V2)
 */
export function simulateMatch(
  homeTeam: Team,
  homePlayers: Player[],
  awayTeam: Team,
  awayPlayers: Player[],
  innings: number = 9
): MatchResult {
  // Simulate game for home team
  const homeResult = simulateGame(
    homeTeam.id,
    homeTeam.name,
    homePlayers,
    innings
  );

  // Simulate game for away team
  const awayResult = simulateGame(
    awayTeam.id,
    awayTeam.name,
    awayPlayers,
    innings
  );

  // Determine winner
  let winner: WinnerType;
  if (homeResult.totalRuns > awayResult.totalRuns) {
    winner = "home";
  } else if (awayResult.totalRuns > homeResult.totalRuns) {
    winner = "away";
  } else {
    winner = "tie";
  }

  return {
    homeTeam: homeResult,
    awayTeam: awayResult,
    winner,
    finalScore: {
      home: homeResult.totalRuns,
      away: awayResult.totalRuns,
    },
    innings,
  };
}
