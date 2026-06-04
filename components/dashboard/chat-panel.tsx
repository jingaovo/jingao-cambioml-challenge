"use client";

import type { Message } from "ai";
import type { RefObject } from "react";

import { ChatHeader } from "@/components/dashboard/chat-header";
import { DebugPanel } from "@/components/dashboard/debug-panel";
import { PreviewMessage } from "@/components/message";
import { Input } from "@/components/input";
import { PromptSuggestions } from "@/components/prompt-suggestions";
import type { AgentEvent } from "@/lib/events/types";
import type { AgentStatus, ChatStatus } from "@/lib/types/agent";

interface ChatPanelProps {
  agentStatus: AgentStatus;
  sessionTitle: string;
  messages: Message[];
  chatStatus: ChatStatus;
  isLoading: boolean;
  isInitializing: boolean;
  input: string;
  debugOpen: boolean;
  selectedToolCallId: string | null;
  eventsById: Record<string, AgentEvent>;
  debugEvents: AgentEvent[];
  eventCounts: Record<string, number>;
  totalDurationMs: number;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  scrollEndRef: RefObject<HTMLDivElement | null>;
  onDebugOpenChange: (open: boolean) => void;
  onSelectToolCall: (id: string) => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onStop: () => void;
  onSubmitPrompt: (prompt: string) => void;
}

export function ChatPanel({
  agentStatus,
  sessionTitle,
  messages,
  chatStatus,
  isLoading,
  isInitializing,
  input,
  debugOpen,
  selectedToolCallId,
  eventsById,
  debugEvents,
  eventCounts,
  totalDurationMs,
  scrollContainerRef,
  scrollEndRef,
  onDebugOpenChange,
  onSelectToolCall,
  onInputChange,
  onSubmit,
  onStop,
  onSubmitPrompt,
}: ChatPanelProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      <ChatHeader agentStatus={agentStatus} sessionTitle={sessionTitle} />

      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
            <p className="text-sm font-medium">Start a new task</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ask the agent to browse, click, type, or run shell commands in
              the remote desktop.
            </p>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <PreviewMessage
            key={message.id}
            message={message}
            isLoading={isLoading}
            status={chatStatus}
            isLatestMessage={index === messages.length - 1}
            selectedToolCallId={selectedToolCallId}
            eventsById={eventsById}
            onSelectToolCall={onSelectToolCall}
          />
        ))}
        <div ref={scrollEndRef} className="h-1" />
      </div>

      {messages.length === 0 ? (
        <PromptSuggestions
          disabled={isInitializing}
          submitPrompt={onSubmitPrompt}
        />
      ) : null}

      <div className="border-t border-border bg-background p-4">
        <form onSubmit={onSubmit}>
          <Input
            handleInputChange={onInputChange}
            input={input}
            isInitializing={isInitializing}
            isLoading={isLoading}
            status={chatStatus}
            stop={onStop}
          />
        </form>
      </div>

      <DebugPanel
        open={debugOpen}
        onOpenChange={onDebugOpenChange}
        agentStatus={agentStatus}
        events={debugEvents}
        eventCounts={eventCounts}
        totalDurationMs={totalDurationMs}
      />
    </div>
  );
}
