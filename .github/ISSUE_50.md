# Issue #50: Add cancel button to clear copy state

## Problem
After clicking copy button on a player, there's no way to cancel/clear the copy state without:
- Pasting to another player
- Saving changes
- Copying a different player

Users need an explicit way to cancel the copy operation.

## Current Behavior
- Click copy button on Player 1 → All other rows show paste buttons
- No way to cancel if user changes their mind
- Only way to clear is to copy another player (overwrites) or save

## Desired Behavior
- Click copy button on Player 1 → All other rows show paste buttons
- **Player 1's row shows a cancel button (× icon) instead of copy button**
- Click cancel button → Copy state is cleared, all rows return to showing copy buttons
- Visual feedback clearly shows which player is currently copied

## Implementation Plan

### 1. Modify Button Logic in Operations Column
```typescript
// Current copied player gets cancel button
if (copiedPlayerStats && isCopiedPlayer(player.id)) {
  // Show cancel button (MdClose icon)
} else if (copiedPlayerStats) {
  // Show paste button
} else {
  // Show copy button
}
```

### 2. Create Cancel Handler
```typescript
const handleCancelCopy = () => {
  setCopiedPlayerStats(null);
};
```

### 3. Track Copied Player ID
Update state to track which player was copied:
```typescript
const [copiedPlayerStats, setCopiedPlayerStats] = useState<{
  playerId: string;
  stats: { at_bats, singles, doubles, triples, home_runs, walks };
} | null>(null);
```

### 4. Update Copy Handler
Store both player ID and stats when copying:
```typescript
const handleCopyStats = (player: Player) => {
  setCopiedPlayerStats({
    playerId: player.id,
    stats: {
      at_bats: player.at_bats,
      singles: player.singles,
      // ... other stats
    }
  });
};
```

### 5. Button UI
- **Cancel button**: Red color (`text-red-600 hover:text-red-800`), MdClose icon
- **Tooltip**: "キャンセル"
- **Position**: Same location as copy/paste button

## Files to Modify
- `src/app/teams/[id]/page.tsx`: Update copy state structure, add cancel handler, modify button rendering logic

## Acceptance Criteria
- [ ] When a player is copied, that player's row shows cancel button (× icon, red)
- [ ] Other player rows show paste button (clipboard icon, blue)
- [ ] Click cancel button clears copy state
- [ ] After cancel, all rows return to showing copy button (green)
- [ ] Tooltip shows "キャンセル" on cancel button
- [ ] Can copy different player after canceling
- [ ] Visual distinction between copy/paste/cancel states is clear
