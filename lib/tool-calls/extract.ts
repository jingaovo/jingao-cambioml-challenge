import type { Message } from "ai";

import { ABORTED } from "@/lib/utils";
import type { ChatStatus } from "@/lib/types/agent";
import type {
  BashToolArgs,
  ComputerToolArgs,
  ToolCall,
  ToolCallStatus,
  ToolResult,
} from "@/lib/types/tool-call";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseComputerArgs(args: unknown): ComputerToolArgs {
  if (!isRecord(args) || typeof args.action !== "string") {
    return { action: "screenshot" };
  }

  return {
    action: args.action as ComputerToolArgs["action"],
    coordinate: Array.isArray(args.coordinate)
      ? ([args.coordinate[0], args.coordinate[1]] as [number, number])
      : undefined,
    start_coordinate: Array.isArray(args.start_coordinate)
      ? ([args.start_coordinate[0], args.start_coordinate[1]] as [
          number,
          number,
        ])
      : undefined,
    text: typeof args.text === "string" ? args.text : undefined,
    duration: typeof args.duration === "number" ? args.duration : undefined,
    scroll_amount:
      typeof args.scroll_amount === "number" ? args.scroll_amount : undefined,
    scroll_direction:
      args.scroll_direction === "up" || args.scroll_direction === "down"
        ? args.scroll_direction
        : undefined,
  };
}

function parseBashArgs(args: unknown): BashToolArgs {
  if (!isRecord(args) || typeof args.command !== "string") {
    return { command: "" };
  }
  return { command: args.command };
}

function parseToolResult(result: unknown): ToolResult | undefined {
  if (result === undefined || result === null) return undefined;
  if (typeof result === "string") return result;
  if (isRecord(result) && result.type === "image" && typeof result.data === "string") {
    return { type: "image", data: result.data };
  }
  if (isRecord(result) && result.type === "text" && typeof result.text === "string") {
    return { type: "text", text: result.text };
  }
  return String(result);
}

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

  if (state === "call" && isLatestMessage && chatStatus !== "ready") {
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
