"use client";

import { ChevronDown, ChevronUp, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DebugPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebugPanel({ open, onOpenChange }: DebugPanelProps) {
  return (
    <div className="border-t border-border">
      <Button
        type="button"
        variant="ghost"
        onClick={() => onOpenChange(!open)}
        className="flex h-9 w-full items-center justify-between rounded-none px-4 text-xs font-medium text-muted-foreground hover:bg-muted/50"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <Terminal className="size-3.5" />
          Debug panel
        </span>
        {open ? (
          <ChevronDown className="size-3.5" />
        ) : (
          <ChevronUp className="size-3.5" />
        )}
      </Button>

      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-200 ease-in-out",
          open ? "max-h-48" : "max-h-0",
        )}
      >
        <div className="border-t border-border bg-zinc-950 px-4 py-3">
          <pre className="overflow-auto text-[11px] leading-relaxed text-zinc-400 font-mono">
            {JSON.stringify(
              {
                store: "Event store not connected",
                phase: "Phase 2 — wire typed event pipeline here",
                events: [],
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
