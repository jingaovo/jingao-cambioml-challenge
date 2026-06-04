"use client";

import { MousePointerClick } from "lucide-react";

import { formatDurationMs, formatEventTime } from "@/lib/events/format";
import type { AgentEvent } from "@/lib/events/types";
import {
  getToolCallLabel,
  getToolCallTypeLabel,
} from "@/lib/tool-calls/labels";
import { agentEventToToolCall } from "@/lib/events/to-tool-call";
import type { ToolCallStatus } from "@/lib/types/tool-call";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ToolCallStatus, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  aborted: "Aborted",
  error: "Failed",
};

function serializeResult(result: AgentEvent["result"]): unknown {
  if (result === undefined) return null;
  if (typeof result === "string") return result;
  if (result.type === "image") {
    return { type: "image", data: `[base64 ${result.data.length} chars]` };
  }
  return result;
}

interface ToolDetailPanelProps {
  event: AgentEvent | null;
}

export function ToolDetailPanel({ event }: ToolDetailPanelProps) {
  if (!event) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
        <MousePointerClick className="size-6 opacity-40" />
        <p className="text-sm">Select a tool call to inspect details</p>
        <p className="text-xs">
          Payload, result, and timing will appear here
        </p>
      </div>
    );
  }

  const toolCall = agentEventToToolCall(event);
  const label = getToolCallLabel(toolCall);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {getToolCallTypeLabel(toolCall)}
            </p>
            <h3 className="mt-0.5 text-sm font-semibold">{label.title}</h3>
            {label.detail ? (
              <p className="text-xs text-muted-foreground">{label.detail}</p>
            ) : null}
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              event.status === "completed" && "bg-emerald-50 text-emerald-700",
              event.status === "running" && "bg-blue-50 text-blue-700",
              event.status === "aborted" && "bg-amber-50 text-amber-700",
              event.status === "error" && "bg-red-50 text-red-700",
              event.status === "pending" && "bg-zinc-100 text-zinc-600",
            )}
          >
            {STATUS_LABEL[event.status]}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <DetailSection title="Timing">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <MetaItem label="Started" value={formatEventTime(event.timestamp)} />
            <MetaItem
              label="Duration"
              value={formatDurationMs(event.duration)}
            />
            <MetaItem
              label="Completed"
              value={
                event.completedAt
                  ? formatEventTime(event.completedAt)
                  : "In progress"
              }
            />
          </div>
        </DetailSection>

        <DetailSection title="Tool call ID">
          <code className="text-xs text-zinc-600">{event.id}</code>
        </DetailSection>

        <DetailSection title="Payload">
          <JsonBlock value={event.payload} />
        </DetailSection>

        <DetailSection title="Result">
          <JsonBlock value={serializeResult(event.result)} />
        </DetailSection>

        {event.toolName === "computer" &&
        event.payload.action === "screenshot" &&
        event.result &&
        typeof event.result !== "string" &&
        event.result.type === "image" ? (
          <DetailSection title="Screenshot preview">
            <div className="overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${event.result.data}`}
                alt="Tool result screenshot"
                className="w-full"
              />
            </div>
          </DetailSection>
        ) : null}
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-medium tabular-nums">{value}</p>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-zinc-950 p-3 text-[11px] leading-relaxed text-zinc-300 font-mono">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
