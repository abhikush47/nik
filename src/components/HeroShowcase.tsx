"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Heart,
  MapPin,
} from "lucide-react";
import { GalleryImage, EventItem } from "@/lib/types";

interface HeroShowcaseProps {
  images: GalleryImage[];
  featuredEvent?: EventItem | null;
}

const DEFAULT_IMAGES: Partial<GalleryImage>[] = [
  {
    id: "def-1",
    title: "Grand Dashain Community Gathering",
    image_url: "/images/community/dashain-together.png",
    category_slug: "dashain",
    alt_text: "Nepali students celebrating Dashain together at KIIT University",
  },
  {
    id: "def-2",
    title: "Campus Cultural Festival Experience",
    image_url: "/images/community/festival-experience.png",
    category_slug: "cultural-celebrations",
    alt_text: "Nepali festival cultural showcase and stage performances on campus",
  },
  {
    id: "def-3",
    title: "Nepali Heritage Meets KIIT Campus",
    image_url: "/images/community/heritage-campus.png",
    category_slug: "student-life",
    alt_text: "Nepali students representing heritage on the KIIT University campus grounds",
  },
  {
    id: "def-4",
    title: "Festival Campus Celebration & Unity",
    image_url: "/images/community/campus-celebration.png",
    category_slug: "cultural-celebrations",
    alt_text: "Group celebration of Nepali festival traditions in Bhubaneswar",
  },
];

export default function HeroShowcase({ images, featuredEvent }: HeroShowcaseProps) {
  const displayImages = images && images.length > 0 ? images : (DEFAULT_IMAGES as GalleryImage[]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = displayImages.length;
  const currentImage = displayImages[activeIndex] || displayImages[0];

  // Secondary thumbnails for desktop layering
  const nextIndex1 = (activeIndex + 1) % total;
  const nextIndex2 = (activeIndex + 2) % total;
  const thumb1 = displayImages[nextIndex1];
  const thumb2 = displayImages[nextIndex2];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-rotation timer (6.5s interval, restrained & gentle)
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, 6500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Community Memory Showcase"
      role="region"
    >
      {/* Background atmospheric ambient gradient */}
      <div
        className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-[#0B3D2E]/15 via-[#DC143C]/10 to-[#142B4A]/15 rounded-3xl blur-2xl opacity-60 -z-10 pointer-events-none transition-opacity duration-700"
        aria-hidden="true"
      />

      {/* Main Container */}
      <div className="relative mx-auto max-w-lg lg:max-w-none">
        {/* Dominant Photograph Card */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/90 shadow-2xl bg-gray-950 aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Image with smooth gentle crossfade */}
          <div className="relative w-full h-full">
            <Image
              key={currentImage.id || currentImage.image_url}
              src={currentImage.image_url}
              alt={currentImage.alt_text || currentImage.title || "NEPALI IN KIIT Community"}
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw"
              className="object-cover transition-all duration-700 ease-out transform motion-reduce:transition-none"
            />

            {/* Gradient overlays for cinematic legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Top Right Live indicator & pause toggle */}
            <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"
                  }`}
                />
                <span>{isPaused ? "Paused" : "Live Showcase"}</span>
              </span>

              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                aria-label={isPaused ? "Resume auto rotation" : "Pause auto rotation"}
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play className="w-3 h-3 ml-0.5" /> : <Pause className="w-3 h-3" />}
              </button>
            </div>

            {/* Top Left Category / Event Badge */}
            <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>
                  {currentImage.category_slug
                    ? currentImage.category_slug.replace("-", " ")
                    : "Community Memory"}
                </span>
              </span>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-4 inset-x-4 sm:bottom-5 sm:inset-x-5 z-20 text-white space-y-1">
              <h3 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug line-clamp-2 drop-shadow-sm font-display">
                {currentImage.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-200">
                <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
                  <Users className="w-3.5 h-3.5" />
                  <span>KIIT Nepali Community</span>
                </span>
                {currentImage.photographer_credit && (
                  <span className="text-gray-300 hidden sm:inline">
                    • Photo: {currentImage.photographer_credit}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Secondary Layered Thumbnails */}
        {total > 1 && (
          <>
            {/* Layer 1: Top-Right Floating Thumbnail */}
            <button
              type="button"
              onClick={() => setActiveIndex(nextIndex1)}
              className="group hidden xl:block absolute -top-5 -right-6 z-30 w-36 h-28 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-gray-900 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={`View memory: ${thumb1.title}`}
              title={`Switch to: ${thumb1.title}`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={thumb1.image_url}
                  alt={thumb1.title || "Next memory"}
                  fill
                  sizes="150px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white text-left line-clamp-1 group-hover:text-emerald-200 transition-colors">
                  {thumb1.title}
                </span>
                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#DC143C] text-white text-[9px] font-bold uppercase tracking-wider">
                  Next
                </span>
              </div>
            </button>

            {/* Layer 2: Bottom-Right Offset Thumbnail */}
            <button
              type="button"
              onClick={() => setActiveIndex(nextIndex2)}
              className="group hidden lg:block xl:block absolute -bottom-6 right-8 xl:right-6 z-30 w-32 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-gray-900 cursor-pointer transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={`View memory: ${thumb2.title}`}
              title={`Switch to: ${thumb2.title}`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={thumb2.image_url}
                  alt={thumb2.title || "Upcoming memory"}
                  fill
                  sizes="130px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white text-left line-clamp-1 group-hover:text-emerald-200 transition-colors">
                  {thumb2.title}
                </span>
              </div>
            </button>
          </>
        )}

        {/* Floating Community Statement Card: "A Community That Feels Like Home" */}
        <div className="relative mt-4 sm:mt-0 sm:absolute sm:-bottom-7 sm:-left-6 lg:-left-8 z-30 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-xl max-w-sm sm:max-w-[270px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-100 to-emerald-50 text-[#0B3D2E] flex items-center justify-center font-bold flex-shrink-0 shadow-xs border border-emerald-200/50">
              <Heart className="w-5 h-5 text-[#0B3D2E] fill-emerald-100" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-snug font-display">
                A Community That Feels Like Home
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                500+ Nepali students uniting across KIIT campus
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Controls: Arrows and Indicators */}
        {total > 1 && (
          <div className="flex items-center justify-between sm:justify-end gap-3 mt-4 sm:mt-5 px-1 sm:px-0">
            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Showcase slides">
              {displayImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    idx === activeIndex
                      ? "w-6 bg-[#0B3D2E]"
                      : "w-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}: ${img.title}`}
                  aria-selected={idx === activeIndex}
                  role="tab"
                />
              ))}
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center shadow-xs transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center shadow-xs transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
