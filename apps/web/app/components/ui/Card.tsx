import type { ReactNode } from "react";
import { cn } from "@plane/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export function Card({
  children,
  className,
  variant = "default",
  padding = "md",
  interactive = false,
}: CardProps) {
  const variantClasses = {
    default: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
    glass: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/30",
    bordered: "bg-transparent border border-slate-200 dark:border-slate-700",
  };

  const paddingClasses = {
    none: "p-0",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-xl shadow-sm transition-all",
        variantClasses[variant],
        paddingClasses[padding],
        interactive && "hover:shadow-md cursor-pointer hover:border-blue-300 dark:hover:border-blue-700",
        className
      )}
    >
      {children}
    </div>
  );
}
