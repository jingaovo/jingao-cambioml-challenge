"use client";

import { cn } from "@/lib/utils";

export type MobileTab = "chat" | "desktop" | "details";

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const TABS: { id: MobileTab; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "desktop", label: "Desktop" },
  { id: "details", label: "Details" },
];

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <nav
      className="grid grid-cols-3 border-t border-border bg-background"
      aria-label="Dashboard sections"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "py-2.5 text-xs font-medium transition-colors",
            activeTab === tab.id
              ? "border-t-2 border-primary text-primary"
              : "border-t-2 border-transparent text-muted-foreground hover:text-foreground",
          )}
          aria-current={activeTab === tab.id ? "page" : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
