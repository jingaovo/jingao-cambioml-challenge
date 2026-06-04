import type { Message } from "ai";

import {
  parseBashArgs,
  parseComputerArgs,
  parseToolResult,
} from "@/lib/events/parse";
import type { AgentEvent, EventStoreState } from "@/lib/events/types";
import type { ComputerAction } from "@/lib/types/tool-call";
import type { ChatStatus } from "@/lib/types/agent";
import { ABORTED } from "@/lib/utils";

function createAgentEvent(
  toolCallId: string,
  messageId: string,
  toolName: string,
  args: unknown,
  timestamp: number,
): AgentEvent {
  if (toolName === "bash") {
    return {
      id: toolCallId,
      messageId,
      timestamp,
      type: "bash" as const,
      status: "pending",
      duration: null,
      completedAt: null,
      toolName: "bash",
      payload: parseBashArgs(args),
    };
  }

  const computerArgs = parseComputerArgs(args);
  return {
    id: toolCallId,
    messageId,
    timestamp,
    type: `computer.${computerArgs.action}` as `computer.${ComputerAction}`,
    status: "pending",
    duration: null,
    completedAt: null,
    toolName: "computer",
    payload: computerArgs,
  };
}

function finalizeEvent(
  event: AgentEvent,
  status: AgentEvent["status"],
  completedAt: number,
  result?: AgentEvent["result"],
): AgentEvent {
  return {
    ...event,
    status,
    result,
    completedAt,
    duration: completedAt - event.timestamp,
  };
}

function upsertEventMap(
  eventsById: Record<string, AgentEvent>,
  event: AgentEvent,
): Record<string, AgentEvent> {
  return { ...eventsById, [event.id]: event };
}

export function syncEventStore(
  messages: Message[],
  chatStatus: ChatStatus,
  previousState: EventStoreState,
): EventStoreState {
  let eventsById = { ...previousState.eventsById };
  const latestMessageId = messages.at(-1)?.id;
  const now = Date.now();

  for (const message of messages) {
    if (message.role !== "assistant" || !message.parts) continue;

    const isLatestMessage = message.id === latestMessageId;

    for (const part of message.parts) {
      if (part.type !== "tool-invocation") continue;

      const { toolCallId, toolName, state, args } = part.toolInvocation;
      let event = eventsById[toolCallId];

      if (!event) {
        event = createAgentEvent(toolCallId, message.id, toolName, args, now);
        eventsById = upsertEventMap(eventsById, event);
      }

      if (state === "result") {
        if (event.status === "completed" || event.status === "aborted") {
          continue;
        }

        const result =
          part.toolInvocation.state === "result"
            ? part.toolInvocation.result
            : undefined;
        const completedAt = now;

        if (result === ABORTED) {
          event = finalizeEvent(
            event,
            "aborted",
            completedAt,
            parseToolResult(result),
          );
        } else {
          event = finalizeEvent(
            event,
            "completed",
            completedAt,
            parseToolResult(result),
          );
        }

        eventsById = upsertEventMap(eventsById, event);
        continue;
      }

      if (
        (state === "call" || state === "partial-call") &&
        isLatestMessage &&
        chatStatus !== "ready" &&
        event.status !== "running"
      ) {
        event = { ...event, status: "running" };
        eventsById = upsertEventMap(eventsById, event);
        continue;
      }

      if (
        state === "call" &&
        (!isLatestMessage || chatStatus === "ready") &&
        event.status !== "completed" &&
        event.status !== "aborted" &&
        event.status !== "error"
      ) {
        event = finalizeEvent(event, "error", now);
        eventsById = upsertEventMap(eventsById, event);
      }
    }
  }

  const events = Object.values(eventsById).sort(
    (left, right) => left.timestamp - right.timestamp,
  );

  return { events, eventsById };
}
