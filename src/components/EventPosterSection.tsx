"use client";

import { useState } from "react";
import { ZoomIn, Maximize2 } from "lucide-react";
import ImageLightbox from "./ImageLightbox";

interface EventPosterSectionProps {
  posterUrl: string;
  eventTitle: string;
}

export default function EventPosterSection({
  posterUrl,
  eventTitle,
}: EventPosterSectionProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!posterUrl) return null;

  return (
    <div className="pt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 font-display">Official Event Poster</h3>
        <span className="text-xs text-gray-500 hidden sm:inline-flex items-center gap-1">
          <Maximize2 className="w-3.5 h-3.5 text-[#0B3D2E]" />
          Click poster to expand
        </span>
      </div>

      {/* Clickable Poster Preview Container */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsLightboxOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsLightboxOpen(true);
          }
        }}
        className="group relative block w-full max-w-md rounded-2xl border border-gray-200 bg-neutral-50/80 p-2 sm:p-2.5 transition-all duration-200 hover:border-emerald-600/50 hover:bg-neutral-100/70 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D2E] focus:ring-offset-2 cursor-pointer select-none"
        aria-label={`Open full-size official poster for ${eventTitle}`}
        title="Click to view original full-size poster"
      >
        {/* Neutral background stage that accommodates all aspect ratios with object-fit: contain */}
        <div className="relative flex items-center justify-center rounded-xl bg-neutral-900/[0.03] overflow-hidden min-h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt={`${eventTitle} official event poster`}
            className="w-full h-auto max-h-[540px] object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.015]"
            loading="lazy"
          />

          {/* Interactive Hover Overlay with subtle zoom prompt */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl pointer-events-none">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-gray-900 text-xs font-semibold shadow-xl backdrop-blur-xs transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
              <ZoomIn className="w-4 h-4 text-[#0B3D2E]" />
              <span>Click to view full poster</span>
            </span>
          </div>
        </div>

        {/* Footer info strip */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 px-1">
          <span className="inline-flex items-center gap-1.5 font-medium text-gray-700">
            <Maximize2 className="w-3.5 h-3.5 text-[#0B3D2E]" />
            <span>Full Original Poster</span>
          </span>
          <span className="text-[11px] font-semibold text-[#0B3D2E] group-hover:underline">
            Tap to expand &rarr;
          </span>
        </div>
      </div>

      {/* Full-screen accessible image lightbox */}
      <ImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        src={posterUrl}
        alt={`${eventTitle} official event poster`}
        title={eventTitle}
        subtitle="Official Event Poster"
      />
    </div>
  );
}
