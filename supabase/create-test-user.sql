-- ============================================
-- テストユーザーの作成
-- ============================================

-- 注意: このSQLを実行する前に、bcryptjsでパスワードをハッシュ化する必要があります
-- 以下のNode.jsコードを実行してハッシュを生成してください：

/*
Node.jsでパスワードハッシュを生成する方法:

const bcrypt = require('bcryptjs');
const password = 'your_password_here';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
*/

-- 例: パスワード "testpass123" のハッシュ
-- $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

-- テストユーザーを作成
INSERT INTO users (nickname, password_hash)
VALUES (
  'testuser',
  '$2a$10$YourHashedPasswordHere'  -- ここに生成したハッシュを入れてください
);

-- 作成したユーザーを確認
SELECT id, nickname, created_at FROM users WHERE nickname = 'testuser';
