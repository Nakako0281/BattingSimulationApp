"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, type LoginInput } from "@/lib/utils/validation";
import { z } from "zod";

export default function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginInput>({
    nickname: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name as keyof LoginInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setErrorMessage("");
    setIsLoading(true);

    try {
      // バリデーション
      const validatedData = loginSchema.parse(formData);

      // ログイン処理
      const result = await login(validatedData.nickname, validatedData.password);

      if (!result.success) {
        setErrorMessage(result.error || "ログインに失敗しました");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof LoginInput, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginInput] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrorMessage("ログインに失敗しました。もう一度お試しください。");
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
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.nickname ? "border-red-500" : "border-gray-300"
          } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
          placeholder="your_nickname"
        />
        {errors.nickname && (
          <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
        )}
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
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.password ? "border-red-500" : "border-gray-300"
          } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? "ログイン中..." : "ログイン"}
      </button>

      <p className="text-center text-sm text-gray-600">
        アカウントをお持ちでない方は{" "}
        <a href="/register" className="text-blue-600 hover:underline">
          新規登録
        </a>
      </p>
    </form>
  );
}
