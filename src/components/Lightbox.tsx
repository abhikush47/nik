"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Camera, Tag } from "lucide-react";
import { GalleryImage } from "@/lib/types";

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < images.length;
  const currentImage = isOpen ? images[currentIndex] : null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && currentIndex !== null && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex !== null && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    },
    [isOpen, currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentImage) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview Lightbox"
      onClick={onClose}
    >
      {/* Top Bar Controls */}
      <div 
        className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between text-white z-20 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300">
          <span className="font-semibold text-white">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="hidden sm:inline text-gray-500">•</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 uppercase tracking-wider text-xs bg-white/10 px-2.5 py-1 rounded-full">
            <Tag className="w-3 h-3 text-emerald-400" />
            {currentImage.category_slug.replace("-", " ")}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 sm:p-2.5 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:ring-2 focus:ring-white"
          aria-label="Close image lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Prev / Next Navigation Arrows */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 text-white bg-black/40 hover:bg-black/80 hover:scale-105 active:scale-95 rounded-full border border-white/10 transition-all pointer-events-auto"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 text-white bg-black/40 hover:bg-black/80 hover:scale-105 active:scale-95 rounded-full border border-white/10 transition-all pointer-events-auto"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-5xl max-h-[78vh] sm:max-h-[82vh] w-full mx-4 flex flex-col items-center justify-center p-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[60vh] sm:h-[72vh] rounded-lg overflow-hidden flex items-center justify-center shadow-2xl">
          <Image
            src={currentImage.image_url}
            alt={currentImage.alt_text || currentImage.title}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority
          />
        </div>

        {/* Caption & Metadata Bar */}
        <div className="w-full mt-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-white text-center sm:text-left">
          <div>
            <h3 className="text-base sm:text-lg font-bold">{currentImage.title}</h3>
            {currentImage.alt_text && currentImage.alt_text !== currentImage.title && (
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5">{currentImage.alt_text}</p>
            )}
          </div>
          {currentImage.photographer_credit && (
            <div className="flex items-center justify-center sm:justify-end gap-1.5 text-xs text-emerald-300/90 font-medium">
              <Camera className="w-3.5 h-3.5" />
              <span>Photo: {currentImage.photographer_credit}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
