"use client";

import { MessageSquarePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ChatSession } from "@/lib/sessions/types";
import { formatRelativeTime } from "@/lib/sessions/utils";
import { cn } from "@/lib/utils";

interface SessionSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onCreateSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  className?: string;
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  onCreateSession,
  onSwitchSession,
  onDeleteSession,
  className,
}: SessionSidebarProps) {
  const sortedSessions = [...sessions].sort(
    (left, right) => right.updatedAt - left.updatedAt,
  );

  return (
    <aside
      className={cn(
        "flex h-full w-56 shrink-0 flex-col border-r border-border bg-muted/20",
        className,
      )}
      aria-label="Chat sessions"
    >
      <div className="border-b border-border p-3">
        <Button
          type="button"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onCreateSession}
        >
          <MessageSquarePlus className="size-4" />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {sortedSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            const isLastSession = sessions.length === 1;

            return (
              <li key={session.id}>
                <div
                  className={cn(
                    "group flex items-start gap-1 rounded-lg border px-2.5 py-2 transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary/5"
                      : "border-transparent hover:bg-muted/60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSwitchSession(session.id)}
                    className="min-w-0 flex-1 text-left"
                    aria-current={isActive ? "true" : undefined}
                  >
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        isActive ? "text-primary" : "text-foreground",
                      )}
                    >
                      {session.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatRelativeTime(session.updatedAt)}
                      {session.messages.length > 0
                        ? ` · ${session.messages.length} msgs`
                        : ""}
                    </p>
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isLastSession}
                    title={
                      isLastSession
                        ? "Keep at least one chat open"
                        : `Delete ${session.title}`
                    }
                    className="size-7 shrink-0 opacity-70 transition-opacity hover:opacity-100 disabled:opacity-30"
                    onClick={() => onDeleteSession(session.id)}
                    aria-label={`Delete ${session.title}`}
                  >
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
