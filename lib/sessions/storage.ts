import type { Message } from "ai";

import type { EventStoreState } from "@/lib/events/types";
import type { ChatSession, SessionsState } from "@/lib/sessions/types";
import { createEmptySession } from "@/lib/sessions/utils";

export const SESSIONS_STORAGE_KEY = "agent-dashboard-sessions-v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEventStoreState(value: unknown): value is EventStoreState {
  if (!isRecord(value)) return false;
  return Array.isArray(value.events) && isRecord(value.eventsById);
}

function isMessage(value: unknown): value is Message {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && typeof value.role === "string";
}

function isChatSession(value: unknown): value is ChatSession {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    Array.isArray(value.messages) &&
    value.messages.every(isMessage) &&
    isEventStoreState(value.eventStore) &&
    typeof value.createdAt === "number" &&
    typeof value.updatedAt === "number"
  );
}

function isSessionsState(value: unknown): value is SessionsState {
  if (!isRecord(value)) return false;
  if (!Array.isArray(value.sessions) || typeof value.activeSessionId !== "string") {
    return false;
  }

  if (!value.sessions.every(isChatSession)) return false;

  return value.sessions.some(
    (session) => session.id === value.activeSessionId,
  );
}

export function createDefaultSessionsState(): SessionsState {
  const session = createEmptySession();
  return {
    activeSessionId: session.id,
    sessions: [session],
  };
}

export function loadSessionsFromStorage(): SessionsState {
  if (typeof window === "undefined") {
    return createDefaultSessionsState();
  }

  try {
    const raw = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return createDefaultSessionsState();

    const parsed: unknown = JSON.parse(raw);
    if (!isSessionsState(parsed)) return createDefaultSessionsState();

    return parsed;
  } catch {
    return createDefaultSessionsState();
  }
}

export function saveSessionsToStorage(state: SessionsState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to persist sessions:", error);
  }
}
