import type { AgentEvent, EventStoreState } from "@/lib/events/types";
import type { AgentStatus, ChatStatus } from "@/lib/types/agent";

export function selectEventCountsByType(
  state: EventStoreState,
): Record<string, number> {
  return state.events.reduce<Record<string, number>>((counts, event) => {
    counts[event.type] = (counts[event.type] ?? 0) + 1;
    return counts;
  }, {});
}

export function selectTotalDurationMs(state: EventStoreState): number {
  return state.events.reduce((total, event) => total + (event.duration ?? 0), 0);
}

export function selectRunningEvent(state: EventStoreState): AgentEvent | null {
  return state.events.find((event) => event.status === "running") ?? null;
}

export function selectRunningEventId(state: EventStoreState): string | null {
  return selectRunningEvent(state)?.id ?? null;
}

export function selectEventById(
  state: EventStoreState,
  id: string | null,
): AgentEvent | null {
  if (!id) return null;
  return state.eventsById[id] ?? null;
}

export function selectHasFailedEvents(state: EventStoreState): boolean {
  return state.events.some((event) => event.status === "error");
}

export function selectAgentStatusFromEvents(
  state: EventStoreState,
  chatStatus: ChatStatus,
): AgentStatus {
  if (chatStatus === "error" || selectHasFailedEvents(state)) return "error";
  if (
    chatStatus === "submitted" ||
    chatStatus === "streaming" ||
    selectRunningEvent(state) !== null
  ) {
    return "running";
  }
  return "idle";
}

// Debug panel only — keep base64 out of the JSON dump.
export function selectEventsForDebug(state: EventStoreState): AgentEvent[] {
  return state.events.map((event) => ({
    ...event,
    result:
      event.result &&
      typeof event.result !== "string" &&
      event.result.type === "image"
        ? { type: "image" as const, data: `[base64 ${event.result.data.length} chars]` }
        : event.result,
  }));
}
