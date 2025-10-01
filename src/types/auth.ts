/**
 * 認証関連の型定義
 */

export interface User {
  id: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface LoginCredentials {
  nickname: string;
  password: string;
}

export interface RegisterCredentials {
  nickname: string;
  password: string;
  confirmPassword: string;
}
