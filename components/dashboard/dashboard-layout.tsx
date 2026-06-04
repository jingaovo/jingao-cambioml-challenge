"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface DashboardLayoutProps {
  sessionSidebar: React.ReactNode;
  chatPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function DashboardLayout({
  sessionSidebar,
  chatPanel,
  rightPanel,
}: DashboardLayoutProps) {
  return (
    <div className="hidden h-dvh w-full lg:block">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={42}
          minSize={32}
          maxSize={58}
          className="border-r border-border"
        >
          <div className="flex h-full">
            {sessionSidebar}
            <div className="min-w-0 flex-1">{chatPanel}</div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={58} minSize={42} className="bg-zinc-950">
          {rightPanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
