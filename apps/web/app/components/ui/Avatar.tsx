import type { ReactNode } from "react";
import { cn } from "@plane/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  children?: ReactNode;
  fallbackBgColor?: string;
}

export function Avatar({
  src,
  alt = "Avatar",
  initials,
  size = "md",
  className,
  children,
  fallbackBgColor = "bg-blue-500",
}: AvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white",
        fallbackBgColor,
        sizeClasses[size],
        className
      )}
    >
      {children || initials}
    </div>
  );
}
