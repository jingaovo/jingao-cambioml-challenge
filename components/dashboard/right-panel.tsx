"use client";

import { useCallback } from "react";

import { ToolDetailPanel } from "@/components/dashboard/tool-detail-panel";
import { VncViewer } from "@/components/dashboard/vnc-viewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { ToolCall } from "@/lib/types/tool-call";

interface RightPanelProps {
  streamUrl: string | null;
  isInitializing: boolean;
  selectedToolCall: ToolCall | null;
  onRefreshDesktop: () => void;
}

export function RightPanel({
  streamUrl,
  isInitializing,
  selectedToolCall,
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
            <ToolDetailPanel toolCall={selectedToolCall} />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
