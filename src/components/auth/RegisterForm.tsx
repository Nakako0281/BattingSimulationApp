"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { registerSchema, type RegisterInput } from "@/lib/utils/validation";
import { z } from "zod";
import PasswordStrength from "./PasswordStrength";

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterInput>({
    nickname: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage("");

    if (!agreed) {
      setErrorMessage("利用規約に同意してください");
      return;
    }

    setIsLoading(true);

    try {
      // バリデーション
      const validatedData = registerSchema.parse(formData);

      // 登録処理
      const result = await register(
        validatedData.nickname,
        validatedData.password,
        validatedData.confirmPassword
      );

      if (!result.success) {
        setErrorMessage(result.error || "登録に失敗しました");
        return;
      }

      // 登録成功後、ログインページへリダイレクト
      router.push("/login?registered=true");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof RegisterInput, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegisterInput] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrorMessage("登録に失敗しました。もう一度お試しください。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium mb-2">
          ニックネーム
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          value={formData.nickname}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
            errors.nickname ? "border-red-500" : "border-gray-300"
          } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
          placeholder="your_nickname"
        />
        {errors.nickname && (
          <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          3-50文字、英数字とアンダースコア、ハイフンのみ使用可能
        </p>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
            errors.password ? "border-red-500" : "border-gray-300"
          } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
        <PasswordStrength password={formData.password} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          パスワード（確認）
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
            errors.confirmPassword ? "border-red-500" : "border-gray-300"
          } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800 font-medium mb-2">⚠️ 重要な注意事項</p>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• パスワードのリセット機能はありません</li>
          <li>• ニックネームとパスワードは忘れないように記録してください</li>
          <li>• 他のサービスと同じパスワードは使用しないでください</li>
        </ul>
      </div>

      <div className="flex items-start">
        <input
          id="agree"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          disabled={isLoading}
          className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
          上記の注意事項を理解し、同意します
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !agreed}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? "登録中..." : "新規登録"}
      </button>

      <p className="text-center text-sm text-gray-600">
        既にアカウントをお持ちの方は{" "}
        <a href="/login" className="text-green-600 hover:underline">
          ログイン
        </a>
      </p>
    </form>
  );
}
