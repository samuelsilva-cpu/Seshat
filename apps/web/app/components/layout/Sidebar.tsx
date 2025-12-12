import { Link } from "react-router";
import type { ReactNode } from "react";
import { cn } from "@plane/utils";
import { BlurSurface } from "../ui/BlurSurface";
import PlankLogo from "../ui/PlankLogo";
import PlankCatIcon from "../ui/PlankCatIcon";

interface NavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}

function NavItem({ icon, label, href, active = false, badge }: NavItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
        "text-sm font-medium",
        active
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
      )}
    >
      <span className="flex-shrink-0 text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="flex-shrink-0 bg-blue-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </Link>
  );
}

interface SidebarProps {
  activeRoute?: string;
  userInitials?: string;
  userName?: string;
  userAvatar?: string;
  collapsed?: boolean;
}

export function Sidebar({
  activeRoute = "dashboard",
  userInitials = "U",
  userName = "User",
  userAvatar,
  collapsed = false,
}: SidebarProps) {
  return (
    <BlurSurface
      variant="light"
      rounded="none"
      border={false}
      shadow="none"
      className={cn(
        "h-screen overflow-y-auto transition-all duration-300",
        collapsed ? "w-20" : "w-64",
        "flex flex-col",
        "border-r border-slate-200 dark:border-slate-800",
        "bg-white/50 dark:bg-slate-900/50"
      )}
    >
      {/* Logo / Brand */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <Link
          to="/app"
          className={cn(
            "flex items-center gap-3 rounded-lg transition-opacity duration-200 hover:opacity-75",
            "text-slate-900 dark:text-slate-100"
          )}
        >
          {collapsed ? (
            <PlankCatIcon size={32} className="text-slate-900 dark:text-slate-100" />
          ) : (
            <PlankLogo
              compact={false}
              size={24}
              className="text-slate-900 dark:text-slate-100"
            />
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavItem
          icon="📊"
          label="Dashboard"
          href="/app"
          active={activeRoute === "dashboard"}
        />
        <NavItem
          icon="📁"
          label="Projects"
          href="/app/projects"
          active={activeRoute === "projects"}
        />
        <NavItem
          icon="✓"
          label="Issues"
          href="/app/issues"
          active={activeRoute === "issues"}
        />
        <NavItem
          icon="📋"
          label="Board"
          href="/app/board"
          active={activeRoute === "board"}
        />

        {/* Divider */}
        <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

        {/* Quick Access - Placeholder for future */}
        {!collapsed && (
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Pinned
            </p>
          </div>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-lg",
          "hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-200",
          collapsed && "justify-center"
        )}>
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {userInitials}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {userName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Profile</p>
            </div>
          )}
        </button>
      </div>
    </BlurSurface>
  );
}
