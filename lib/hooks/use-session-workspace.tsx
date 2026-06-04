"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";

import { ChatPanel } from "@/components/dashboard/chat-panel";
import { useEventStore } from "@/lib/hooks/use-event-store";
import type { ChatSession, SessionSnapshot } from "@/lib/sessions/types";
import type { ChatStatus } from "@/lib/types/agent";
import { useScrollToBottom } from "@/lib/use-scroll-to-bottom";
import { ABORTED } from "@/lib/utils";

interface UseSessionWorkspaceOptions {
  session: ChatSession;
  sandboxId: string | null;
  isInitializing: boolean;
  onPersist: (sessionId: string, snapshot: SessionSnapshot) => void;
}

export function useSessionWorkspace({
  session,
  sandboxId,
  isInitializing,
  onPersist,
}: UseSessionWorkspaceOptions) {
  const [scrollContainerRef, scrollEndRef] = useScrollToBottom();
  const [debugOpen, setDebugOpen] = useState(false);
  const [selectedToolCallId, setSelectedToolCallId] = useState<string | null>(
    null,
  );
  const sessionIdRef = useRef(session.id);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop: stopGeneration,
    append,
    setMessages,
  } = useChat({
    api: "/api/chat",
    id: session.id,
    initialMessages: session.messages,
    body: { sandboxId },
    maxSteps: 30,
    onError: (error) => {
      console.error(error);
      toast.error("There was an error", {
        description: "Please try again later.",
        richColors: true,
        position: "top-center",
      });
    },
  });

  const chatStatus: ChatStatus = status;
  const isLoading = chatStatus !== "ready";

  const {
    state: eventState,
    agentStatus,
    eventCounts,
    totalDurationMs,
    runningEventId,
    debugEvents,
    getEventById,
  } = useEventStore(
    messages,
    chatStatus,
    session.id,
    session.eventStore,
  );

  const selectedEvent = getEventById(selectedToolCallId);
  const onPersistRef = useRef(onPersist);
  onPersistRef.current = onPersist;

  useEffect(() => {
    if (runningEventId) {
      setSelectedToolCallId(runningEventId);
    }
  }, [runningEventId]);

  useEffect(() => {
    if (sessionIdRef.current === session.id) return;

    sessionIdRef.current = session.id;
    setSelectedToolCallId(null);
    setMessages(session.messages);
  }, [session.id, session.messages, setMessages]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onPersistRef.current(session.id, {
        messages,
        eventStore: eventState,
      });
    }, 400);

    return () => {
      window.clearTimeout(timer);
      onPersistRef.current(session.id, {
        messages,
        eventStore: eventState,
      });
    };
  }, [messages, eventState, session.id]);

  useEffect(() => {
    return () => {
      stopGeneration();
    };
  }, [stopGeneration, session.id]);

  const stop = useCallback(() => {
    stopGeneration();

    const lastMessage = messages.at(-1);
    const lastPart = lastMessage?.parts.at(-1);

    if (
      lastMessage?.role === "assistant" &&
      lastPart?.type === "tool-invocation"
    ) {
      setMessages((previous) => [
        ...previous.slice(0, -1),
        {
          ...lastMessage,
          parts: [
            ...lastMessage.parts.slice(0, -1),
            {
              ...lastPart,
              toolInvocation: {
                ...lastPart.toolInvocation,
                state: "result",
                result: ABORTED,
              },
            },
          ],
        },
      ]);
    }
  }, [messages, setMessages, stopGeneration]);

  const handleSelectToolCall = useCallback((id: string) => {
    setSelectedToolCallId(id);
  }, []);

  const handleSubmitPrompt = useCallback(
    (prompt: string) => {
      void append({ role: "user", content: prompt });
    },
    [append],
  );

  const chatPanel = (
    <ChatPanel
      agentStatus={agentStatus}
      sessionTitle={session.title}
      messages={messages}
      chatStatus={chatStatus}
      isLoading={isLoading}
      isInitializing={isInitializing}
      input={input}
      debugOpen={debugOpen}
      selectedToolCallId={selectedToolCallId}
      eventsById={eventState.eventsById}
      debugEvents={debugEvents}
      eventCounts={eventCounts}
      totalDurationMs={totalDurationMs}
      scrollContainerRef={scrollContainerRef}
      scrollEndRef={scrollEndRef}
      onDebugOpenChange={setDebugOpen}
      onSelectToolCall={handleSelectToolCall}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      onStop={stop}
      onSubmitPrompt={handleSubmitPrompt}
    />
  );

  return {
    chatPanel,
    selectedEvent,
    agentStatus,
  };
}
