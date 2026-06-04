import { Bot } from "lucide-react";

import { AgentStatusBadge } from "@/components/dashboard/agent-status-badge";
import type { AgentStatus } from "@/lib/types/agent";

export function ChatHeader({ agentStatus }: { agentStatus: AgentStatus }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bot className="size-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-none">Agent Dashboard</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Computer use agent
          </p>
        </div>
      </div>
      <AgentStatusBadge status={agentStatus} />
    </header>
  );
}
