"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { getDesktopURL } from "@/lib/sandbox/utils";

export function useSandbox() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const sandboxIdRef = useRef<string | null>(null);
  sandboxIdRef.current = sandboxId;

  const refreshDesktop = useCallback(async () => {
    try {
      setIsInitializing(true);
      const { streamUrl: nextStreamUrl, id } = await getDesktopURL(
        sandboxIdRef.current ?? undefined,
      );
      setStreamUrl(nextStreamUrl);
      setSandboxId(id);
    } catch (error) {
      console.error("Failed to refresh desktop:", error);
      toast.error("Failed to refresh desktop");
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setIsInitializing(true);
        const { streamUrl: nextStreamUrl, id } = await getDesktopURL();
        if (cancelled) return;
        setStreamUrl(nextStreamUrl);
        setSandboxId(id);
      } catch (error) {
        console.error("Failed to initialize desktop:", error);
        toast.error("Failed to initialize desktop");
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sandboxId) return;

    const killDesktop = () => {
      navigator.sendBeacon(
        `/api/kill-desktop?sandboxId=${encodeURIComponent(sandboxId)}`,
      );
    };

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const eventName = isIOS || isSafari ? "pagehide" : "beforeunload";

    window.addEventListener(eventName, killDesktop);

    return () => {
      window.removeEventListener(eventName, killDesktop);
      killDesktop();
    };
  }, [sandboxId]);

  return {
    isInitializing,
    streamUrl,
    sandboxId,
    refreshDesktop,
  };
}
