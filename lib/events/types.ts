import type {
  BashToolArgs,
  ComputerAction,
  ComputerToolArgs,
  ToolCallStatus,
  ToolResult,
} from "@/lib/types/tool-call";

export type EventType = `computer.${ComputerAction}` | "bash";

export interface AgentEventBase {
  id: string;
  messageId: string;
  timestamp: number;
  type: EventType;
  status: ToolCallStatus;
  duration: number | null;
  completedAt: number | null;
}

export interface ComputerAgentEvent extends AgentEventBase {
  toolName: "computer";
  type: `computer.${ComputerAction}`;
  payload: ComputerToolArgs;
  result?: ToolResult;
}

export interface BashAgentEvent extends AgentEventBase {
  toolName: "bash";
  type: "bash";
  payload: BashToolArgs;
  result?: ToolResult;
}

export type AgentEvent = ComputerAgentEvent | BashAgentEvent;

export interface EventStoreState {
  events: AgentEvent[];
  eventsById: Record<string, AgentEvent>;
}

export type EventAction =
  | { type: "EVENT_ADD"; event: AgentEvent }
  | {
      type: "EVENT_UPDATE";
      id: string;
      patch: Partial<
        Pick<AgentEvent, "status" | "result" | "duration" | "completedAt">
      >;
    }
  | { type: "RESET" };

export interface EventStoreSnapshot {
  state: EventStoreState;
  eventCounts: Record<string, number>;
  totalDurationMs: number;
  runningEventId: string | null;
}
