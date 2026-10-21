"use client";

import { useState } from "react";
import Link from "next/link";
import { Megaphone, X, ExternalLink, ChevronRight } from "lucide-react";
import { Announcement } from "@/lib/types";

interface AnnouncementTickerProps {
  announcements: Announcement[];
}

export default function AnnouncementTicker({ announcements }: AnnouncementTickerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !announcements || announcements.length === 0) {
    return null;
  }

  // Filter only published announcements with marquee_enabled
  const activeItems = announcements.filter((a) => a.marquee_enabled);
  const itemsToDisplay = activeItems.length > 0 ? activeItems : announcements;

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
