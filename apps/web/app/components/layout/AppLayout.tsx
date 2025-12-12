import type { ReactNode } from "react";
import { cn } from "@plane/utils";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppLayoutProps {
  children: ReactNode;
  activeRoute?: string;
  topbarTitle?: string;
  topbarSubtitle?: string;
  topbarActions?: ReactNode;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  hideTopbar?: boolean;
  hideSidebar?: boolean;
}

export function AppLayout({
  children,
  activeRoute = "dashboard",
  topbarTitle,
  topbarSubtitle,
  topbarActions,
  showSearch = true,
  onSearch,
  hideTopbar = false,
  hideSidebar = false,
}: AppLayoutProps) {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      {!hideSidebar && (
        <div className="flex-shrink-0 hidden md:block">
          <Sidebar activeRoute={activeRoute} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        {!hideTopbar && (
          <Topbar
            title={topbarTitle}
            subtitle={topbarSubtitle}
            actions={topbarActions}
            showSearch={showSearch}
            onSearch={onSearch}
          />
        )}

        {/* Content Area */}
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "bg-gradient-to-b from-slate-50 to-slate-100",
            "dark:from-slate-950 dark:to-slate-900"
          )}
        >
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
