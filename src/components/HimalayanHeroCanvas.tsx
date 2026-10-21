"use client";

import { useEffect, useRef, useState } from "react";

export default function HimalayanHeroCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);

    const handleScroll = () => {
      // Only apply parallax on screens >= 1024px and if scroll is within hero view
      if (window.innerWidth >= 1024 && window.scrollY < 600) {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const parallaxEnabled = isMounted && !reducedMotion;
  const p4 = parallaxEnabled ? scrollY * -0.04 : 0;
  const p3 = parallaxEnabled ? scrollY * -0.07 : 0;
  const p2 = parallaxEnabled ? scrollY * -0.11 : 0;
  const p1 = parallaxEnabled ? scrollY * -0.15 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl overflow-hidden border border-[#0B3D2E]/10 bg-gradient-to-br from-[#FFF8ED]/50 via-[#F7FAF7] to-[#EEF5F1]/80 shadow-lg shadow-emerald-950/5 min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] flex items-center justify-center p-4 sm:p-6 select-none transition-all duration-700 group hover:border-[#0B3D2E]/20 hover:shadow-xl"
      aria-label="The Himalayan Community Canvas: Nepal to Bhubaneswar visual artwork"
      role="img"
    >
      {/* 1. Subtle Ambient Vignette & Gradient Mask */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(11,61,46,0.06)_0%,transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(220,20,60,0.04)_0%,transparent_60%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative Inset Hairline Frame */}
      <div
        className="absolute inset-3 sm:inset-4 rounded-[20px] border border-[#0B3D2E]/8 pointer-events-none z-20"
        aria-hidden="true"
      />

      {/* 2. Background Integrated Typography (Low Opacity Editorial Words) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
        {/* BELONGING - Top focal typography */}
        <span
          className="absolute top-5 sm:top-7 right-5 sm:right-8 font-display font-black text-[clamp(2.5rem,6.5vw,4.8rem)] tracking-widest text-[#0B3D2E]/[0.08] uppercase leading-none transition-transform duration-700 ease-out"
          style={{ transform: `translateY(${p4}px)` }}
        >
          BELONGING
        </span>

        {/* CULTURE - Mid slope typography */}
        <span
          className="absolute top-32 sm:top-36 left-6 sm:left-10 font-display font-extrabold text-[clamp(1.8rem,4.5vw,3.2rem)] tracking-widest text-[#0B3D2E]/[0.14] uppercase leading-none transition-transform duration-700 ease-out"
          style={{ transform: `translateY(${p3}px)` }}
        >
          CULTURE
        </span>

        {/* Cursive "Namaste" Greeting Accent */}
        <span
          className="absolute top-24 sm:top-28 right-12 sm:right-20 font-script text-[#DC143C] text-[clamp(2rem,4.5vw,3.2rem)] leading-none -rotate-6 transition-all duration-700 drop-shadow-2xs hover:scale-105"
          style={{ transform: `translateY(${p3 * 1.1}px) rotate(-6deg)` }}
        >
          Namaste
        </span>

        {/* TOGETHER - Grounding typography */}
        <span
          className="absolute bottom-16 sm:bottom-20 right-8 sm:right-12 font-display font-black text-[clamp(1.5rem,3.8vw,2.6rem)] tracking-widest text-[#142B4A]/[0.35] uppercase leading-none transition-transform duration-700 ease-out"
          style={{ transform: `translateY(${p2}px)` }}
        >
          TOGETHER
        </span>
      </div>

      {/* 3. Layered Himalayan Landscape Illustration (SVG) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" aria-hidden="true">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 600 500"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Layer 4: Distant Pale Warm Gray Massif */}
            <linearGradient id="gradHimalayaFar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EBF1ED" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#F5F9F6" stopOpacity="0.3" />
            </linearGradient>

            {/* Layer 3: Pale Mint & Muted Sage Mid Peaks */}
            <linearGradient id="gradHimalayaMid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#Dce9e1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#EEF6F1" stopOpacity="0.4" />
            </linearGradient>

            {/* Layer 2: Soft Forest Sage Foothills */}
            <linearGradient id="gradHimalayaNear" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C8DFD2" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#E2F0E7" stopOpacity="0.25" />
            </linearGradient>

            {/* Subtle Gradient for Connecting Trajectory */}
            <linearGradient id="gradRoute" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B3D2E" />
              <stop offset="50%" stopColor="#DC143C" />
              <stop offset="100%" stopColor="#142B4A" />
            </linearGradient>
          </defs>

          {/* LAYER 4: Furthest Himalayan High Range (Deepest, Lowest Parallax) */}
          <g style={{ transform: `translateY(${p4}px)`, transition: "transform 0.1s ease-out" }}>
            <path
              d="M0,380 L0,230 L50,195 L110,235 L175,135 L230,185 L310,105 L370,170 L435,125 L505,210 L560,165 L600,190 L600,500 L0,500 Z"
              fill="url(#gradHimalayaFar)"
            />
            {/* Subtle Ridge Line */}
            <path
              d="M175,135 L200,210 L230,185 M310,105 L335,190 L370,170 M435,125 L470,220"
              stroke="#D3E0D8"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
          </g>

          {/* LAYER 3: Mid-distance Mint & Sage Peaks */}
          <g style={{ transform: `translateY(${p3}px)`, transition: "transform 0.1s ease-out" }}>
            <path
              d="M0,410 L0,270 L70,250 L140,180 L210,240 L290,165 L365,225 L440,175 L520,245 L600,215 L600,500 L0,500 Z"
              fill="url(#gradHimalayaMid)"
            />
            <path
              d="M140,180 L165,260 M290,165 L315,245 M440,175 L470,260"
              stroke="#B8D4C4"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
          </g>

          {/* LAYER 2: Lower Foothills & Rolling Ridges */}
          <g style={{ transform: `translateY(${p2}px)`, transition: "transform 0.1s ease-out" }}>
            <path
              d="M0,450 L0,320 L80,305 L160,250 L250,310 L345,260 L430,320 L515,280 L600,335 L600,500 L0,500 Z"
              fill="url(#gradHimalayaNear)"
            />
            {/* Topographic Contour Lines */}
            <path
              d="M0,350 Q160,280 345,290 T600,360"
              stroke="#0B3D2E"
              strokeWidth="1"
              strokeOpacity="0.18"
              strokeDasharray="4 3"
            />
            <path
              d="M0,380 Q200,320 400,340 T600,400"
              stroke="#0B3D2E"
              strokeWidth="1"
              strokeOpacity="0.14"
            />
          </g>

          {/* LAYER 1: Foreground Subtle Architectural / Cultural Contours */}
          <g style={{ transform: `translateY(${p1}px)`, transition: "transform 0.1s ease-out" }}>
            {/* Flowing bottom contours */}
            <path
              d="M0,420 Q120,380 280,410 T600,440 L600,500 L0,500 Z"
              fill="#EBF5EE"
              fillOpacity="0.4"
            />
            <path
              d="M0,420 Q120,380 280,410 T600,440"
              stroke="#0B3D2E"
              strokeWidth="1.2"
              strokeOpacity="0.22"
            />
          </g>

          {/* 4. THE CONNECTING-LINE MOTIF: NEPAL TO KIIT · BHUBANESWAR */}
          <g className="connecting-trajectory-group">
            {/* Main Smooth Curved Trajectory Arc */}
            <path
              d="M 90 145 C 190 85, 340 210, 505 385"
              stroke="url(#gradRoute)"
              strokeWidth="1.75"
              strokeDasharray="5 4"
              strokeLinecap="round"
              className={isMounted && !reducedMotion ? "animate-draw-trajectory" : ""}
            />

            {/* Faint secondary echo curve for organic depth */}
            <path
              d="M 90 145 C 180 120, 320 260, 505 385"
              stroke="#DC143C"
              strokeWidth="0.75"
              strokeOpacity="0.2"
              strokeDasharray="2 3"
            />

            {/* Symbolic Nodes */}
            {/* Origin Node: NEPAL */}
            <circle cx="90" cy="145" r="5" fill="#0B3D2E" />
            <circle cx="90" cy="145" r="9" stroke="#0B3D2E" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="90" cy="145" r="2" fill="#FFF8ED" />

            {/* Mid Journey Pulse Node (Crimson Connection) */}
            <circle cx="280" cy="205" r="3.5" fill="#DC143C" />
            <circle cx="280" cy="205" r="7" stroke="#DC143C" strokeWidth="1" strokeOpacity="0.35" />

            {/* Destination Node: KIIT · BHUBANESWAR */}
            <circle cx="505" cy="385" r="5" fill="#142B4A" />
            <circle cx="505" cy="385" r="9" stroke="#142B4A" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="505" cy="385" r="2" fill="#FFF8ED" />
          </g>
        </svg>
      </div>

      {/* 4. Overlay Editorial Interactive Markers & Node Labels */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Origin Label: NEPAL */}
        <div className="absolute top-[26%] left-[10%] sm:left-[12%] flex items-center gap-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#0B3D2E]/15 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0B3D2E]" />
          <div className="leading-tight">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#0B3D2E] uppercase block">
              NEPAL
            </span>
            <span className="text-[8px] font-mono text-gray-500 tracking-tight block">
              27.7° N • 8,848M
            </span>
          </div>
        </div>

        {/* Destination Label: KIIT · BHUBANESWAR */}
        <div className="absolute bottom-[20%] right-[10%] sm:right-[12%] flex items-center gap-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#142B4A]/15 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#142B4A]" />
          <div className="leading-tight">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#142B4A] uppercase block">
              KIIT · BHUBANESWAR
            </span>
            <span className="text-[8px] font-mono text-gray-500 tracking-tight block">
              20.3° N • CAMPUS HOME
            </span>
          </div>
        </div>

        {/* Midpoint Emblem: Crimson Cultural Hearth */}
        <div className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 bg-[#FFF8ED]/95 px-2 py-0.5 rounded-full border border-[#DC143C]/20 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
          <span className="text-[9px] font-mono font-semibold tracking-wider text-[#DC143C] uppercase">
            CULTURAL BRIDGE
          </span>
        </div>
      </div>

      {/* 5. Bottom Technical Data Strip (Refined Editorial Notes) */}
      <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6 z-20 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-gray-500 tracking-widest border-t border-[#0B3D2E]/10 pt-2 pointer-events-none">
        <span className="flex items-center gap-1 text-[#0B3D2E]/80">
          <span className="w-1 h-1 rounded-full bg-[#0B3D2E]" />
          HIMALAYAN HERITAGE
        </span>
        <span className="hidden sm:inline text-gray-600">
          ODISHA TEMPLE HORIZONS
        </span>
        <span className="flex items-center gap-1 text-[#142B4A]/80">
          <span className="w-1 h-1 rounded-full bg-[#142B4A]" />
          KIIT STUDENT HOME
        </span>
      </div>
    </div>
  );
}
