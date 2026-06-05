"use client";

import { useCallback, useMemo, useState } from "react";
import { History } from "lucide-react";

import { ActiveSessionBridge } from "@/components/dashboard/active-session-bridge";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { DesktopStreamPanel } from "@/components/dashboard/desktop-stream-panel";
import {
  MobileTabBar,
  type MobileTab,
} from "@/components/dashboard/mobile-tab-bar";
import { RightPanelLayout } from "@/components/dashboard/right-panel-layout";
import { SessionSidebar } from "@/components/dashboard/session-sidebar";
import { ToolDetailPanel } from "@/components/dashboard/tool-detail-panel";
import { Button } from "@/components/ui/button";
import type { AgentEvent } from "@/lib/events/types";
import { useSandbox } from "@/lib/hooks/use-sandbox";
import { useSessions } from "@/lib/hooks/use-sessions";

export default function DashboardPage() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);

  const { isInitializing, streamUrl, sandboxId, refreshDesktop } = useSandbox();

  const {
    hydrated,
    activeSession,
    sessions,
    activeSessionId,
    updateSession,
    createSession,
    switchSession,
    deleteSession,
  } = useSessions();

  const stableRefreshDesktop = useCallback(() => {
    void refreshDesktop();
  }, [refreshDesktop]);

  // Keep VNC outside ActiveSessionBridge — chat/session updates must not remount the iframe.
  const desktopStreamPanel = useMemo(
    () => (
      <DesktopStreamPanel
        streamUrl={streamUrl}
        isInitializing={isInitializing}
        onRefresh={stableRefreshDesktop}
      />
    ),
    [streamUrl, isInitializing, stableRefreshDesktop],
  );

  const handleCreateSession = useCallback(() => {
    createSession();
    setMobileSessionsOpen(false);
    setMobileTab("chat");
  }, [createSession]);

  const handleSwitchSession = useCallback(
    (sessionId: string) => {
      switchSession(sessionId);
      setMobileSessionsOpen(false);
      setMobileTab("chat");
    },
    [switchSession],
  );

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      deleteSession(sessionId);
    },
    [deleteSession],
  );

  const sessionSidebar = (
    <SessionSidebar
      sessions={sessions}
      activeSessionId={activeSessionId}
      onCreateSession={handleCreateSession}
      onSwitchSession={handleSwitchSession}
      onDeleteSession={handleDeleteSession}
      className="hidden lg:flex"
    />
  );

  if (!hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading sessions…
      </div>
    );
  }

  return (
    <>
      {/* key={activeSessionId} resets useChat when switching sessions */}
      <ActiveSessionBridge
        key={activeSessionId}
        session={activeSession}
        sandboxId={sandboxId}
        isInitializing={isInitializing}
        onPersist={updateSession}
      >
        {({ chatPanel, selectedEvent }) => (
          <DashboardShell
            sessionSidebar={sessionSidebar}
            chatPanel={chatPanel}
            selectedEvent={selectedEvent}
            desktopStreamPanel={desktopStreamPanel}
            mobileTab={mobileTab}
            mobileSessionsOpen={mobileSessionsOpen}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onMobileTabChange={setMobileTab}
            onMobileSessionsOpenChange={setMobileSessionsOpen}
            onCreateSession={handleCreateSession}
            onSwitchSession={handleSwitchSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </ActiveSessionBridge>
    </>
  );
}

function DashboardShell({
  sessionSidebar,
  chatPanel,
  selectedEvent,
  desktopStreamPanel,
  mobileTab,
  mobileSessionsOpen,
  sessions,
  activeSessionId,
  onMobileTabChange,
  onMobileSessionsOpenChange,
  onCreateSession,
  onSwitchSession,
  onDeleteSession,
}: {
  sessionSidebar: React.ReactNode;
  chatPanel: React.ReactNode;
  selectedEvent: AgentEvent | null;
  desktopStreamPanel: React.ReactNode;
  mobileTab: MobileTab;
  mobileSessionsOpen: boolean;
  sessions: Parameters<typeof SessionSidebar>[0]["sessions"];
  activeSessionId: string;
  onMobileTabChange: (tab: MobileTab) => void;
  onMobileSessionsOpenChange: (open: boolean) => void;
  onCreateSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}) {
  const rightPanel = (
    <RightPanelLayout
      streamPanel={desktopStreamPanel}
      toolDetailPanel={<ToolDetailPanel event={selectedEvent} />}
    />
  );

  return (
    <div className="h-dvh bg-background">
      <DashboardLayout
        sessionSidebar={sessionSidebar}
        chatPanel={chatPanel}
        rightPanel={rightPanel}
      />

      <div className="flex h-dvh flex-col lg:hidden">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {mobileTab === "chat" ? (
            <div className="relative h-full">
              <div className="absolute right-3 top-3 z-20">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="size-9 shadow-sm"
                  onClick={() => onMobileSessionsOpenChange(!mobileSessionsOpen)}
                  aria-label="Toggle sessions"
                >
                  <History className="size-4" />
                </Button>
              </div>
              {chatPanel}
            </div>
          ) : null}

          {mobileTab === "desktop" ? desktopStreamPanel : null}

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

          {mobileSessionsOpen ? (
            <>
              <button
                type="button"
                className="absolute inset-0 z-30 bg-black/40"
                onClick={() => onMobileSessionsOpenChange(false)}
                aria-label="Close sessions"
              />
              <div className="absolute inset-y-0 left-0 z-40 w-[min(100%,16rem)] shadow-xl">
                <SessionSidebar
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onCreateSession={onCreateSession}
                  onSwitchSession={onSwitchSession}
                  onDeleteSession={onDeleteSession}
                  className="flex h-full w-full"
                />
              </div>
            </>
          ) : null}
        </div>
        <MobileTabBar activeTab={mobileTab} onTabChange={onMobileTabChange} />
      </div>
    </div>
  );
}
