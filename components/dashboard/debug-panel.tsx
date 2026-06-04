"use client";

import { ChevronDown, ChevronUp, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDurationMs, formatEventTime, formatTotalDuration } from "@/lib/events/format";
import type { AgentEvent } from "@/lib/events/types";
import type { AgentStatus } from "@/lib/types/agent";
import { cn } from "@/lib/utils";

interface DebugPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentStatus: AgentStatus;
  events: AgentEvent[];
  eventCounts: Record<string, number>;
  totalDurationMs: number;
}

const STATUS_DOT: Record<AgentStatus, string> = {
  idle: "bg-emerald-500",
  running: "bg-blue-500 animate-pulse",
  error: "bg-red-500",
};

export function DebugPanel({
  open,
  onOpenChange,
  agentStatus,
  events,
  eventCounts,
  totalDurationMs,
}: DebugPanelProps) {
  const countEntries = Object.entries(eventCounts);

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
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
            {events.length}
          </span>
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
          open ? "max-h-72" : "max-h-0",
        )}
      >
        <div className="space-y-3 border-t border-border bg-zinc-950 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <StatPill
              label="Agent"
              value={agentStatus}
              dotClass={STATUS_DOT[agentStatus]}
            />
            <StatPill label="Events" value={String(events.length)} />
            <StatPill
              label="Total duration"
              value={formatTotalDuration(totalDurationMs)}
            />
          </div>

          {countEntries.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {countEntries.map(([type, count]) => (
                <span
                  key={type}
                  className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400"
                >
                  {type}: {count}
                </span>
              ))}
            </div>
          ) : null}

          <div className="max-h-24 overflow-y-auto rounded-md border border-zinc-800">
            {events.length === 0 ? (
              <p className="px-3 py-2 text-[11px] text-zinc-500">
                No tool events yet
              </p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between gap-3 px-3 py-1.5 font-mono text-[10px]"
                  >
                    <span className="truncate text-zinc-300">{event.type}</span>
                    <span className="shrink-0 text-zinc-500">
                      {event.status}
                    </span>
                    <span className="shrink-0 tabular-nums text-zinc-500">
                      {formatDurationMs(event.duration)}
                    </span>
                    <span className="shrink-0 text-zinc-600">
                      {formatEventTime(event.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <pre className="max-h-28 overflow-auto text-[10px] leading-relaxed text-zinc-500 font-mono">
            {JSON.stringify({ events, eventCounts, totalDurationMs }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  dotClass,
}: {
  label: string;
  value: string;
  dotClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-400">
      {dotClass ? (
        <span className={cn("size-1.5 rounded-full", dotClass)} />
      ) : null}
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-300">{value}</span>
    </span>
  );
}
