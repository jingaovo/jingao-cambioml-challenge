export type ToolCallStatus =
  | "pending"
  | "running"
  | "completed"
  | "aborted"
  | "error";

export type ComputerAction =
  | "screenshot"
  | "left_click"
  | "right_click"
  | "double_click"
  | "mouse_move"
  | "type"
  | "key"
  | "wait"
  | "scroll"
  | "left_click_drag";

export interface ComputerToolArgs {
  action: ComputerAction;
  coordinate?: [number, number];
  start_coordinate?: [number, number];
  text?: string;
  duration?: number;
  scroll_amount?: number;
  scroll_direction?: "up" | "down";
}

export interface BashToolArgs {
  command: string;
}

export interface ToolResultImage {
  type: "image";
  data: string;
}

export interface ToolResultText {
  type: "text";
  text: string;
}

export type ToolResult = ToolResultImage | ToolResultText | string;

export interface ToolCallBase {
  id: string;
  messageId: string;
  status: ToolCallStatus;
  timestamp: number;
}

export interface ComputerToolCall extends ToolCallBase {
  toolName: "computer";
  args: ComputerToolArgs;
  result?: ToolResult;
}

export interface BashToolCall extends ToolCallBase {
  toolName: "bash";
  args: BashToolArgs;
  result?: ToolResult;
}

export type ToolCall = ComputerToolCall | BashToolCall;

export interface ToolCallLabel {
  title: string;
  detail?: string;
}
