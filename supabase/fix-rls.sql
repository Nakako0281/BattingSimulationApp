-- ============================================
-- RLS Policy Fix for User Registration
-- ============================================

-- USERS: 新規登録を許可するポリシーを追加
-- 既存のポリシーを削除
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;

-- 新しいポリシーを作成

-- 1. 誰でも新規ユーザーを作成できる（登録用）
CREATE POLICY users_insert_public ON users
  FOR INSERT
  WITH CHECK (true);

-- 2. ユーザーは自分自身のデータを閲覧できる
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- 3. ユーザーは自分自身のデータを更新できる
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================
-- 代替案: auth.uid() を使用する場合
-- ============================================
-- もしauth.uid()が使えない場合は、以下のポリシーを使用してください：

/*
-- USERS: 誰でも新規登録できる
CREATE POLICY users_insert_public ON users
  FOR INSERT
  WITH CHECK (true);

-- USERS: 自分のデータのみ閲覧
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (true); -- または特定の条件を追加

-- USERS: 自分のデータのみ更新
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (true); -- または特定の条件を追加
*/
