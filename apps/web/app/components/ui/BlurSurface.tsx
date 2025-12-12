import type { ReactNode } from "react";
import { cn } from "@plane/utils";

interface BlurSurfaceProps {
  children: ReactNode;
  className?: string;
  variant?: "light" | "dark" | "minimal";
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl";
  border?: boolean;
  shadow?: "none" | "sm" | "md" | "lg";
}

export function BlurSurface({
  children,
  className,
  variant = "light",
  rounded = "xl",
  border = true,
  shadow = "sm",
}: BlurSurfaceProps) {
  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
  };

  const variantClasses = {
    light: "bg-white/80 dark:bg-slate-900/80",
    dark: "bg-slate-900/80 dark:bg-slate-950/80",
    minimal: "bg-transparent",
  };

  const shadowClasses = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  const borderClass = border ? "border border-white/20 dark:border-slate-700/30" : "";

  return (
    <div
      className={cn(
        "backdrop-blur-xl backdrop-filter",
        variantClasses[variant],
        roundedClasses[rounded],
        shadowClasses[shadow],
        borderClass,
        className
      )}
    >
      {children}
    </div>
  );
}
