/**
 * Probability calculation for batting simulation
 */

import type { Player, PlayerProbabilities } from "@/types";

/**
 * Calculate outcome probabilities for a player based on their statistics
 */
export function calculatePlayerProbabilities(player: Player): PlayerProbabilities {
  const totalOutcomes =
    player.singles +
    player.doubles +
    player.triples +
    player.home_runs +
    player.walks +
    player.strikeouts +
    player.groundouts +
    player.flyouts;

  // If no data, return default probabilities
  if (totalOutcomes === 0) {
    return {
      playerId: player.id,
      single: 0.15,
      double: 0.05,
      triple: 0.01,
      homeRun: 0.03,
      walk: 0.08,
      strikeout: 0.20,
      groundout: 0.24,
      flyout: 0.24,
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
    strikeout: player.strikeouts / totalOutcomes,
    groundout: player.groundouts / totalOutcomes,
    flyout: player.flyouts / totalOutcomes,
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

  cumulative += probabilities.strikeout;
  if (random < cumulative) return "strikeout";

  cumulative += probabilities.groundout;
  if (random < cumulative) return "groundout";

  // Default to flyout if nothing else matches
  return "flyout";
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
    strikeout: 0,
    groundout: 0,
    flyout: 0,
  };

  allProbabilities.forEach((prob) => {
    avgProbabilities.single += prob.single;
    avgProbabilities.double += prob.double;
    avgProbabilities.triple += prob.triple;
    avgProbabilities.homeRun += prob.homeRun;
    avgProbabilities.walk += prob.walk;
    avgProbabilities.strikeout += prob.strikeout;
    avgProbabilities.groundout += prob.groundout;
    avgProbabilities.flyout += prob.flyout;
  });

  const count = allProbabilities.length;
  avgProbabilities.single /= count;
  avgProbabilities.double /= count;
  avgProbabilities.triple /= count;
  avgProbabilities.homeRun /= count;
  avgProbabilities.walk /= count;
  avgProbabilities.strikeout /= count;
  avgProbabilities.groundout /= count;
  avgProbabilities.flyout /= count;

  return avgProbabilities;
}
