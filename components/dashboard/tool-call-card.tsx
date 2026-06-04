"use client";

import {
  Camera,
  CheckCircle2,
  CircleSlash,
  Clock,
  Keyboard,
  KeyRound,
  Loader2,
  MousePointer,
  MousePointerClick,
  ScrollText,
  Terminal,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";

import { formatDurationMs } from "@/lib/events/format";
import { cn } from "@/lib/utils";
import {
  getToolCallLabel,
  getToolCallTypeLabel,
} from "@/lib/tool-calls/labels";
import type { ToolCall, ToolCallStatus } from "@/lib/types/tool-call";
import type { ChatStatus } from "@/lib/types/agent";

const STATUS_ICON: Record<
  ToolCallStatus,
  { Icon: typeof CheckCircle2; className: string }
> = {
  pending: { Icon: Clock, className: "text-zinc-400" },
  running: { Icon: Loader2, className: "text-blue-500 animate-spin" },
  completed: { Icon: CheckCircle2, className: "text-emerald-600" },
  aborted: { Icon: CircleSlash, className: "text-amber-600" },
  error: { Icon: XCircle, className: "text-red-500" },
};

function getActionIcon(toolCall: ToolCall) {
  if (toolCall.toolName === "bash") return Terminal;

  switch (toolCall.args.action) {
    case "screenshot":
      return Camera;
    case "left_click":
    case "mouse_move":
      return MousePointer;
    case "right_click":
    case "double_click":
      return MousePointerClick;
    case "type":
      return Keyboard;
    case "key":
      return KeyRound;
    case "wait":
      return Clock;
    case "scroll":
      return ScrollText;
    default:
      return MousePointer;
  }
}

function formatResultForPreview(result: ToolCall["result"]): string | null {
  if (result === undefined) return null;
  if (typeof result === "string") return result;
  if (result.type === "text") return result.text;
  if (result.type === "image") return "Screenshot captured";
  return null;
}

interface ToolCallCardProps {
  toolCall: ToolCall;
  selected: boolean;
  isLatestMessage: boolean;
  chatStatus: ChatStatus;
  onSelect: (id: string) => void;
}

export function ToolCallCard({
  toolCall,
  selected,
  isLatestMessage,
  chatStatus,
  onSelect,
}: ToolCallCardProps) {
  const label = getToolCallLabel(toolCall);
  const ActionIcon = getActionIcon(toolCall);
  const statusConfig = STATUS_ICON[toolCall.status];
  const { Icon: StatusIcon, className: statusClassName } = statusConfig;

  const showRunning =
    toolCall.status === "running" &&
    isLatestMessage &&
    chatStatus !== "ready";

  const resultPreview = formatResultForPreview(toolCall.result);
  const isScreenshot =
    toolCall.toolName === "computer" &&
    toolCall.args.action === "screenshot" &&
    toolCall.result &&
    typeof toolCall.result !== "string" &&
    toolCall.result.type === "image";

  return (
    <motion.button
      type="button"
      initial={{ y: 4, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      onClick={() => onSelect(toolCall.id)}
      className={cn(
        "mb-3 w-full rounded-lg border p-2.5 text-left text-sm transition-colors",
        "hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-zinc-200 bg-zinc-50",
      )}
      aria-pressed={selected}
      aria-label={`${getToolCallTypeLabel(toolCall)} — ${label.title}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <ActionIcon className="size-4 text-zinc-600" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium font-mono text-xs uppercase tracking-wide text-zinc-500">
              {getToolCallTypeLabel(toolCall)}
            </span>
            <span className="truncate font-medium">{label.title}</span>
            {label.detail ? (
              <span className="truncate text-xs text-muted-foreground">
                {label.detail}
              </span>
            ) : null}
          </div>
          {resultPreview ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {resultPreview}
            </p>
          ) : null}
        </div>

        <StatusIcon className={cn("size-4 shrink-0", statusClassName)} />
      </div>

      {toolCall.durationMs != null && toolCall.durationMs > 0 ? (
        <p className="mt-1.5 text-right text-[10px] tabular-nums text-muted-foreground">
          {formatDurationMs(toolCall.durationMs)}
        </p>
      ) : null}

      {isScreenshot &&
      toolCall.result &&
      typeof toolCall.result !== "string" &&
      toolCall.result.type === "image" ? (
        <div className="mt-2 overflow-hidden rounded-md border border-zinc-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${toolCall.result.data}`}
            alt="Screenshot result"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ) : toolCall.toolName === "computer" &&
        toolCall.args.action === "screenshot" &&
        showRunning ? (
        <div className="mt-2 aspect-[4/3] w-full animate-pulse rounded-md bg-zinc-200" />
      ) : null}
    </motion.button>
  );
}
