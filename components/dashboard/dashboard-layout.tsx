"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface DashboardLayoutProps {
  chatPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function DashboardLayout({ chatPanel, rightPanel }: DashboardLayoutProps) {
  return (
    <div className="hidden h-dvh w-full lg:block">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={40}
          minSize={28}
          maxSize={55}
          className="border-r border-border"
        >
          {chatPanel}
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={45} className="bg-zinc-950">
          {rightPanel}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
