/**
 * Default player configuration for new teams
 */

import type { CreatePlayerInput } from "@/types";

/**
 * Default player stats (OPS ~0.750)
 *
 * Batting Average: .250 (100/400)
 * On-Base Percentage: .333 (150/450)
 * Slugging Percentage: .417 (165/400)
 * OPS: .750
 */
export const DEFAULT_PLAYER_STATS = {
  at_bats: 400,
  singles: 65,
  doubles: 25,
  triples: 5,
  home_runs: 5,
  walks: 50,
} as const;

/**
 * Create default players for a new team
 * Returns array of 9 players with batting orders 1-9
 */
export function createDefaultPlayers(teamId: string): Omit<CreatePlayerInput, "team_id">[] {
  return Array.from({ length: 9 }, (_, i) => ({
    name: `選手${i + 1}`,
    batting_order: i + 1,
    ...DEFAULT_PLAYER_STATS,
  }));
}
