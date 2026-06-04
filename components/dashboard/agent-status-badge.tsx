import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/types/agent";

const STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; dotClass: string; badgeClass: string }
> = {
  idle: {
    label: "Ready",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  running: {
    label: "Running",
    dotClass: "bg-blue-500 animate-pulse",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  error: {
    label: "Error",
    dotClass: "bg-red-500",
    badgeClass: "bg-red-50 text-red-700 border-red-200",
  },
};

export function AgentStatusBadge({ status }: { status: AgentStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.badgeClass,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
