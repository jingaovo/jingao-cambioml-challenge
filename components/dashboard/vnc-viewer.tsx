"use client";

import { memo } from "react";
import { Monitor, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VncViewerProps {
  streamUrl: string | null;
  isInitializing: boolean;
  onRefresh: () => void;
}

function VncViewerComponent({
  streamUrl,
  isInitializing,
  onRefresh,
}: VncViewerProps) {
  return (
    <div className="relative h-full w-full bg-zinc-950">
      {streamUrl ? (
        <>
          <iframe
            src={streamUrl}
            title="Remote desktop"
            className="h-full w-full border-0"
            allow="autoplay"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onRefresh}
            disabled={isInitializing}
            className="absolute right-3 top-3 z-10 h-8 gap-1.5 bg-black/60 text-white backdrop-blur-sm hover:bg-black/80"
          >
            <RefreshCw
              className={cn("size-3.5", isInitializing && "animate-spin")}
            />
            {isInitializing ? "Starting…" : "New desktop"}
          </Button>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-400">
          <Monitor className="size-8 opacity-50" />
          <p className="text-sm">
            {isInitializing ? "Initializing desktop…" : "Waiting for stream…"}
          </p>
        </div>
      )}
    </div>
  );
}

export const VncViewer = memo(VncViewerComponent, (prev, next) => {
  return (
    prev.streamUrl === next.streamUrl &&
    prev.isInitializing === next.isInitializing &&
    prev.onRefresh === next.onRefresh
  );
});

VncViewer.displayName = "VncViewer";
