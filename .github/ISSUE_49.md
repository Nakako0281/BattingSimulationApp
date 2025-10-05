# Issue #49: Fix table header alignment and add copy-paste UI

## Problem
1. **Header and form column misalignment**: Table headers and input fields are not properly aligned
2. **Inefficient copy workflow**: Current copy button navigates to new page, making it difficult to copy stats to multiple players

## Current Behavior
- Table columns are misaligned between header and body
- Copy button (`/teams/[id]/players/new?copyFrom=xxx`) navigates to player creation page
- User must delete and recreate to copy stats to another player

## Desired Behavior
1. **Fix alignment**: Table headers and input columns should be perfectly aligned
2. **Copy-paste workflow**:
   - Click copy button on any player row → Show paste buttons on ALL other rows
   - Click paste button on target row → Auto-fill stats (at_bats, singles, doubles, triples, home_runs, walks) into that row's form inputs
   - Name field should NOT be copied (keep original name)
   - After paste, user can modify values and save with bulk save button

## Implementation Plan

### 1. Fix Table Alignment
- Use fixed column widths with `w-[Npx]` classes for consistency
- Ensure header `<th>` and body `<td>` have matching widths
- Test on different screen sizes

### 2. Add Copy-Paste State Management
```typescript
const [copiedPlayerStats, setCopiedPlayerStats] = useState<Partial<Player> | null>(null);
```

### 3. Update UI
- Replace copy icon with clipboard copy icon when clicked
- Show paste button (clipboard paste icon) on all OTHER rows when copy is active
- On paste: populate formData for that player with copied stats
- Clear copied state when save button is clicked or user clicks copy again

### 4. Button Behavior
- Copy button: `onClick={() => setCopiedPlayerStats({ at_bats, singles, doubles, triples, home_runs, walks })}`
- Paste button: `onClick={() => handlePaste(playerId)}`
- Only show paste button when `copiedPlayerStats !== null` and `player.id !== copiedPlayer.id`

## Files to Modify
- `src/app/teams/[id]/page.tsx`: Add copy-paste state and handlers, fix column alignment

## Acceptance Criteria
- [ ] Table headers and input fields are perfectly aligned
- [ ] Copy button shows clipboard icon and stores stats
- [ ] Paste buttons appear on all other rows when copy is active
- [ ] Paste button fills form inputs with copied stats (excluding name)
- [ ] User can paste to multiple rows without re-copying
- [ ] Bulk save works correctly with pasted values
- [ ] Visual feedback shows which stats are copied (e.g., icon change)
