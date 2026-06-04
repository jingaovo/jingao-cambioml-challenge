"use client";

import { useCallback, useEffect, useState } from "react";
import equal from "fast-deep-equal";

import {
  createDefaultSessionsState,
  loadSessionsFromStorage,
  saveSessionsToStorage,
} from "@/lib/sessions/storage";
import type { ChatSession, SessionSnapshot, SessionsState } from "@/lib/sessions/types";
import { createEmptySession, deriveSessionTitle, nextDefaultSessionTitle } from "@/lib/sessions/utils";

export function useSessions() {
  const [state, setState] = useState<SessionsState>(createDefaultSessionsState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadSessionsFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSessionsToStorage(state);
  }, [state, hydrated]);

  const activeSession =
    state.sessions.find((session) => session.id === state.activeSessionId) ??
    state.sessions[0];

  const updateSession = useCallback(
    (sessionId: string, snapshot: SessionSnapshot) => {
      setState((previous) => {
        const index = previous.sessions.findIndex(
          (session) => session.id === sessionId,
        );
        if (index === -1) return previous;

        const current = previous.sessions[index];

        if (
          equal(current.messages, snapshot.messages) &&
          equal(current.eventStore, snapshot.eventStore)
        ) {
          return previous;
        }

        const title =
          snapshot.title ??
          (snapshot.messages.length > 0
            ? deriveSessionTitle(snapshot.messages, current.title)
            : current.title);

        const updatedSession: ChatSession = {
          ...current,
          messages: snapshot.messages,
          eventStore: snapshot.eventStore,
          title,
          updatedAt: Date.now(),
        };

        // Move to front on real activity so order survives refresh
        const sessions = [
          updatedSession,
          ...previous.sessions.filter((session) => session.id !== sessionId),
        ];

        return { ...previous, sessions };
      });
    },
    [],
  );

  const createSession = useCallback(() => {
    setState((previous) => {
      const session = createEmptySession(
        nextDefaultSessionTitle(previous.sessions),
      );
      return {
        activeSessionId: session.id,
        sessions: [session, ...previous.sessions],
      };
    });
  }, []);

  const switchSession = useCallback((sessionId: string) => {
    setState((previous) => {
      if (!previous.sessions.some((session) => session.id === sessionId)) {
        return previous;
      }
      return { ...previous, activeSessionId: sessionId };
    });
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setState((previous) => {
      const sessions = previous.sessions.filter(
        (session) => session.id !== sessionId,
      );

      if (sessions.length === 0) {
        const replacement = createEmptySession();
        return {
          activeSessionId: replacement.id,
          sessions: [replacement],
        };
      }

      const activeSessionId =
        previous.activeSessionId === sessionId
          ? sessions[0].id
          : previous.activeSessionId;

      return { activeSessionId, sessions };
    });
  }, []);

  return {
    hydrated,
    activeSession,
    sessions: state.sessions,
    activeSessionId: state.activeSessionId,
    updateSession,
    createSession,
    switchSession,
    deleteSession,
  };
}
