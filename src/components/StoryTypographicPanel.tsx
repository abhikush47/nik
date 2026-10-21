"use client";

import { useEffect, useRef, useState } from "react";

export default function StoryTypographicPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Respect reduced-motion preferences immediately
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Safety fallback: guarantee visibility after 1 second if observer hasn't fired
    const timer = setTimeout(() => setIsVisible(true), 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative rounded-3xl overflow-hidden border border-[#0B3D2E]/15 shadow-xl shadow-emerald-950/5 bg-gradient-to-br from-[#FFF8ED] via-[#FFFDF9] to-white p-6 sm:p-8 lg:p-9 flex flex-col justify-between min-h-[440px] sm:min-h-[480px] lg:min-h-[500px] select-none transition-all duration-500 hover:shadow-2xl hover:border-[#0B3D2E]/25 group"
      aria-label="Our Story: Nepal to Bhubaneswar typographic editorial panel"
    >
      {/* Background Minimal Abstract Himalayan Contours */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none -z-0 opacity-[0.06] text-[#0B3D2E]"
        aria-hidden="true"
      >
        <svg
          className="absolute right-0 top-0 w-full h-44 sm:h-52"
          viewBox="0 0 400 180"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0,150 L60,95 L110,125 L170,60 L230,110 L290,45 L350,95 L400,65 L400,180 L0,180 Z"
            fill="currentColor"
          />
          <path
            d="M20,150 L80,90 L130,120 L190,50 L250,105 L310,40 L370,85 L400,60"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        </svg>
      </div>

      {/* Decorative Inset Border Hairline */}
      <div
        className="absolute inset-3 sm:inset-3.5 rounded-[22px] border border-[#0B3D2E]/8 pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Corner Graphic Accents */}
      <div
        className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-[#0B3D2E]/30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-[#142B4A]/30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-[#DC143C]/30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-[#0B3D2E]/30 pointer-events-none"
        aria-hidden="true"
      />

      {/* 1. Header Index & Label */}
      <div
        className={`relative z-10 flex items-center justify-between pb-3.5 border-b border-[#0B3D2E]/10 transition-all duration-700 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#DC143C] ring-4 ring-[#DC143C]/10" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-[#DC143C] uppercase">
            01 — OUR STORY
          </span>
        </div>
        <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">
          EST. KIIT BHUBANESWAR
        </span>
      </div>

      {/* 2. Visual Centerpiece: NEPAL to BHUBANESWAR */}
      <div className="relative z-10 my-auto py-5 sm:py-6 space-y-4">
        {/* Main Place Names with Cursive Bridge */}
        <div className="space-y-1">
          {/* NEPAL */}
          <div
            className={`flex items-baseline justify-between transition-all duration-700 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <span className="text-[clamp(2.4rem,6vw,3.8rem)] font-black uppercase tracking-tight text-[#0B3D2E] font-display leading-none">
              NEPAL
            </span>
            <span className="text-[10px] font-mono text-[#0B3D2E]/60 tracking-widest uppercase hidden sm:inline">
              27.7° N • HIMALAYAS
            </span>
          </div>

          {/* Cursive Bridge Connector "to" with Arched Line Motif */}
          <div className="relative flex items-center justify-start pl-4 sm:pl-8 py-0.5 sm:py-1">
            {/* Fine curved trajectory route SVG */}
            <svg
              className="absolute left-0 right-6 top-1/2 -translate-y-1/2 w-48 sm:w-64 h-8 sm:h-10 text-[#DC143C]/40 pointer-events-none"
              viewBox="0 0 240 40"
              fill="none"
            >
              <path
                d="M 10 28 Q 70 4, 150 20 T 230 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className={`transition-all duration-1000 ease-out ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              />
              <circle cx="10" cy="28" r="3" fill="#0B3D2E" />
              <circle cx="230" cy="18" r="3" fill="#142B4A" />
            </svg>

            {/* Handwritten cursive "to" */}
            <span
              className={`relative z-10 font-script hero-cursive-in text-[#DC143C] text-[clamp(2.8rem,7vw,4.5rem)] leading-none px-2 select-none drop-shadow-2xs transition-all duration-700 delay-150 ease-out ${
                isVisible
                  ? "opacity-100 scale-100 -rotate-6"
                  : "opacity-0 scale-90 rotate-0"
              }`}
              aria-label="to"
            >
              to
            </span>
          </div>

          {/* BHUBANESWAR */}
          <div
            className={`flex items-baseline justify-between transition-all duration-700 delay-300 ease-out ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <span className="text-[clamp(1.85rem,4.8vw,3.1rem)] font-black uppercase tracking-tight text-[#142B4A] font-display leading-none">
              BHUBANESWAR
            </span>
            <span className="text-[10px] font-mono text-[#142B4A]/60 tracking-widest uppercase hidden sm:inline">
              20.3° N • TEMPLE CITY
            </span>
          </div>
        </div>

        {/* Supporting Narrative Statement */}
        <div
          className={`pt-3.5 border-t border-[#0B3D2E]/10 transition-all duration-700 delay-450 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <p className="font-serif italic text-base sm:text-lg text-gray-800 leading-snug">
            “Different places. <br className="hidden sm:inline" />
            <span className="text-[#0B3D2E] font-semibold not-italic">One sense of belonging.</span>”
          </p>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-normal">
            An unbroken student bridge uniting generations across campus hostels, lecture halls, and festival seasons.
          </p>
        </div>
      </div>

      {/* 3. Bottom Trim: CULTURE / CONNECTION / COMMUNITY */}
      <div
        className={`relative z-10 pt-3 border-t border-[#0B3D2E]/10 transition-all duration-700 delay-500 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#0B3D2E]/80">
          <span className="hover:text-[#DC143C] transition-colors">CULTURE</span>
          <span className="text-[#DC143C]/50 font-normal">/</span>
          <span className="hover:text-[#0B3D2E] transition-colors">CONNECTION</span>
          <span className="text-[#142B4A]/50 font-normal">/</span>
          <span className="hover:text-[#142B4A] transition-colors">COMMUNITY</span>
        </div>
      </div>
    </div>
  );
}
