"use client";

import { useSessionWorkspace } from "@/lib/hooks/use-session-workspace";
import type { ChatSession, SessionSnapshot } from "@/lib/sessions/types";

// Wires one session's chat + event store. Parent sets key={sessionId} to remount on switch.
interface ActiveSessionBridgeProps {
  session: ChatSession;
  sandboxId: string | null;
  isInitializing: boolean;
  onPersist: (sessionId: string, snapshot: SessionSnapshot) => void;
  children: (value: {
    chatPanel: React.ReactNode;
    selectedEvent: ReturnType<typeof useSessionWorkspace>["selectedEvent"];
  }) => React.ReactNode;
}

export function ActiveSessionBridge({
  session,
  sandboxId,
  isInitializing,
  onPersist,
  children,
}: ActiveSessionBridgeProps) {
  const { chatPanel, selectedEvent } = useSessionWorkspace({
    session,
    sandboxId,
    isInitializing,
    onPersist,
  });

  return children({ chatPanel, selectedEvent });
}
