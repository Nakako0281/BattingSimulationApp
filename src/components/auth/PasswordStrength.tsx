"use client";

import { checkPasswordStrength } from "@/lib/auth/password";

interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, feedback } = checkPasswordStrength(password);

  const strengthLabels = ["非常に弱い", "弱い", "普通", "強い", "非常に強い"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-600",
  ];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${strengthColors[score]}`}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium">{strengthLabels[score]}</span>
      </div>
      {feedback.length > 0 && (
        <ul className="text-xs text-gray-600 space-y-1">
          {feedback.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
