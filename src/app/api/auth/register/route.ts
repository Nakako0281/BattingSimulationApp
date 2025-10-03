import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/auth/password";
import { registerRateLimiter } from "@/lib/auth/rate-limiter";
import { registerSchema } from "@/lib/utils/validation";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    // IPアドレスを取得してレート制限をチェック
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimit = registerRateLimiter.check(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please try again in ${Math.ceil(
            (rateLimit.resetTime - Date.now()) / (1000 * 60)
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // バリデーション
    const validatedData = registerSchema.parse(body);

    const supabase = createServerClient();

    // ニックネームの重複チェック
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("nickname", validatedData.nickname)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "このニックネームは既に使用されています" },
        { status: 400 }
      );
    }

    // パスワードをハッシュ化
    const password_hash = await hashPassword(validatedData.password);

    // ユーザーを作成
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        nickname: validatedData.nickname,
        password_hash,
      })
      .select()
      .single();

    if (error) {
      console.error("Registration error:", error);
      return NextResponse.json(
        { error: "登録に失敗しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    // レート制限をリセット（成功した場合）
    registerRateLimiter.reset(ip);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          nickname: newUser.nickname,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "入力データが無効です", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "登録に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
