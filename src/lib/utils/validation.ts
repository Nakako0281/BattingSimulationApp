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

/**
 * チーム作成のバリデーションスキーマ
 */
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "チーム名は必須です")
    .max(100, "チーム名は100文字以下である必要があります"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

/**
 * 選手作成のバリデーションスキーマ
 */
export const createPlayerSchema = z
  .object({
    team_id: z.string().uuid("Invalid team ID"),
    name: z
      .string()
      .min(1, "選手名は必須です")
      .max(100, "選手名は100文字以下である必要があります"),
    batting_order: z
      .number()
      .int("打順は整数である必要があります")
      .min(1, "打順は1以上である必要があります")
      .max(9, "打順は9以下である必要があります"),
    singles: z.number().int().min(0, "単打は0以上である必要があります").default(0),
    doubles: z.number().int().min(0, "二塁打は0以上である必要があります").default(0),
    triples: z.number().int().min(0, "三塁打は0以上である必要があります").default(0),
    home_runs: z.number().int().min(0, "本塁打は0以上である必要があります").default(0),
    walks: z.number().int().min(0, "四球は0以上である必要があります").default(0),
    strikeouts: z.number().int().min(0, "三振は0以上である必要があります").default(0),
    groundouts: z.number().int().min(0, "ゴロアウトは0以上である必要があります").default(0),
    flyouts: z.number().int().min(0, "フライアウトは0以上である必要があります").default(0),
    at_bats: z.number().int().min(0, "打数は0以上である必要があります").default(0),
  })
  .refine(
    (data) => {
      const hits = data.singles + data.doubles + data.triples + data.home_runs;
      return hits <= data.at_bats;
    },
    {
      message: "安打数が打数を超えることはできません",
      path: ["at_bats"],
    }
  );

/**
 * 選手更新のバリデーションスキーマ
 */
export const updatePlayerSchema = z.object({
  name: z
    .string()
    .min(1, "選手名は必須です")
    .max(100, "選手名は100文字以下である必要があります")
    .optional(),
  batting_order: z
    .number()
    .int("打順は整数である必要があります")
    .min(1, "打順は1以上である必要があります")
    .max(9, "打順は9以下である必要があります")
    .optional(),
  singles: z.number().int().min(0, "単打は0以上である必要があります").optional(),
  doubles: z.number().int().min(0, "二塁打は0以上である必要があります").optional(),
  triples: z.number().int().min(0, "三塁打は0以上である必要があります").optional(),
  home_runs: z.number().int().min(0, "本塁打は0以上である必要があります").optional(),
  walks: z.number().int().min(0, "四球は0以上である必要があります").optional(),
  strikeouts: z.number().int().min(0, "三振は0以上である必要があります").optional(),
  groundouts: z.number().int().min(0, "ゴロアウトは0以上である必要があります").optional(),
  flyouts: z.number().int().min(0, "フライアウトは0以上である必要があります").optional(),
  at_bats: z.number().int().min(0, "打数は0以上である必要があります").optional(),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
