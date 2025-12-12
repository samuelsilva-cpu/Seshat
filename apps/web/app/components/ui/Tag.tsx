import type { ReactNode } from "react";
import { cn } from "@plane/utils";

interface TagProps {
  children: ReactNode;
  color?: string; // HEX color
  variant?: "default" | "outline" | "subtle";
  size?: "sm" | "md";
  onRemove?: () => void;
  icon?: ReactNode;
}

export function Tag({
  children,
  color = "#3B82F6",
  variant = "default",
  size = "sm",
  onRemove,
  icon,
}: TagProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  // Convert hex to RGB for opacity
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "59, 130, 246";
  };

  const rgb = hexToRgb(color);

  const variantClasses = {
    default: `bg-[rgb(${rgb})] text-white`,
    outline: `border border-[${color}] text-[${color}]`,
    subtle: `bg-[rgba(${rgb},0.1)] text-[rgb(${rgb})]`,
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium transition-all",
        sizeClasses[size],
        variantClasses[variant]
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 hover:opacity-75 transition-opacity ml-1"
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </div>
  );
}
