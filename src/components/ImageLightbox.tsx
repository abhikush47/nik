"use client";

import { useEffect, useCallback, useRef } from "react";
import { X, ExternalLink, ZoomIn } from "lucide-react";

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

export default function ImageLightbox({
  isOpen,
  onClose,
  src,
  alt,
  title,
  subtitle,
}: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard shortcuts (Escape to close)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [isOpen, onClose]
  );

  // Prevent background scrolling while open & manage focus
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Prevent layout shift from scrollbar disappearing
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    // Focus close button for accessible keyboard navigation
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-6 animate-lightbox-fade"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} - Full size poster` : "Full-size image viewer"}
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div
        className="absolute top-0 inset-x-0 z-20 p-3 sm:p-5 flex items-center justify-between text-white pointer-events-auto bg-gradient-to-b from-black/85 via-black/40 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col pr-4 min-w-0">
          {title && (
            <h2 className="text-sm sm:text-base font-bold text-white truncate drop-shadow-sm font-display">
              {title}
            </h2>
          )}
          {subtitle ? (
            <p className="text-xs text-gray-300 truncate drop-shadow-sm">{subtitle}</p>
          ) : (
            <p className="text-xs text-gray-400 drop-shadow-sm">Click outside or press Esc to close</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Open full-res asset in new tab */}
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:p-2.5 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
            title="Open original image file in new tab"
            aria-label="Open original image in new tab"
          >
            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
          </a>

          {/* Close Lightbox */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            aria-label="Close full-size image viewer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Main Full-Size Image Container */}
      <div
        className="relative flex items-center justify-center w-full h-full max-w-[95vw] max-h-[85vh] sm:max-h-[90vh] z-10 pointer-events-auto mt-8 sm:mt-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-[95vw] max-h-[80vh] sm:max-h-[88vh] w-auto h-auto object-contain rounded-lg sm:rounded-xl shadow-2xl select-none animate-lightbox-zoom"
          draggable={false}
        />
      </div>

      {/* Bottom Information Hint */}
      <div
        className="absolute bottom-3 sm:bottom-4 inset-x-0 text-center pointer-events-none z-20"
        aria-hidden="true"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[11px] text-gray-300 border border-white/10 shadow-sm">
          <ZoomIn className="w-3 h-3 text-emerald-400" />
          <span>Full Original Resolution (Contain)</span>
        </span>
      </div>
    </div>
  );
}
