import { cn } from "@plane/utils";
import type { ReactNode } from "react";
import { useState } from "react";
import { BlurSurface } from "../ui/BlurSurface";
import { Input } from "../ui/Input";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function Topbar({
  title,
  subtitle,
  actions,
  showSearch = true,
  onSearch,
}: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <BlurSurface
      variant="light"
      rounded="none"
      border={false}
      shadow="none"
      className={cn(
        "h-16 flex items-center justify-between px-6",
        "border-b border-slate-200 dark:border-slate-800",
        "bg-white/50 dark:bg-slate-900/50"
      )}
    >
      {/* Left: Title and Subtitle */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Center: Search */}
      {showSearch && (
        <div className="flex-1 max-w-md mx-6">
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Right: Actions */}
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </BlurSurface>
  );
}
