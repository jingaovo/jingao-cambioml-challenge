"use client";

import { useCallback } from "react";

import { ToolDetailPanel } from "@/components/dashboard/tool-detail-panel";
import { VncViewer } from "@/components/dashboard/vnc-viewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { AgentEvent } from "@/lib/events/types";

interface RightPanelProps {
  streamUrl: string | null;
  isInitializing: boolean;
  selectedEvent: AgentEvent | null;
  onRefreshDesktop: () => void;
}

export function RightPanel({
  streamUrl,
  isInitializing,
  selectedEvent,
  onRefreshDesktop,
}: RightPanelProps) {
  const handleRefresh = useCallback(() => {
    onRefreshDesktop();
  }, [onRefreshDesktop]);

  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      <ResizablePanel defaultSize={65} minSize={35} className="relative">
        <VncViewer
          streamUrl={streamUrl}
          isInitializing={isInitializing}
          onRefresh={handleRefresh}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel
        defaultSize={35}
        minSize={20}
        className="border-t border-border bg-background"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-4 py-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tool call details
            </h2>
          </div>
          <div className="min-h-0 flex-1">
            <ToolDetailPanel event={selectedEvent} />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
