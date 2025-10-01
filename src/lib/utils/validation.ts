import { z } from "zod";

/**
 * ログインフォームのバリデーションスキーマ
 */
export const loginSchema = z.object({
  nickname: z
    .string()
    .min(3, "ニックネームは3文字以上である必要があります")
    .max(50, "ニックネームは50文字以下である必要があります")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "ニックネームは英数字、アンダースコア、ハイフンのみ使用できます"
    ),
  password: z
    .string()
    .min(8, "パスワードは8文字以上である必要があります")
    .max(100, "パスワードは100文字以下である必要があります"),
});

/**
 * 新規登録フォームのバリデーションスキーマ
 */
export const registerSchema = z
  .object({
    nickname: z
      .string()
      .min(3, "ニックネームは3文字以上である必要があります")
      .max(50, "ニックネームは50文字以下である必要があります")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "ニックネームは英数字、アンダースコア、ハイフンのみ使用できます"
      ),
    password: z
      .string()
      .min(8, "パスワードは8文字以上である必要があります")
      .max(100, "パスワードは100文字以下である必要があります"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
