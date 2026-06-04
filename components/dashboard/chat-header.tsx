import { Bot } from "lucide-react";

import { AgentStatusBadge } from "@/components/dashboard/agent-status-badge";
import type { AgentStatus } from "@/lib/types/agent";

export function ChatHeader({
  agentStatus,
  sessionTitle,
}: {
  agentStatus: AgentStatus;
  sessionTitle: string;
}) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bot className="size-4" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold leading-none">
            {sessionTitle}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">Agent Dashboard</p>
        </div>
      </div>
      <AgentStatusBadge status={agentStatus} />
    </header>
  );
}
