import type { ReactNode } from "react";
import { cn } from "@plane/utils";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface TabProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function Tab({ items, defaultTab, onChange }: TabProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || items[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeItem = items.find((item) => item.id === activeTab);

  return (
    <div className="w-full">
      {/* Tab List */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={cn(
              "px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2",
              activeTab === item.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeItem && <div className="mt-4">{activeItem.content}</div>}
    </div>
  );
}

import React from "react";
