---
name: 2チーム対戦方式への変更
about: シミュレーションを1チームから2チーム対戦方式に変更
title: '[FEATURE] 2チーム対戦方式への変更'
labels: enhancement, breaking-change
assignees: ''
---

## 📋 概要

現在のシミュレーションは1チームのみで得点を計算していますが、野球の本質的な仕様として2チーム（ホーム vs ビジター）で対戦し、勝敗を決定する方式に変更する必要があります。

## 🎯 目的

- より現実的な野球シミュレーション
- チーム間の対戦結果を記録
- 勝敗の概念を導入

## 📦 影響範囲

### コアロジック（5ファイル）
- [ ] `src/lib/simulation/engine.ts` - 2チーム対応エンジン
- [ ] `src/types/simulation.ts` - 勝敗・対戦情報の型定義
- [ ] `src/types/database.ts` - DB型定義の更新
- [ ] `src/lib/simulation/season.ts` - シーズンモード更新
- [ ] `src/lib/simulation/probability.ts` - 確率計算（影響小）

### API（4ファイル）
- [ ] `src/app/api/simulate/route.ts` - 2チームID受け取り
- [ ] `src/app/api/simulate/season/route.ts` - シーズンAPI更新
- [ ] `src/app/api/simulate/save/route.ts` - 保存API更新
- [ ] `src/app/api/simulate/history/route.ts` - 履歴API更新

### UI（3ファイル）
- [ ] `src/app/simulate/page.tsx` - 2チーム選択UI
- [ ] `src/app/simulate/season/page.tsx` - シーズン画面更新
- [ ] `src/app/history/page.tsx` - 勝敗表示

### データベース（1ファイル）
- [ ] `supabase/simulation-results.sql` - テーブル構造変更

## 🔧 変更内容

### 1. シミュレーションロジック

**現在（1チームのみ）:**
```typescript
simulateGame(team: Team, innings: number): GameResult
```

**修正後（2チーム対戦）:**
```typescript
simulateGame(homeTeam: Team, awayTeam: Team, innings: number): MatchResult {
  homeResult: GameResult,
  awayResult: GameResult,
  winner: 'home' | 'away' | 'tie',
  finalScore: { home: number, away: number }
}
```

### 2. UI変更

**チーム選択:**
- 現在: 1チーム選択
- 修正後: 2チーム選択（ホーム/ビジター）

**結果表示:**
- 現在: 単独得点表示（例: 5得点）
- 修正後: スコアボード形式（例: ホーム 5 - 3 ビジター ○勝利）

### 3. データベーススキーマ

**現在:**
```sql
simulation_results (
  id UUID,
  team_id UUID,              -- 1チームのみ
  total_runs INTEGER,
  total_hits INTEGER,
  result_data JSONB
)
```

**修正後:**
```sql
simulation_results (
  id UUID,
  home_team_id UUID,         -- ホームチーム
  away_team_id UUID,         -- ビジターチーム
  home_runs INTEGER,         -- ホーム得点
  away_runs INTEGER,         -- ビジター得点
  winner TEXT,               -- 'home', 'away', 'tie'
  result_data JSONB          -- 詳細データ
)
```

## ⚠️ 破壊的変更

- **既存の保存データは削除されます**
- データベーステーブルを再作成
- APIのインターフェースが変わります

## 📅 実装計画

### Phase 1: データベース（破壊的変更）
1. 既存の `simulation_results` テーブルを削除
2. 新しい2チーム対戦用テーブル作成
3. 新しいマイグレーションSQL作成

### Phase 2: コアロジック（2-3時間）
1. シミュレーションエンジンを2チーム対応に変更
2. 型定義の更新（MatchResult, WinnerType等）
3. 勝敗判定ロジック追加
4. スコア計算の変更

### Phase 3: API（1-2時間）
1. `/api/simulate` - 2チームID受け取り
2. `/api/simulate/season` - シーズンモード更新
3. `/api/simulate/save` - 保存形式変更
4. `/api/simulate/history` - 履歴取得更新

### Phase 4: UI（2-3時間）
1. 試合シミュレーション画面 - 2チーム選択UI
2. スコアボード表示コンポーネント
3. 勝敗表示UI
4. シーズンモード画面更新
5. 履歴画面更新

### Phase 5: テスト & 検証（1時間）
1. 単一試合シミュレーション動作確認
2. シーズンシミュレーション動作確認
3. 保存・履歴機能確認
4. エッジケース確認（同点、延長戦等）

**総作業時間: 6-9時間**

## ✅ 受け入れ基準

- [ ] 2チームを選択できる
- [ ] 両チームの得点が表示される
- [ ] 勝敗が判定される
- [ ] スコアボード形式で結果が表示される
- [ ] シミュレーション結果を保存できる
- [ ] 履歴で勝敗が確認できる
- [ ] シーズンモードで勝敗記録が表示される
- [ ] 既存のテストが全て通る

## 🏷️ リリース予定

- v2.0.0（破壊的変更のためメジャーバージョンアップ）

## 📝 備考

- v1.0.0は保持（ロールバック用）
- テストユーザーのデータのみの段階で実施
- 後回しにすると大規模マイグレーションが必要
