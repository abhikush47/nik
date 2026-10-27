"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Megaphone, X, ExternalLink, ChevronRight } from "lucide-react";
import { Announcement } from "@/lib/types";

interface AnnouncementTickerProps {
  announcements: Announcement[];
}

export default function AnnouncementTicker({ announcements: initialAnnouncements }: AnnouncementTickerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<Announcement[]>(initialAnnouncements || []);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setItems(initialAnnouncements || []);
  }, [initialAnnouncements]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/announcements?marquee=1&_t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.announcements)) setItems(data.announcements);
        }
      } catch {}
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "nik_data_updated") {
        fetchLatest();
        router.refresh();
      }
    };

    const handleFocus = () => {
      fetchLatest();
      router.refresh();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("nik_live_sync");
        bc.onmessage = () => {
          fetchLatest();
          router.refresh();
        };
      } catch {}
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      if (bc) bc.close();
    };
  }, [router]);

  // Never render public announcement ticker inside the Admin CMS Portal
  if (pathname.startsWith("/admin")) {
    return null;
  }

  if (dismissed || !items || items.length === 0) {
    return null;
  }

  // Filter only published announcements with marquee_enabled
  const activeItems = items.filter((a) => a.marquee_enabled && a.status === "published");
  if (activeItems.length === 0) {
    return null;
  }

  const itemsToDisplay = activeItems;

  // Duplicate items for continuous seamless marquee loop
  const displayItems =
    itemsToDisplay.length < 3
      ? [...itemsToDisplay, ...itemsToDisplay, ...itemsToDisplay, ...itemsToDisplay]
      : [...itemsToDisplay, ...itemsToDisplay];

  return (
    <div
      className="relative z-40 bg-[#0B3D2E] text-white border-b border-[#087F4F]/40 overflow-hidden text-[11px] sm:text-xs select-none group"
      role="region"
      aria-label="Community Announcements"
    >
      <div className="max-w-7xl mx-auto flex items-center h-8.5 sm:h-10 px-3 sm:px-6">
        {/* Notice Prefix Pill */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-[#DC143C] text-white font-bold px-2 sm:px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] uppercase tracking-wider mr-2.5 sm:mr-3 shadow-xs">
          <Megaphone className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
          <span>Notice</span>
        </div>

        {/* Marquee Track */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          <div className="animate-marquee flex items-center gap-6 sm:gap-8 whitespace-nowrap group-hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
            {displayItems.map((item, idx) => {
              const href = item.destination_url || `/announcements`;
              const isExternal = href.startsWith("http");

              return (
                <div key={`${item.id}-${idx}`} className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A05D] inline-block flex-shrink-0" />
                  <Link
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 hover:text-emerald-200 transition-colors cursor-pointer group/link max-w-[260px] sm:max-w-none truncate"
                  >
                    <span className="font-bold text-emerald-100 flex-shrink-0">{item.title}:</span>
                    <span className="text-white/90 truncate">{item.short_message}</span>
                    {isExternal ? (
                      <ExternalLink className="w-3 h-3 text-emerald-300 opacity-70 group-hover/link:opacity-100 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-emerald-300 opacity-70 group-hover/link:opacity-100 flex-shrink-0" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 ml-2 sm:ml-3 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-emerald-400"
          aria-label="Dismiss announcement banner"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
