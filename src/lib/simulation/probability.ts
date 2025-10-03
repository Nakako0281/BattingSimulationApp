/**
 * Probability calculation for batting simulation
 */

import type { Player, PlayerProbabilities } from "@/types";

/**
 * Calculate outcome probabilities for a player based on their statistics
 * Note: Simplified approach - no distinction between strikeout/groundout/flyout
 */
export function calculatePlayerProbabilities(player: Player): PlayerProbabilities {
  // Calculate total positive outcomes (hits and walks)
  const hits = player.singles + player.doubles + player.triples + player.home_runs;
  const totalPositiveOutcomes = hits + player.walks;

  // Calculate outs from at_bats minus hits
  const outs = player.at_bats - hits;

  const totalOutcomes = totalPositiveOutcomes + outs;

  // If no data, return default probabilities
  if (totalOutcomes === 0) {
    return {
      playerId: player.id,
      single: 0.15,
      double: 0.05,
      triple: 0.01,
      homeRun: 0.03,
      walk: 0.08,
      out: 0.68, // Combined out probability (20% + 24% + 24%)
    };
  }

  // Calculate probabilities based on actual statistics
  return {
    playerId: player.id,
    single: player.singles / totalOutcomes,
    double: player.doubles / totalOutcomes,
    triple: player.triples / totalOutcomes,
    homeRun: player.home_runs / totalOutcomes,
    walk: player.walks / totalOutcomes,
    out: outs / totalOutcomes,
  };
}

/**
 * Determine outcome based on probabilities using random number
 */
export function determineOutcome(probabilities: PlayerProbabilities): string {
  const random = Math.random();
  let cumulative = 0;

  // Check each outcome in order
  cumulative += probabilities.single;
  if (random < cumulative) return "single";

  cumulative += probabilities.double;
  if (random < cumulative) return "double";

  cumulative += probabilities.triple;
  if (random < cumulative) return "triple";

  cumulative += probabilities.homeRun;
  if (random < cumulative) return "home_run";

  cumulative += probabilities.walk;
  if (random < cumulative) return "walk";

  // Default to out if nothing else matches
  return "out";
}

/**
 * Calculate team-wide probabilities (average of all players)
 */
export function calculateTeamProbabilities(players: Player[]): PlayerProbabilities {
  if (players.length === 0) {
    throw new Error("Cannot calculate probabilities for empty team");
  }

  const allProbabilities = players.map(calculatePlayerProbabilities);

  // Average all probabilities
  const avgProbabilities: PlayerProbabilities = {
    playerId: "team-average",
    single: 0,
    double: 0,
    triple: 0,
    homeRun: 0,
    walk: 0,
    out: 0,
  };

  allProbabilities.forEach((prob) => {
    avgProbabilities.single += prob.single;
    avgProbabilities.double += prob.double;
    avgProbabilities.triple += prob.triple;
    avgProbabilities.homeRun += prob.homeRun;
    avgProbabilities.walk += prob.walk;
    avgProbabilities.out += prob.out;
  });

  const count = allProbabilities.length;
  avgProbabilities.single /= count;
  avgProbabilities.double /= count;
  avgProbabilities.triple /= count;
  avgProbabilities.homeRun /= count;
  avgProbabilities.walk /= count;
  avgProbabilities.out /= count;

  return avgProbabilities;
}
