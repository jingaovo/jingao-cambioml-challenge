"use client";

import type { Message } from "ai";
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import equal from "fast-deep-equal";
import { Streamdown } from "streamdown";

import { ToolCallCard } from "@/components/dashboard/tool-call-card";
import { agentEventToToolCall } from "@/lib/events/to-tool-call";
import type { AgentEvent } from "@/lib/events/types";
import type { ChatStatus } from "@/lib/types/agent";
import { cn } from "@/lib/utils";

const PurePreviewMessage = ({
  message,
  isLatestMessage,
  status,
  selectedToolCallId,
  eventsById,
  onSelectToolCall,
}: {
  message: Message;
  isLoading: boolean;
  status: ChatStatus;
  isLatestMessage: boolean;
  selectedToolCallId: string | null;
  eventsById: Record<string, AgentEvent>;
  onSelectToolCall: (id: string) => void;
}) => {
  return (
    <AnimatePresence key={message.id}>
      <motion.div
        className="group/message w-full"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={`message-${message.id}`}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex w-full gap-3",
            message.role === "user" && "ml-auto max-w-[85%] justify-end",
          )}
        >
          <div
            className={cn(
              "flex w-full flex-col",
              message.role === "user" && "w-fit",
            )}
          >
            {message.parts?.map((part, index) => {
              if (part.type === "text") {
                return (
                  <motion.div
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={`message-${message.id}-text-${index}`}
                    className="pb-3"
                  >
                    <div
                      className={cn(
                        "text-sm leading-relaxed",
                        message.role === "user" &&
                          "rounded-2xl bg-secondary px-3.5 py-2.5 text-secondary-foreground",
                      )}
                    >
                      <Streamdown>{part.text}</Streamdown>
                    </div>
                  </motion.div>
                );
              }

              if (part.type === "tool-invocation") {
                const event = eventsById[part.toolInvocation.toolCallId];
                if (!event) return null;

                const toolCall = agentEventToToolCall(event);

                return (
                  <ToolCallCard
                    key={part.toolInvocation.toolCallId}
                    toolCall={toolCall}
                    selected={selectedToolCallId === toolCall.id}
                    isLatestMessage={isLatestMessage}
                    chatStatus={status}
                    onSelect={onSelectToolCall}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.status !== nextProps.status) return false;
    if (prevProps.selectedToolCallId !== nextProps.selectedToolCallId)
      return false;
    if (prevProps.isLatestMessage !== nextProps.isLatestMessage) return false;
    if (prevProps.eventsById !== nextProps.eventsById) return false;
    if (prevProps.message.annotations !== nextProps.message.annotations)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

    return true;
  },
);
