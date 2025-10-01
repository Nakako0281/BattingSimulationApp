# Baseball Batting Simulator ⚾

野球の打撃成績をもとに試合結果をシミュレーションするWebアプリケーション

## 特徴

- 📊 **統計ベースシミュレーション**: 選手の実際の打撃成績から確率的に試合結果を予測
- 🎮 **単一試合 & シーズンモード**: 1試合から162試合までのシミュレーションに対応
- 👥 **チーム・選手管理**: 最大4チーム、各チーム9人の選手を登録可能
- 📈 **詳細な統計表示**: 打率、出塁率、長打率、OPS等の高度な統計指標
- 💾 **履歴保存**: シミュレーション結果を保存して後から確認可能
- 📱 **レスポンシブデザイン**: モバイル・タブレット・デスクトップ全対応
- ♿ **アクセシビリティ対応**: WCAG 2.1準拠のアクセシブルなUI

## 技術スタック

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Auth.js (NextAuth.js v5)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Deployment**: Vercel (recommended)

## クイックスタート

### 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### インストール

```bash
# リポジトリをクローン
git clone [repository-url]
cd BattingSimulationApp

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.localを編集して必要な値を設定

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### 環境変数の設定

`.env.local` ファイルに以下の変数を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

詳細は [環境変数ガイド](./docs/ENVIRONMENT_VARIABLES.md) を参照

### データベースセットアップ

Supabaseダッシュボードで以下のSQLファイルを順番に実行:

1. `supabase/schema.sql` - テーブル作成
2. `supabase/fix-rls.sql` - RLSポリシー設定
3. `supabase/simulation-results.sql` - シミュレーション結果テーブル

## 使い方

### 1. ユーザー登録・ログイン

1. `/register` でアカウント作成
2. `/login` でログイン

### 2. チーム作成

1. 「チーム管理」から「新規チーム作成」
2. チーム名を入力して保存

### 3. 選手登録

1. チーム詳細ページで「選手を追加」
2. 選手情報と打撃成績を入力:
   - 打順 (1-9)
   - 単打、二塁打、三塁打、本塁打
   - 四球、三振、ゴロ、フライ
   - 打数

### 4. シミュレーション実行

**単一試合**:
- 「シミュレーション」→「試合シミュレーション」
- チームとイニング数を選択して実行

**シーズンモード**:
- 「シミュレーション」→「シーズンシミュレーション」
- チーム、試合数、イニング数を選択して実行

### 5. 結果の確認

- シミュレーション後、詳細な統計が表示されます
- 「結果を保存」で履歴に保存
- 「履歴」から過去の結果を確認可能

## プロジェクト構造

```
BattingSimulationApp/
├── src/
│   ├── app/               # Next.js App Router pages
│   ├── components/        # Reactコンポーネント
│   │   ├── auth/          # 認証関連
│   │   ├── teams/         # チーム管理
│   │   ├── players/       # 選手管理
│   │   ├── ui/            # 再利用可能なUIコンポーネント
│   │   ├── layout/        # レイアウトコンポーネント
│   │   └── error/         # エラーハンドリング
│   ├── contexts/          # Reactコンテキスト
│   ├── hooks/             # カスタムフック
│   ├── lib/               # ユーティリティ・ロジック
│   │   ├── auth/          # Auth.js設定
│   │   ├── simulation/    # シミュレーションエンジン
│   │   ├── supabase/      # Supabaseクライアント
│   │   └── utils/         # ヘルパー関数
│   └── types/             # TypeScript型定義
├── supabase/              # データベーススキーマ
├── docs/                  # ドキュメント
└── public/                # 静的ファイル
```

## 開発

### ビルド

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### 型チェック

```bash
npx tsc --noEmit
```

## デプロイ

詳細な手順は [デプロイメントガイド](./docs/DEPLOYMENT.md) を参照

### Vercelへのデプロイ (推奨)

1. GitHubにプッシュ
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## ドキュメント

- [環境変数ガイド](./docs/ENVIRONMENT_VARIABLES.md)
- [デプロイメントガイド](./docs/DEPLOYMENT.md)

## 機能一覧

### 認証
- ✅ ユーザー登録・ログイン
- ✅ セッション管理
- ✅ パスワードハッシュ化
- ✅ Row Level Security

### チーム管理
- ✅ チーム作成・編集・削除 (最大4チーム)
- ✅ チーム一覧表示
- ✅ チーム詳細表示

### 選手管理
- ✅ 選手登録・編集・削除 (最大9人/チーム)
- ✅ 打撃成績入力
- ✅ 統計値計算 (打率、OBP、SLG、OPS)
- ✅ バリデーション (安打数チェック等)

### シミュレーション
- ✅ 単一試合シミュレーション
- ✅ シーズンシミュレーション (1-162試合)
- ✅ イニング数設定 (1-15)
- ✅ 確率ベースの打席結果予測
- ✅ 走者進塁ロジック
- ✅ 詳細統計表示

### 履歴機能
- ✅ シミュレーション結果保存
- ✅ 履歴一覧表示
- ✅ 履歴削除

### UI/UX
- ✅ レスポンシブデザイン
- ✅ ローディング状態表示
- ✅ エラーハンドリング
- ✅ トースト通知
- ✅ アクセシビリティ対応

### パフォーマンス
- ✅ React.memo最適化
- ✅ useMemoとuseCallback
- ✅ Next.js最適化設定
- ✅ 画像最適化設定

## ライセンス

MIT

## 作者

Created with [Claude Code](https://claude.com/claude-code)

## サポート

質問や問題がある場合は、GitHubのIssuesで報告してください。
