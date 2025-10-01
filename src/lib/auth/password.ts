import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * パスワードをハッシュ化する
 * @param password - プレーンテキストのパスワード
 * @returns ハッシュ化されたパスワード
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * パスワードを検証する
 * @param password - プレーンテキストのパスワード
 * @param hashedPassword - ハッシュ化されたパスワード
 * @returns パスワードが一致する場合true
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * パスワード強度をチェックする
 * @param password - チェックするパスワード
 * @returns 強度スコア (0-4) とフィードバックメッセージ
 */
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // 長さチェック
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push("8文字以上にしてください");
  }

  // 大文字チェック
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push("大文字を含めてください");
  }

  // 小文字チェック
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push("小文字を含めてください");
  }

  // 数字チェック
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("数字を含めてください");
  }

  // 特殊文字チェック
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push("特殊文字(!@#$%など)を含めることを推奨します");
  }

  return { score: Math.min(score, 4), feedback };
}
