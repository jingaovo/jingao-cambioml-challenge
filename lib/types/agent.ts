export type AgentStatus = "idle" | "running" | "error";

export type ChatStatus = "error" | "submitted" | "streaming" | "ready";

export function deriveAgentStatus(chatStatus: ChatStatus): AgentStatus {
  if (chatStatus === "error") return "error";
  if (chatStatus === "submitted" || chatStatus === "streaming") return "running";
  return "idle";
}
