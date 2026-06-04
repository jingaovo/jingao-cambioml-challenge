import type { AgentEvent } from "@/lib/events/types";
import type { ToolCall } from "@/lib/types/tool-call";

export function agentEventToToolCall(event: AgentEvent): ToolCall {
  const base = {
    id: event.id,
    messageId: event.messageId,
    status: event.status,
    timestamp: event.timestamp,
    durationMs: event.duration,
  };

  if (event.toolName === "computer") {
    return {
      ...base,
      toolName: "computer",
      args: event.payload,
      result: event.result,
    };
  }

  return {
    ...base,
    toolName: "bash",
    args: event.payload,
    result: event.result,
  };
}

export function agentEventsToToolCalls(events: AgentEvent[]): ToolCall[] {
  return events.map(agentEventToToolCall);
}
