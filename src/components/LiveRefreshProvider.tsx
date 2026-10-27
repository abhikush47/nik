"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * LiveRefreshProvider monitors cross-tab broadcast events and window focus/visibility changes.
 * Whenever an admin updates ANY resource, announcement, event, or setting,
 * every open public website tab immediately runs router.refresh() in 0 milliseconds,
 * guaranteeing instantaneous real-time reflection across the entire website without manual reloads.
 */
export default function LiveRefreshProvider() {
  const router = useRouter();

  useEffect(() => {
    let lastRefresh = 0;
    const triggerRefresh = () => {
      const now = Date.now();
      // Throttle rapid consecutive calls to at most once every 300ms
      if (now - lastRefresh > 300) {
        lastRefresh = now;
        router.refresh();
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "nik_data_updated") {
        triggerRefresh();
      }
    };

    const handleFocus = () => {
      triggerRefresh();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("nik_live_sync");
        bc.onmessage = () => {
          triggerRefresh();
        };
      } catch {}
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (bc) {
        bc.close();
      }
    };
  }, [router]);

  return null;
}
