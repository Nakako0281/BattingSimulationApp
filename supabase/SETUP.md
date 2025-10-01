# Supabase Setup Guide

このドキュメントでは、Baseball Batting Simulator用のSupabaseプロジェクトをセットアップする手順を説明します。

## 手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてログイン
2. 「New Project」をクリック
3. プロジェクト情報を入力:
   - **Name**: `batting-simulation-app`
   - **Database Password**: 安全なパスワードを生成（メモしておく）
   - **Region**: `Tokyo (ap-northeast-1)` または最寄りのリージョン
4. 「Create new project」をクリック

### 2. データベーステーブルの作成

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `supabase/schema.sql`ファイルの内容をコピー
3. SQL Editorに貼り付けて「Run」をクリック

### 3. 認証設定

1. Supabaseダッシュボードで「Authentication」→「Providers」を開く
2. 必要に応じて認証プロバイダーを設定（デフォルトのEmail認証を使用）

### 4. API KeyとURLの取得

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の情報をメモ:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`（公開APIキー）

### 5. 環境変数の設定　（スキップでOK）

プロジェクトルートに`.env.local`ファイルを作成し、以下を設定:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=（openssl rand -base64 32で生成）
\`\`\`

## テーブル構造の確認

作成されたテーブル:

### users
- `id` (UUID, Primary Key)
- `nickname` (VARCHAR(50), UNIQUE)
- `password_hash` (VARCHAR(255))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### teams
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users)
- `name` (VARCHAR(100))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### players
- `id` (UUID, Primary Key)
- `team_id` (UUID, Foreign Key → teams)
- `name` (VARCHAR(100))
- `batting_order` (INTEGER, 1-9)
- `singles`, `doubles`, `triples`, `home_runs` (INTEGER)
- `walks`, `strikeouts`, `groundouts`, `flyouts` (INTEGER)
- `at_bats` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Row Level Security (RLS)

RLSポリシーが自動的に設定されています:
- ユーザーは自分自身のデータのみアクセス可能
- チームは所有者のみCRUD操作可能
- 選手は所有チームに対してのみCRUD操作可能

## トラブルシューティング

### エラー: "permission denied for table users"
- RLSが有効になっており、認証なしではアクセスできません
- NextAuthで認証後にアクセスしてください

### エラー: "duplicate key value violates unique constraint"
- ニックネームが既に使用されています
- 別のニックネームを使用してください

## サンプルデータの投入（オプション）

テスト用にサンプルデータを投入する場合:
1. `supabase/schema.sql`の最後のコメントを解除
2. SQL Editorで実行

**注意**: サンプルデータにはハッシュ化されていないパスワードが含まれているため、本番環境では使用しないでください。
