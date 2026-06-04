"use client";

import { memo } from "react";

import { VncViewer } from "@/components/dashboard/vnc-viewer";

export interface DesktopStreamPanelProps {
  streamUrl: string | null;
  isInitializing: boolean;
  onRefresh: () => void;
}

function DesktopStreamPanelComponent({
  streamUrl,
  isInitializing,
  onRefresh,
}: DesktopStreamPanelProps) {
  return (
    <VncViewer
      streamUrl={streamUrl}
      isInitializing={isInitializing}
      onRefresh={onRefresh}
    />
  );
}

/**
 * Isolated desktop stream — only re-renders when sandbox stream props change,
 * not when chat messages, tool events, or session state update.
 */
export const DesktopStreamPanel = memo(
  DesktopStreamPanelComponent,
  (prev, next) =>
    prev.streamUrl === next.streamUrl &&
    prev.isInitializing === next.isInitializing &&
    prev.onRefresh === next.onRefresh,
);

DesktopStreamPanel.displayName = "DesktopStreamPanel";
