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

  // Duplicate items for continuous seamless marquee loop
  const displayItems = announcements.length < 3 
    ? [...announcements, ...announcements, ...announcements, ...announcements] 
    : [...announcements, ...announcements];

  return (
    <div 
      className="relative z-40 bg-[#0B3D2E] text-white border-b border-[#087F4F]/40 overflow-hidden text-xs sm:text-sm select-none"
      role="region"
      aria-label="Community Announcements"
    >
      <div className="max-w-7xl mx-auto flex items-center h-10 px-3 sm:px-6">
        {/* Static Prefix Tag */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-[#DC143C] text-white font-semibold px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wider mr-3 shadow-xs">
          <Megaphone className="w-3.5 h-3.5 animate-pulse" />
          <span>Notice</span>
        </div>

        {/* Marquee Track */}
        <div className="relative flex-1 overflow-hidden h-full flex items-center">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            {displayItems.map((item, idx) => {
              const href = item.destination_url || `/announcements`;
              const isExternal = href.startsWith("http");

              return (
                <div key={`${item.id}-${idx}`} className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A05D] inline-block" />
                  <Link
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 hover:text-emerald-200 transition-colors cursor-pointer group"
                  >
                    <span className="font-semibold text-emerald-100">{item.title}:</span>
                    <span className="text-white/90">{item.short_message}</span>
                    {isExternal ? (
                      <ExternalLink className="w-3 h-3 text-emerald-300 opacity-70 group-hover:opacity-100" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-emerald-300 opacity-70 group-hover:opacity-100" />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 ml-3 p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss announcement banner"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
