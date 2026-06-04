import type { Message } from "ai";

import {
  parseBashArgs,
  parseComputerArgs,
  parseToolResult,
} from "@/lib/events/parse";
import { ABORTED } from "@/lib/utils";
import type { ChatStatus } from "@/lib/types/agent";
import type { ToolCall, ToolCallStatus } from "@/lib/types/tool-call";

function deriveToolCallStatus(
  state: "partial-call" | "call" | "result",
  result: unknown,
  isLatestMessage: boolean,
  chatStatus: ChatStatus,
): ToolCallStatus {
  if (state === "result") {
    if (result === ABORTED) return "aborted";
    return "completed";
  }

  if (
    (state === "call" || state === "partial-call") &&
    isLatestMessage &&
    chatStatus !== "ready"
  ) {
    return "running";
  }

  if (state === "call") return "error";
  return "pending";
}

export function extractToolCallsFromMessages(
  messages: Message[],
  chatStatus: ChatStatus,
): ToolCall[] {
  const toolCalls: ToolCall[] = [];
  const latestMessageId = messages.at(-1)?.id;

  for (const message of messages) {
    if (message.role !== "assistant" || !message.parts) continue;

    const isLatestMessage = message.id === latestMessageId;

    message.parts.forEach((part, index) => {
      if (part.type !== "tool-invocation") return;

      const { toolName, toolCallId, state, args } = part.toolInvocation;
      const result =
        state === "result" ? part.toolInvocation.result : undefined;
      const status = deriveToolCallStatus(
        state,
        result,
        isLatestMessage,
        chatStatus,
      );

      const base = {
        id: toolCallId,
        messageId: message.id,
        status,
        timestamp: index,
      };

      if (toolName === "computer") {
        toolCalls.push({
          ...base,
          toolName: "computer",
          args: parseComputerArgs(args),
          result: parseToolResult(result),
        });
        return;
      }

      if (toolName === "bash") {
        toolCalls.push({
          ...base,
          toolName: "bash",
          args: parseBashArgs(args),
          result: parseToolResult(result),
        });
      }
    });
  }

  return toolCalls;
}

export function findToolCallById(
  toolCalls: ToolCall[],
  id: string | null,
): ToolCall | null {
  if (!id) return null;
  return toolCalls.find((toolCall) => toolCall.id === id) ?? null;
}
