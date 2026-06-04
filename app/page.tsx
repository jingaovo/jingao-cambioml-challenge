"use client";

import { useCallback, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";

import { ChatPanel } from "@/components/dashboard/chat-panel";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  MobileTabBar,
  type MobileTab,
} from "@/components/dashboard/mobile-tab-bar";
import { RightPanel } from "@/components/dashboard/right-panel";
import { ToolDetailPanel } from "@/components/dashboard/tool-detail-panel";
import { VncViewer } from "@/components/dashboard/vnc-viewer";
import { useEventStore } from "@/lib/hooks/use-event-store";
import { useSandbox } from "@/lib/hooks/use-sandbox";
import { useScrollToBottom } from "@/lib/use-scroll-to-bottom";
import { ABORTED } from "@/lib/utils";

export default function DashboardPage() {
  const [scrollContainerRef, scrollEndRef] = useScrollToBottom();
  const [debugOpen, setDebugOpen] = useState(false);
  const [selectedToolCallId, setSelectedToolCallId] = useState<string | null>(
    null,
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");

  const { isInitializing, streamUrl, sandboxId, refreshDesktop } = useSandbox();

  const stableRefreshDesktop = useCallback(() => {
    void refreshDesktop();
  }, [refreshDesktop]);

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
    id: sandboxId ?? undefined,
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

  const chatStatus = status;
  const isLoading = chatStatus !== "ready";

  const {
    state: eventState,
    agentStatus,
    eventCounts,
    totalDurationMs,
    runningEventId,
    debugEvents,
    getEventById,
  } = useEventStore(messages, chatStatus);

  const selectedEvent = getEventById(selectedToolCallId);

  useEffect(() => {
    if (runningEventId) {
      setSelectedToolCallId(runningEventId);
    }
  }, [runningEventId]);

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

  const rightPanel = (
    <RightPanel
      streamUrl={streamUrl}
      isInitializing={isInitializing}
      selectedEvent={selectedEvent}
      onRefreshDesktop={stableRefreshDesktop}
    />
  );

  return (
    <div className="h-dvh bg-background">
      <DashboardLayout chatPanel={chatPanel} rightPanel={rightPanel} />

      <div className="flex h-dvh flex-col lg:hidden">
        <div className="min-h-0 flex-1 overflow-hidden">
          {mobileTab === "chat" ? chatPanel : null}
          {mobileTab === "desktop" ? (
            <VncViewer
              streamUrl={streamUrl}
              isInitializing={isInitializing}
              onRefresh={stableRefreshDesktop}
            />
          ) : null}
          {mobileTab === "details" ? (
            <div className="flex h-full flex-col bg-background">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold">Tool call details</h2>
              </div>
              <div className="min-h-0 flex-1">
                <ToolDetailPanel event={selectedEvent} />
              </div>
            </div>
          ) : null}
        </div>
        <MobileTabBar activeTab={mobileTab} onTabChange={setMobileTab} />
      </div>
    </div>
  );
}
