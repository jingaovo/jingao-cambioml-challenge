"use client";

import { useMemo, useRef } from "react";
import type { Message } from "ai";

import {
  selectAgentStatusFromEvents,
  selectEventById,
  selectEventCountsByType,
  selectEventsForDebug,
  selectRunningEventId,
  selectTotalDurationMs,
} from "@/lib/events/selectors";
import { initialEventStoreState } from "@/lib/events/store";
import { syncEventStore } from "@/lib/events/sync";
import { agentEventToToolCall } from "@/lib/events/to-tool-call";
import type { ChatStatus } from "@/lib/types/agent";
import type { ToolCall } from "@/lib/types/tool-call";

export function useEventStore(messages: Message[], chatStatus: ChatStatus) {
  const stateRef = useRef(initialEventStoreState);

  const state = useMemo(() => {
    const nextState = syncEventStore(
      messages,
      chatStatus,
      stateRef.current,
    );
    stateRef.current = nextState;
    return nextState;
  }, [messages, chatStatus]);

  const agentStatus = useMemo(
    () => selectAgentStatusFromEvents(state, chatStatus),
    [state, chatStatus],
  );

  const eventCounts = useMemo(
    () => selectEventCountsByType(state),
    [state],
  );

  const totalDurationMs = useMemo(
    () => selectTotalDurationMs(state),
    [state],
  );

  const runningEventId = useMemo(
    () => selectRunningEventId(state),
    [state],
  );

  const debugEvents = useMemo(
    () => selectEventsForDebug(state),
    [state],
  );

  const getToolCallById = (id: string | null): ToolCall | null => {
    const event = selectEventById(state, id);
    return event ? agentEventToToolCall(event) : null;
  };

  const getEventById = (id: string | null) => selectEventById(state, id);

  return {
    state,
    agentStatus,
    eventCounts,
    totalDurationMs,
    runningEventId,
    debugEvents,
    getToolCallById,
    getEventById,
  };
}
