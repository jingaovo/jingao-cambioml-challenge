import type { Message } from "ai";

import type { EventStoreState } from "@/lib/events/types";

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  eventStore: EventStoreState;
  createdAt: number;
  updatedAt: number;
}

export interface SessionsState {
  activeSessionId: string;
  sessions: ChatSession[];
}

export interface SessionSnapshot {
  messages: Message[];
  eventStore: EventStoreState;
  title?: string;
}
