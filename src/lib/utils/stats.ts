/**
 * Baseball batting statistics calculation utilities
 */

import type { Player, BattingStats } from "@/types";

/**
 * Calculate batting average (打率)
 * Formula: Hits / At Bats
 */
export function calculateBattingAverage(hits: number, atBats: number): number {
  if (atBats === 0) return 0;
  return hits / atBats;
}

/**
 * Calculate on-base percentage (出塁率)
 * Formula: (Hits + Walks) / (At Bats + Walks)
 */
export function calculateOnBasePercentage(
  hits: number,
  walks: number,
  atBats: number
): number {
  const plateAppearances = atBats + walks;
  if (plateAppearances === 0) return 0;
  return (hits + walks) / plateAppearances;
}

/**
 * Calculate slugging percentage (長打率)
 * Formula: Total Bases / At Bats
 * Total Bases = Singles + (Doubles × 2) + (Triples × 3) + (Home Runs × 4)
 */
export function calculateSluggingPercentage(
  singles: number,
  doubles: number,
  triples: number,
  homeRuns: number,
  atBats: number
): number {
  if (atBats === 0) return 0;
  const totalBases = singles + doubles * 2 + triples * 3 + homeRuns * 4;
  return totalBases / atBats;
}

/**
 * Calculate OPS (On-base Plus Slugging)
 * Formula: OBP + SLG
 */
export function calculateOPS(obp: number, slg: number): number {
  return obp + slg;
}

/**
 * Calculate all batting statistics for a player
 */
export function calculatePlayerStats(player: Player): BattingStats {
  const hits =
    player.singles + player.doubles + player.triples + player.home_runs;

  const battingAverage = calculateBattingAverage(hits, player.at_bats);
  const onBasePercentage = calculateOnBasePercentage(
    hits,
    player.walks,
    player.at_bats
  );
  const sluggingPercentage = calculateSluggingPercentage(
    player.singles,
    player.doubles,
    player.triples,
    player.home_runs,
    player.at_bats
  );
  const ops = calculateOPS(onBasePercentage, sluggingPercentage);

  return {
    at_bats: player.at_bats,
    hits,
    singles: player.singles,
    doubles: player.doubles,
    triples: player.triples,
    home_runs: player.home_runs,
    walks: player.walks,
    strikeouts: player.strikeouts,
    groundouts: player.groundouts,
    flyouts: player.flyouts,
    batting_average: battingAverage,
    on_base_percentage: onBasePercentage,
    slugging_percentage: sluggingPercentage,
    ops,
  };
}

/**
 * Format batting average for display
 * Example: 0.333 -> ".333"
 */
export function formatBattingAverage(avg: number): string {
  if (avg === 0) return ".000";
  return avg.toFixed(3).substring(1); // Remove leading 0
}

/**
 * Format percentage for display
 * Example: 0.456 -> ".456"
 */
export function formatPercentage(pct: number): string {
  if (pct === 0) return ".000";
  if (pct >= 1) return "1.000";
  return pct.toFixed(3).substring(1);
}

/**
 * Format OPS for display
 * Example: 0.876 -> ".876"
 */
export function formatOPS(ops: number): string {
  if (ops === 0) return ".000";
  if (ops >= 1) return ops.toFixed(3);
  return ops.toFixed(3).substring(1);
}

/**
 * Calculate team batting statistics
 */
export function calculateTeamStats(players: Player[]): BattingStats {
  const totalStats = players.reduce(
    (acc, player) => ({
      at_bats: acc.at_bats + player.at_bats,
      singles: acc.singles + player.singles,
      doubles: acc.doubles + player.doubles,
      triples: acc.triples + player.triples,
      home_runs: acc.home_runs + player.home_runs,
      walks: acc.walks + player.walks,
      strikeouts: acc.strikeouts + player.strikeouts,
      groundouts: acc.groundouts + player.groundouts,
      flyouts: acc.flyouts + player.flyouts,
    }),
    {
      at_bats: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      home_runs: 0,
      walks: 0,
      strikeouts: 0,
      groundouts: 0,
      flyouts: 0,
    }
  );

  const hits =
    totalStats.singles +
    totalStats.doubles +
    totalStats.triples +
    totalStats.home_runs;

  const battingAverage = calculateBattingAverage(hits, totalStats.at_bats);
  const onBasePercentage = calculateOnBasePercentage(
    hits,
    totalStats.walks,
    totalStats.at_bats
  );
  const sluggingPercentage = calculateSluggingPercentage(
    totalStats.singles,
    totalStats.doubles,
    totalStats.triples,
    totalStats.home_runs,
    totalStats.at_bats
  );
  const ops = calculateOPS(onBasePercentage, sluggingPercentage);

  return {
    ...totalStats,
    hits,
    batting_average: battingAverage,
    on_base_percentage: onBasePercentage,
    slugging_percentage: sluggingPercentage,
    ops,
  };
}
