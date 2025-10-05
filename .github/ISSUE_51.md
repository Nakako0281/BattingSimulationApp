# Issue #51: Simplify player management - Remove creation page and use default players

## Problem
Current player management is too complex:
- Need to navigate to separate page to create new player
- Empty batting order slots show "(未登録)" with "Add" button
- Delete operation removes player from database
- Creating a team auto-creates 9 players, but users can delete them completely

This creates inconsistency and complexity.

## Current Behavior
1. Team creation → Auto-creates 9 default players (選手1-9 with OPS 0.750)
2. User can delete players → Slot becomes "(未登録)"
3. Click "Add" button → Navigate to `/teams/[id]/players/new` page
4. Fill form → Create new player in that slot

## Desired Behavior (Much Simpler!)
1. Team creation → Auto-creates 9 default players (選手1-9 with **OPS 0.750** - KEEP CURRENT)
2. All 9 players are ALWAYS present (never truly deleted from database)
3. "Delete" button → Reset player to initial state (name: "選手{N}", **all stats = 0**)
4. No "Add" button needed (all slots always have a player)
5. Edit inline directly in the table
6. No separate player creation page needed

## Key Changes

### 1. Default Player Stats on Team Creation
**NO CHANGE** - Keep current behavior:
```typescript
// OPS ~0.750 when creating new team
at_bats: 400, singles: 65, doubles: 25, triples: 5, home_runs: 5, walks: 50
```

**This gives users a good starting point with realistic stats**

### 2. Delete Button Behavior Change
**Before**: DELETE from database → Slot becomes "(未登録)"

**After**: PATCH to reset stats to ZERO → Player remains but with zero stats
```typescript
const handleResetPlayer = async (player: Player) => {
  if (!confirm(`「${player.name}」を初期状態に戻してもよろしいですか？`)) return;

  // Reset to zero stats (NOT the team creation defaults!)
  await fetch(`/api/players/${player.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: `選手${player.batting_order}`,
      at_bats: 0,        // ZERO
      singles: 0,        // ZERO
      doubles: 0,        // ZERO
      triples: 0,        // ZERO
      home_runs: 0,      // ZERO
      walks: 0,          // ZERO
      team_id: teamId
    })
  });

  await fetchTeam();
};
```

**Important**: Reset uses ZERO stats, NOT the team creation defaults (OPS 0.750)

### 3. Table Simplification
**Remove**:
- "(未登録)" empty state rows
- "Add" button and navigation to creation page
- Conditional rendering for empty slots

**Result**: Always show 9 rows with editable players

### 4. Files to Remove
- `src/app/teams/[id]/players/new/page.tsx` - No longer needed
- Player creation API logic (keep only PATCH for updates)

### 5. Files to Modify
- `src/app/teams/[id]/page.tsx`:
  - Remove empty slot rendering (`else` block with "(未登録)")
  - Change delete button to reset button
  - Update handleDeletePlayer → handleResetPlayer
  - Remove "Add" button logic
  - Simplify table rendering (always 9 filled rows)

- `src/lib/constants/defaultPlayers.ts`:
  - **NO CHANGE** - Keep OPS 0.750 defaults for team creation

- `src/app/api/teams/route.ts`:
  - **NO CHANGE** - Keep current default player creation

- Header navigation:
  - Update icons/tooltips: "削除" → "リセット"

## Implementation Steps

1. **Simplify team detail page** (`teams/[id]/page.tsx`):
   - Remove "(未登録)" rendering logic
   - Remove "Add" button
   - Change delete to reset functionality (PATCH with zero stats)
   - Update confirmation message to "初期状態に戻す"
   - Change icon tooltip from "削除" to "リセット"

2. **Delete player creation page**:
   - Remove `/teams/[id]/players/new/page.tsx`
   - Remove related PlayerForm creation mode logic (if not used elsewhere)

3. **Test thoroughly**:
   - Create new team → Should have 9 players with **OPS 0.750** (current behavior)
   - Reset player → Should change to zero stats and default name
   - Inline editing → Should still work perfectly
   - Copy/paste → Should still work

## Migration Note
**Existing teams**: Users who already have teams with deleted players (empty slots) will still have those empty slots. This is acceptable - they can manually add players using the old creation page if it exists, or we can provide a one-time migration script to fill all teams to 9 players.

Alternatively, add a "Fix" button on team detail page: "このチームの空きスロットをデフォルト選手で埋める" (one-time action).

## Acceptance Criteria
- [ ] New teams auto-create 9 players with **OPS 0.750 stats** (NO CHANGE from current)
- [ ] Player names default to "選手1" through "選手9"
- [ ] Team detail page always shows 9 editable player rows (no empty slots)
- [ ] "削除" button renamed to "リセット" with tooltip update
- [ ] Click reset → Confirm dialog "初期状態に戻す" → Player resets to (name: "選手N", all stats = 0)
- [ ] No "追加" (Add) button visible
- [ ] Player creation page deleted (`/teams/[id]/players/new`)
- [ ] Inline editing still works
- [ ] Copy/paste still works
- [ ] Bulk save still works
- [ ] No "(未登録)" text anywhere

## UI/UX Benefits
✅ Simpler mental model: "Edit 9 players inline" vs "Manage player list"
✅ No navigation needed for basic operations
✅ Consistent table layout (always 9 rows)
✅ Faster workflow: Edit → Save (no create/delete flow)
✅ Less code to maintain
