# 🚀 Vercel デプロイチェックリスト

## ✅ デプロイ前の確認事項

### コード品質
- [ ] すべてのテストが成功 (`npm test`)
- [ ] ビルドが成功 (`npm run build`)
- [ ] Lint エラーなし (`npm run lint`)
- [ ] 型エラーなし (`npx tsc --noEmit`)

### 環境設定
- [ ] `.env.example` が最新
- [ ] `.env.local` がgitignoreに含まれている
- [ ] 本番用の `NEXTAUTH_SECRET` を生成済み (`openssl rand -base64 32`)

### データベース
- [ ] Supabaseプロジェクトが稼働中
- [ ] スキーマが最新 (`supabase/schema.sql`)
- [ ] RLSポリシーが適用済み (`supabase/fix-rls-complete.sql`)
- [ ] simulation_resultsテーブルが作成済み (`supabase/simulation-results-v2.sql`)

### セキュリティ
- [ ] 全てのAPIルートに認証チェック実装済み
- [ ] 本番用の強力な NEXTAUTH_SECRET
- [ ] Supabase URL と Anon Key が本番用
- [ ] コンソールログが本番で無効化 (next.config.ts設定済み)

## 📦 Vercel デプロイ手順

### 1. GitHubにプッシュ
```bash
git add .
git commit -m "feat: Ready for production deployment"
git push origin main
```

### 2. Vercelでプロジェクト作成
1. https://vercel.com/dashboard にアクセス
2. "Add New..." → "Project"
3. GitHubリポジトリをインポート
4. Framework: **Next.js** (自動検出)

### 3. 環境変数を設定

以下をVercelの Environment Variables に追加：

```
NEXT_PUBLIC_SUPABASE_URL
→ あなたのSupabaseプロジェクトURL

NEXT_PUBLIC_SUPABASE_ANON_KEY  
→ あなたのSupabase匿名キー

NEXTAUTH_SECRET
→ openssl rand -base64 32 で生成した値

NEXTAUTH_URL
→ https://your-app.vercel.app (デプロイ後に更新)

NEXT_PUBLIC_APP_URL
→ https://your-app.vercel.app (デプロイ後に更新)
```

### 4. デプロイ実行
"Deploy" ボタンをクリック（2-3分）

### 5. デプロイ後の設定

#### URLを更新
1. Vercelで実際のURLを確認
2. Settings → Environment Variables で以下を更新：
   - `NEXTAUTH_URL`: 実際のVercel URL
   - `NEXT_PUBLIC_APP_URL`: 実際のVercel URL  
3. Deployments → 最新 → "..." → "Redeploy"

#### Supabase設定
Supabase → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

## ✅ デプロイ後の動作確認

### 基本機能
- [ ] トップページが表示される
- [ ] ユーザー登録ができる (`/register`)
- [ ] ログインができる (`/login`)
- [ ] ログアウトができる

### チーム・選手管理  
- [ ] チーム作成ができる
- [ ] チーム編集ができる
- [ ] チーム削除ができる
- [ ] 選手追加ができる
- [ ] 選手編集ができる
- [ ] 選手削除ができる

### シミュレーション
- [ ] 単一試合シミュレーションが実行できる
- [ ] シーズンシミュレーションが実行できる
- [ ] 結果が正しく表示される
- [ ] 結果を保存できる
- [ ] 履歴が表示される
- [ ] 履歴を削除できる

### セキュリティ
- [ ] 他のユーザーのデータが見えない
- [ ] ログアウト後はアクセスできない
- [ ] APIエンドポイントが保護されている

### パフォーマンス
- [ ] ページ読み込みが3秒以内
- [ ] シミュレーション実行が10秒以内
- [ ] モバイルでも動作がスムーズ

### レスポンシブ
- [ ] スマートフォン (320px〜)
- [ ] タブレット (768px〜)
- [ ] デスクトップ (1024px〜)

## 🔧 トラブルシューティング

### ビルドエラー
```bash
# ローカルでビルドテスト
npm run build

# 型エラー確認
npx tsc --noEmit

# Lint確認
npm run lint
```

### 認証エラー
- NEXTAUTH_URL が正しいか確認
- NEXTAUTH_SECRET が設定されているか確認
- Supabase Redirect URLs が設定されているか確認

### データベースエラー
- Supabase URL/Key が正しいか確認
- RLSポリシーが適用されているか確認
- テーブルが作成されているか確認

## 📊 監視とメンテナンス

### Vercel Dashboard
- **Analytics**: ページビュー、訪問者数
- **Logs**: エラーログ、アクセスログ
- **Deployments**: デプロイ履歴

### 定期的な確認
- [ ] 週次: エラーログ確認
- [ ] 月次: パフォーマンス確認
- [ ] 月次: セキュリティアップデート

## 🎉 完了！

おめでとうございます！アプリケーションが本番環境で稼働しています。

**URL**: https://your-app.vercel.app

次のステップ:
- カスタムドメイン設定（オプション）
- Vercel Analytics有効化
- パフォーマンス監視設定
