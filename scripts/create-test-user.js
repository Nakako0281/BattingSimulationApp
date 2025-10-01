const bcryptjs = require('bcryptjs');

// パスワードをハッシュ化
const password = 'testpass123'; // 好きなパスワードに変更
const hash = bcryptjs.hashSync(password, 10);

console.log('========================================');
console.log('テストユーザー作成用のSQL');
console.log('========================================');
console.log('');
console.log('ニックネーム: testuser');
console.log('パスワード: ' + password);
console.log('');
console.log('以下のSQLをSupabaseのSQL Editorで実行してください:');
console.log('');
console.log(`INSERT INTO users (nickname, password_hash)`);
console.log(`VALUES ('testuser', '${hash}');`);
console.log('');
console.log('========================================');
