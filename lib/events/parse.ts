import type { EventType } from "@/lib/events/types";
import type {
  BashToolArgs,
  ComputerToolArgs,
  ToolResult,
} from "@/lib/types/tool-call";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseComputerArgs(args: unknown): ComputerToolArgs {
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

export function parseBashArgs(args: unknown): BashToolArgs {
  if (!isRecord(args) || typeof args.command !== "string") {
    return { command: "" };
  }
  return { command: args.command };
}

export function parseToolResult(result: unknown): ToolResult | undefined {
  if (result === undefined || result === null) return undefined;
  if (typeof result === "string") return result;
  if (
    isRecord(result) &&
    result.type === "image" &&
    typeof result.data === "string"
  ) {
    return { type: "image", data: result.data };
  }
  if (
    isRecord(result) &&
    result.type === "text" &&
    typeof result.text === "string"
  ) {
    return { type: "text", text: result.text };
  }
  return String(result);
}

export function toEventType(
  toolName: string,
  args: unknown,
): EventType {
  if (toolName === "bash") return "bash";
  const computerArgs = parseComputerArgs(args);
  return `computer.${computerArgs.action}`;
}
