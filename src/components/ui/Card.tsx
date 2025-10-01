import { ReactNode, memo } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

function Card({ children, className = "", padding = "md" }: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

export default memo(Card);
