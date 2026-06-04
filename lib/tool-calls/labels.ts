import type {
  ComputerToolArgs,
  ToolCall,
  ToolCallLabel,
} from "@/lib/types/tool-call";

function getComputerActionLabel(args: ComputerToolArgs): ToolCallLabel {
  const { action, coordinate, text, duration, scroll_amount, scroll_direction } =
    args;

  switch (action) {
    case "screenshot":
      return { title: "Screenshot" };
    case "left_click":
      return {
        title: "Left click",
        detail: coordinate ? `(${coordinate[0]}, ${coordinate[1]})` : undefined,
      };
    case "right_click":
      return {
        title: "Right click",
        detail: coordinate ? `(${coordinate[0]}, ${coordinate[1]})` : undefined,
      };
    case "double_click":
      return {
        title: "Double click",
        detail: coordinate ? `(${coordinate[0]}, ${coordinate[1]})` : undefined,
      };
    case "mouse_move":
      return {
        title: "Move mouse",
        detail: coordinate ? `→ (${coordinate[0]}, ${coordinate[1]})` : undefined,
      };
    case "type":
      return { title: "Type", detail: text ? `"${text}"` : undefined };
    case "key":
      return { title: "Key press", detail: text ? `"${text}"` : undefined };
    case "wait":
      return {
        title: "Wait",
        detail: duration !== undefined ? `${duration}s` : undefined,
      };
    case "scroll":
      return {
        title: "Scroll",
        detail:
          scroll_direction && scroll_amount
            ? `${scroll_direction} ×${scroll_amount}`
            : undefined,
      };
    case "left_click_drag":
      return { title: "Drag", detail: "mouse drag" };
    default: {
      const exhaustive: never = action;
      return { title: exhaustive };
    }
  }
}

export function getToolCallLabel(toolCall: ToolCall): ToolCallLabel {
  if (toolCall.toolName === "computer") {
    return getComputerActionLabel(toolCall.args);
  }

  const command = toolCall.args.command;
  return {
    title: "Bash",
    detail: command.length > 48 ? `${command.slice(0, 48)}…` : command,
  };
}

export function getToolCallTypeLabel(toolCall: ToolCall): string {
  if (toolCall.toolName === "computer") {
    return `computer.${toolCall.args.action}`;
  }
  return "bash";
}
