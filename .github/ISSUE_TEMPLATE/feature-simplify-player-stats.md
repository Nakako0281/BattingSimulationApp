---
name: 選手統計の簡素化
about: アウトの詳細（三振、ゴロアウト、フライアウト）を削除してシミュレーションを簡素化
title: '選手統計入力の簡素化: アウト詳細の削除'
labels: enhancement, ui
assignees: ''
---

## 📋 概要

現在の選手統計入力では三振、ゴロアウト、フライアウトなど**アウトの詳細**を入力する必要がありますが、このシミュレーションではゲッツーなどの複雑な処理を行わない方針のため、アウトの種類を区別する必要がありません。

**アウトの詳細入力を削除**し、よりシンプルな入力フォームにします。

## 🎯 目的

- ユーザーの入力負担を軽減
- シミュレーションの目的（打撃結果の確率的予測）に焦点を当てる
- 不要な複雑さを排除

## 📊 現在の入力項目

### 安打系（保持）
- ✅ 単打 (Singles)
- ✅ 二塁打 (Doubles)
- ✅ 三塁打 (Triples)
- ✅ 本塁打 (Home Runs)

### その他（保持）
- ✅ 四球 (Walks)

### アウト詳細（削除対象）
- ❌ 三振 (Strikeouts)
- ❌ ゴロアウト (Groundouts)
- ❌ フライアウト (Flyouts)

### 統計値（保持）
- ✅ 打数 (At Bats)

## 🔧 実装タスク

### Phase 1: データベーススキーマ更新

- [ ] `players` テーブルから以下のカラムを削除（または nullable に変更）
  - `strikeouts`
  - `groundouts`
  - `flyouts`
- [ ] マイグレーションスクリプト作成

```sql
-- supabase/remove-out-details.sql
ALTER TABLE players 
  ALTER COLUMN strikeouts DROP NOT NULL,
  ALTER COLUMN groundouts DROP NOT NULL,
  ALTER COLUMN flyouts DROP NOT NULL;

-- または完全に削除する場合
-- ALTER TABLE players 
--   DROP COLUMN strikeouts,
--   DROP COLUMN groundouts,
--   DROP COLUMN flyouts;
```

### Phase 2: 型定義更新

- [ ] `src/types/index.ts` の `Player` インターフェース更新
- [ ] `strikeouts`, `groundouts`, `flyouts` をオプショナルまたは削除

```typescript
export interface Player {
  id: string;
  user_id: string;
  team_id: string;
  name: string;
  batting_order: number;
  
  // 安打
  singles: number;
  doubles: number;
  triples: number;
  home_runs: number;
  
  // その他
  walks: number;
  at_bats: number;
  
  // アウト詳細を削除
  // strikeouts: number; // 削除
  // groundouts: number; // 削除
  // flyouts: number;    // 削除
  
  created_at: string;
  updated_at: string;
}
```

### Phase 3: バリデーションスキーマ更新

- [ ] `src/lib/utils/validation.ts` 更新
- [ ] `createPlayerSchema` から該当フィールド削除
- [ ] `updatePlayerSchema` から該当フィールド削除

```typescript
export const createPlayerSchema = z.object({
  team_id: z.string().uuid(),
  name: z.string().min(1, "選手名は必須です").max(100),
  batting_order: z.number().int().min(1).max(9),
  
  singles: z.number().int().min(0).default(0),
  doubles: z.number().int().min(0).default(0),
  triples: z.number().int().min(0).default(0),
  home_runs: z.number().int().min(0).default(0),
  walks: z.number().int().min(0).default(0),
  at_bats: z.number().int().min(0).default(0),
  
  // 削除: strikeouts, groundouts, flyouts
}).refine(
  (data) => {
    const totalHits = data.singles + data.doubles + data.triples + data.home_runs;
    return totalHits <= data.at_bats;
  },
  { message: "安打数が打数を超えることはできません" }
);
```

### Phase 4: UI コンポーネント更新

- [ ] `src/components/players/PlayerForm.tsx` 更新
  - 三振、ゴロアウト、フライアウトの入力フィールドを削除
  - フォームレイアウトを簡素化

```tsx
// 削除対象の入力フィールド
<div>
  <label>三振</label>
  <input name="strikeouts" ... />
</div>
<div>
  <label>ゴロアウト</label>
  <input name="groundouts" ... />
</div>
<div>
  <label>フライアウト</label>
  <input name="flyouts" ... />
</div>
```

### Phase 5: シミュレーションロジック更新

- [ ] `src/lib/simulation/probability.ts` 更新
- [ ] `calculatePlayerProbabilities` 関数を修正
- [ ] アウト確率を「総アウト」として計算

```typescript
export function calculatePlayerProbabilities(player: Player): PlayerProbabilities {
  const totalPlateAppearances = 
    player.singles + 
    player.doubles + 
    player.triples + 
    player.home_runs + 
    player.walks + 
    player.at_bats - 
    (player.singles + player.doubles + player.triples + player.home_runs);

  if (totalPlateAppearances === 0) {
    return DEFAULT_PROBABILITIES;
  }

  const hitProbability = 
    (player.singles + player.doubles + player.triples + player.home_runs) / 
    totalPlateAppearances;
  
  const outProbability = 1 - hitProbability - (player.walks / totalPlateAppearances);

  return {
    playerId: player.id,
    single: player.singles / totalPlateAppearances,
    double: player.doubles / totalPlateAppearances,
    triple: player.triples / totalPlateAppearances,
    homeRun: player.home_runs / totalPlateAppearances,
    walk: player.walks / totalPlateAppearances,
    out: outProbability, // 単一の「アウト」確率
  };
}
```

### Phase 6: テスト更新

- [ ] `__tests__/components/players/PlayerForm.test.tsx` 更新
  - アウト詳細関連のテストを削除
- [ ] `__tests__/unit/simulation/probability.test.ts` 更新
  - 新しい確率計算ロジックのテスト追加

### Phase 7: データマイグレーション

- [ ] 既存データの処理方針を決定
  - オプション1: 既存のアウト詳細データは保持（表示しない）
  - オプション2: 既存データをクリーンアップ

```sql
-- オプション2の場合
UPDATE players 
SET 
  strikeouts = 0,
  groundouts = 0,
  flyouts = 0;
```

## 📝 新しいフォームレイアウト案

```
┌─────────────────────────────────┐
│ 選手情報                         │
├─────────────────────────────────┤
│ 名前: [___________________]      │
│ 打順: [1-9]                      │
├─────────────────────────────────┤
│ 打撃成績                         │
├─────────────────────────────────┤
│ 打数: [_____]                    │
│                                  │
│ 【安打】                         │
│ 単打:   [_____]                  │
│ 二塁打: [_____]                  │
│ 三塁打: [_____]                  │
│ 本塁打: [_____]                  │
│                                  │
│ 【その他】                       │
│ 四球:   [_____]                  │
├─────────────────────────────────┤
│ 計算される統計値                 │
│ 打率: .XXX                       │
│ 出塁率: .XXX                     │
│ 長打率: .XXX                     │
│ OPS: .XXX                        │
└─────────────────────────────────┘
```

## ✅ 完了条件

- [ ] データベーススキーマが更新されている
- [ ] 型定義が更新されている
- [ ] バリデーションが更新されている
- [ ] UIフォームが簡素化されている
- [ ] シミュレーションロジックが正しく動作する
- [ ] 全てのテストがパスする
- [ ] 既存データの互換性が保たれている（または適切に移行されている）
- [ ] ドキュメントが更新されている

## 🎨 UI/UX改善ポイント

- 入力項目が8項目から5項目に削減（40%減）
- フォームがよりシンプルで直感的
- 統計値の自動計算はそのまま維持
- ユーザーの入力負担が大幅に軽減

## 📚 参考情報

- 現在のフォーム: `src/components/players/PlayerForm.tsx:327`
- 確率計算: `src/lib/simulation/probability.ts`
- バリデーション: `src/lib/utils/validation.ts`

## ⚠️ 注意事項

- 既存ユーザーのデータに影響を与える可能性があるため、慎重にマイグレーションを実施
- Supabaseのバックアップを取得してから実施
- テストを十分に実施してからデプロイ

---

**優先度**: Medium  
**推定作業時間**: 4-6時間  
**影響範囲**: Database, Types, Validation, UI, Simulation Logic, Tests
