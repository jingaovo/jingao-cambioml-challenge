import type { Message } from "ai";

import type { ChatSession } from "@/lib/sessions/types";

const MAX_TITLE_LENGTH = 48;

export function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptySession(title = "New chat"): ChatSession {
  const now = Date.now();
  return {
    id: createSessionId(),
    title,
    messages: [],
    eventStore: { events: [], eventsById: {} },
    createdAt: now,
    updatedAt: now,
  };
}

export function nextDefaultSessionTitle(sessions: ChatSession[]): string {
  const newChatPattern = /^New chat(?: (\d+))?$/;
  const usedNumbers = sessions
    .map((session) => {
      const match = session.title.match(newChatPattern);
      if (!match) return null;
      return match[1] ? Number(match[1]) : 1;
    })
    .filter((value): value is number => value !== null);

  if (usedNumbers.length === 0) return "New chat";

  const nextNumber = Math.max(...usedNumbers) + 1;
  return nextNumber === 2 ? "New chat 2" : `New chat ${nextNumber}`;
}

export function deriveSessionTitle(
  messages: Message[],
  fallback = "New chat",
): string {
  const firstUserMessage = messages.find((message) => message.role === "user");
  if (!firstUserMessage?.parts) return fallback;

  const textPart = firstUserMessage.parts.find((part) => part.type === "text");
  if (!textPart || textPart.type !== "text") return fallback;

  const text = textPart.text.trim();
  if (!text) return fallback;

  return text.length > MAX_TITLE_LENGTH
    ? `${text.slice(0, MAX_TITLE_LENGTH)}…`
    : text;
}

export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

// Sidebar order: most recently updated first.
export function sortSessionsByActivity(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((left, right) => right.updatedAt - left.updatedAt);
}
