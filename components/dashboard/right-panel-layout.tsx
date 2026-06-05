"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface RightPanelLayoutProps {
  // Pass the memoized panel from page.tsx, not from inside the chat tree.
  streamPanel: React.ReactNode;
  toolDetailPanel: React.ReactNode;
}

export function RightPanelLayout({
  streamPanel,
  toolDetailPanel,
}: RightPanelLayoutProps) {
  return (
    <ResizablePanelGroup direction="vertical" className="h-full">
      <ResizablePanel defaultSize={65} minSize={35} className="relative">
        {streamPanel}
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
          <div className="min-h-0 flex-1">{toolDetailPanel}</div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
