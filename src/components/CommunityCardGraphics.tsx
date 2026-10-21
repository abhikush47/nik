import React from "react";

/**
 * Card 1 — Cultural Life Graphic
 * Minimalist vector artwork representing Nepali cultural identity:
 * Abstract Himalayan contours, traditional mandala/ceremonial motif,
 * and delicate marigold garland curves in Forest Green, Warm Ivory, and Crimson.
 */
export function CulturalLifeGraphic() {
  return (
    <div className="w-full h-44 sm:h-48 relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FFF8ED] via-[#FBF9F4] to-[#F0FDF4] border border-emerald-900/10 flex items-center justify-center select-none group-hover:border-emerald-500/30 transition-colors">
      <svg
        viewBox="0 0 360 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="himalayaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B3D2E" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#087F4F" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="mandalaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#087F4F" />
            <stop offset="100%" stopColor="#0B3D2E" />
          </linearGradient>
        </defs>

        {/* Subtle decorative grid background */}
        <line x1="30" y1="0" x2="30" y2="170" stroke="#0B3D2E" strokeOpacity="0.03" strokeWidth="1" />
        <line x1="180" y1="0" x2="180" y2="170" stroke="#0B3D2E" strokeOpacity="0.03" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="330" y1="0" x2="330" y2="170" stroke="#0B3D2E" strokeOpacity="0.03" strokeWidth="1" />
        <line x1="0" y1="85" x2="360" y2="85" stroke="#0B3D2E" strokeOpacity="0.03" strokeWidth="1" strokeDasharray="3 3" />

        {/* Layer 1: Distant Himalayan mountain ridge silhouette */}
        <path
          d="M0,135 L45,100 L95,128 L145,82 L180,105 L225,70 L275,115 L320,88 L360,118 L360,170 L0,170 Z"
          fill="url(#himalayaGrad)"
        />

        {/* Layer 2: Clean contour lines of mountain peaks */}
        <path
          d="M20,132 L75,88 L120,118 L165,65 L180,78 L215,52 L260,102 L305,74 L350,110"
          stroke="#087F4F"
          strokeWidth="1.25"
          strokeOpacity="0.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M60,130 L110,95 L145,118 L180,82 L230,120 L280,88 L330,125"
          stroke="#0B3D2E"
          strokeWidth="1"
          strokeOpacity="0.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 3"
        />

        {/* Layer 3: Stylized festive festoon curve / marigold garland */}
        <path
          d="M20,28 Q180,68 340,28"
          stroke="#D6B36A"
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="2 3"
        />
        {/* Festive marigold / diyo blossoms along curve */}
        <circle cx="80" cy="40" r="3" fill="#D6B36A" fillOpacity="0.7" />
        <circle cx="130" cy="47" r="3.5" fill="#DC143C" fillOpacity="0.8" />
        <circle cx="180" cy="49" r="4" fill="#087F4F" fillOpacity="0.8" />
        <circle cx="230" cy="47" r="3.5" fill="#DC143C" fillOpacity="0.8" />
        <circle cx="280" cy="40" r="3" fill="#D6B36A" fillOpacity="0.7" />

        {/* Layer 4: Central Sacred Cultural Mandala Motif */}
        <g transform="translate(180, 98)">
          {/* Outer dotted aura ring */}
          <circle cx="0" cy="0" r="38" stroke="#D6B36A" strokeWidth="1" strokeOpacity="0.45" strokeDasharray="3 3" />
          <circle cx="0" cy="0" r="30" stroke="#087F4F" strokeWidth="1" strokeOpacity="0.25" />

          {/* 8-Petal stylized mandala geometry */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <path
              key={angle}
              d="M0,0 C-5,-16 5,-16 0,-24 C-5,-16 -5,-16 0,0"
              transform={`rotate(${angle})`}
              fill="url(#mandalaGrad)"
              fillOpacity="0.12"
              stroke="#0B3D2E"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          ))}

          {/* Inner sanctum ring */}
          <circle cx="0" cy="0" r="14" fill="#FFF8ED" stroke="#0B3D2E" strokeWidth="1.25" strokeOpacity="0.6" />

          {/* Golden ceremonial ring */}
          <circle cx="0" cy="0" r="8" fill="#F0FDF4" stroke="#D6B36A" strokeWidth="1.25" />

          {/* Central crimson Tika / Diyo flame accent */}
          <circle cx="0" cy="0" r="3.5" fill="#DC143C" />
          <path d="M0,-5 Q2,-1 0,0 Q-2,-1 0,-5" fill="#DC143C" />
        </g>

        {/* Delicate side botanical flourishes */}
        <path
          d="M40,115 C35,100 45,90 55,85 C50,95 55,105 40,115 Z"
          fill="#087F4F"
          fillOpacity="0.15"
          stroke="#087F4F"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
        <path
          d="M320,115 C325,100 315,90 305,85 C310,95 305,105 320,115 Z"
          fill="#087F4F"
          fillOpacity="0.15"
          stroke="#087F4F"
          strokeWidth="1"
          strokeOpacity="0.3"
        />
      </svg>
    </div>
  );
}

/**
 * Card 2 — Arts & Expression Graphic
 * Minimalist vector artwork representing Nepali music, performance, and creative arts:
 * Harmonic sound waves, Sarangi strings, rhythm resonance curves,
 * and musical pulses in Forest Green, Ivory, and Crimson.
 */
export function ArtsExpressionGraphic() {
  return (
    <div className="w-full h-44 sm:h-48 relative overflow-hidden rounded-xl bg-gradient-to-br from-[#FFF8ED] via-[#FDF8F9] to-[#FEF2F2] border border-rose-900/10 flex items-center justify-center select-none group-hover:border-rose-400/40 transition-colors">
      <svg
        viewBox="0 0 360 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0B3D2E" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#DC143C" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#087F4F" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Ambient harmonic grid lines */}
        <line x1="40" y1="0" x2="40" y2="170" stroke="#DC143C" strokeOpacity="0.03" strokeWidth="1" />
        <line x1="180" y1="0" x2="180" y2="170" stroke="#DC143C" strokeOpacity="0.03" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="320" y1="0" x2="320" y2="170" stroke="#DC143C" strokeOpacity="0.03" strokeWidth="1" />

        {/* Concentric sound rhythm radiation rings */}
        <g transform="translate(180, 85)">
          <circle cx="0" cy="0" r="58" stroke="#DC143C" strokeWidth="1" strokeOpacity="0.08" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r="42" stroke="#0B3D2E" strokeWidth="1" strokeOpacity="0.12" />
          <circle cx="0" cy="0" r="28" stroke="#D6B36A" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
        </g>

        {/* Flowing harmonic sine wave oscillations (sound waves) */}
        <path
          d="M10,85 C50,45 80,125 120,85 C160,45 200,125 240,85 C280,45 310,125 350,85"
          stroke="#0B3D2E"
          strokeWidth="1.75"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
        <path
          d="M10,85 C50,115 80,55 120,85 C160,115 200,55 240,85 C280,115 310,55 350,85"
          stroke="#DC143C"
          strokeWidth="1.25"
          strokeOpacity="0.4"
          strokeLinecap="round"
          strokeDasharray="4 2"
        />
        <path
          d="M30,85 C70,60 110,110 150,85 C190,60 230,110 270,85 C300,65 320,95 340,85"
          stroke="#D6B36A"
          strokeWidth="1"
          strokeOpacity="0.5"
          strokeLinecap="round"
        />

        {/* Stylized Sarangi / Acoustic Soundboard Centerpiece */}
        <g transform="translate(180, 85)">
          {/* Instrument waist / body contour */}
          <path
            d="M-22,-44 C-12,-20 -28,0 -28,24 C-28,42 -10,48 0,48 C10,48 28,42 28,24 C28,0 12,-20 22,-44 Z"
            fill="#FFF8ED"
            stroke="#0B3D2E"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />

          {/* Soundboard bridge & acoustic resonance slots */}
          <path d="M-10,-12 C-6,-8 -6,8 -10,12" stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10,-12 C6,-8 6,8 10,12" stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="-10" cy="-14" r="1.5" fill="#DC143C" />
          <circle cx="-10" cy="14" r="1.5" fill="#DC143C" />
          <circle cx="10" cy="-14" r="1.5" fill="#DC143C" />
          <circle cx="10" cy="14" r="1.5" fill="#DC143C" />

          {/* Center wooden bridge */}
          <rect x="-14" y="2" width="28" height="4" rx="2" fill="#0B3D2E" fillOpacity="0.8" />

          {/* Acoustic instrument strings running vertically */}
          <line x1="-6" y1="-52" x2="-6" y2="44" stroke="#087F4F" strokeWidth="1" strokeOpacity="0.7" />
          <line x1="-2" y1="-52" x2="-2" y2="44" stroke="#0B3D2E" strokeWidth="1.25" strokeOpacity="0.8" />
          <line x1="2" y1="-52" x2="2" y2="44" stroke="#DC143C" strokeWidth="1" strokeOpacity="0.8" />
          <line x1="6" y1="-52" x2="6" y2="44" stroke="#D6B36A" strokeWidth="1" strokeOpacity="0.8" />
        </g>

        {/* Floating artistic beat sparks / musical dynamics */}
        <g transform="translate(90, 48)">
          <path d="M0,-6 L1,-1 L6,0 L1,1 L0,6 L-1,1 L-6,0 L-1,-1 Z" fill="#DC143C" fillOpacity="0.75" />
        </g>
        <g transform="translate(270, 48)">
          <path d="M0,-6 L1,-1 L6,0 L1,1 L0,6 L-1,1 L-6,0 L-1,-1 Z" fill="#087F4F" fillOpacity="0.75" />
        </g>
        <g transform="translate(75, 122)">
          <circle cx="0" cy="0" r="2.5" fill="#D6B36A" fillOpacity="0.8" />
        </g>
        <g transform="translate(285, 122)">
          <circle cx="0" cy="0" r="2.5" fill="#DC143C" fillOpacity="0.8" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Card 3 — Campus Navigation Graphic
 * Minimalist vector artwork representing campus guidance, wayfinding, and orientation:
 * Architectural pathway grid, campus nodes, trajectory path,
 * and compass rose marker in Deep Navy, Forest Green, and Crimson.
 */
export function CampusNavigationGraphic() {
  return (
    <div className="w-full h-44 sm:h-48 relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F0FDF4] via-[#F8FAFC] to-[#EFF6FF] border border-blue-900/10 flex items-center justify-center select-none group-hover:border-blue-400/40 transition-colors">
      <svg
        viewBox="0 0 360 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#142B4A" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#087F4F" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Minimal isometric / architectural campus route grid */}
        <g stroke="#142B4A" strokeOpacity="0.05" strokeWidth="1">
          <line x1="30" y1="0" x2="30" y2="170" />
          <line x1="100" y1="0" x2="100" y2="170" />
          <line x1="180" y1="0" x2="180" y2="170" />
          <line x1="260" y1="0" x2="260" y2="170" />
          <line x1="330" y1="0" x2="330" y2="170" />

          <line x1="0" y1="40" x2="360" y2="40" />
          <line x1="0" y1="85" x2="360" y2="85" strokeDasharray="4 4" />
          <line x1="0" y1="130" x2="360" y2="130" />
        </g>

        {/* Stylized campus school blocks (architectural footprints) */}
        <rect x="50" y="32" width="28" height="18" rx="3" fill="#142B4A" fillOpacity="0.05" stroke="#142B4A" strokeWidth="1" strokeOpacity="0.2" />
        <rect x="282" y="32" width="28" height="18" rx="3" fill="#0B3D2E" fillOpacity="0.05" stroke="#0B3D2E" strokeWidth="1" strokeOpacity="0.2" />
        <rect x="65" y="118" width="34" height="20" rx="3" fill="#142B4A" fillOpacity="0.05" stroke="#142B4A" strokeWidth="1" strokeOpacity="0.2" />
        <rect x="260" y="118" width="32" height="20" rx="3" fill="#0B3D2E" fillOpacity="0.05" stroke="#0B3D2E" strokeWidth="1" strokeOpacity="0.2" />

        {/* Curved wayfinding trajectory connecting newcomer node to community hub */}
        <path
          d="M64,128 C100,128 115,70 170,85 C215,96 230,50 282,41"
          stroke="#0B3D2E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 4"
        />

        {/* Waypoint nodes along the journey */}
        <circle cx="64" cy="128" r="6" fill="#FFF8ED" stroke="#142B4A" strokeWidth="2" />
        <circle cx="64" cy="128" r="2.5" fill="#142B4A" />

        <circle cx="170" cy="85" r="4.5" fill="#FFF8ED" stroke="#087F4F" strokeWidth="1.5" />
        <circle cx="170" cy="85" r="2" fill="#087F4F" />

        <circle cx="282" cy="41" r="6" fill="#FFF8ED" stroke="#DC143C" strokeWidth="2" />
        <circle cx="282" cy="41" r="2.5" fill="#DC143C" />

        {/* Central Navigational Compass Rose & Beacon */}
        <g transform="translate(180, 85)">
          {/* Subtle radar pulse rings */}
          <circle cx="0" cy="0" r="46" stroke="#142B4A" strokeWidth="1" strokeOpacity="0.08" strokeDasharray="3 3" />
          <circle cx="0" cy="0" r="32" stroke="#087F4F" strokeWidth="1" strokeOpacity="0.18" />

          {/* 4-Point Compass Star */}
          {/* North point (Navy) */}
          <polygon points="0,-24 4,-6 0,-2 -4,-6" fill="#142B4A" />
          {/* South point */}
          <polygon points="0,24 4,6 0,2 -4,6" fill="#142B4A" fillOpacity="0.4" />
          {/* East point (Emerald) */}
          <polygon points="24,0 6,4 2,0 6,-4" fill="#087F4F" />
          {/* West point */}
          <polygon points="-24,0 -6,4 -2,0 -6,-4" fill="#087F4F" fillOpacity="0.4" />

          {/* Center compass pivot core */}
          <circle cx="0" cy="0" r="6" fill="#FFFFFF" stroke="#142B4A" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="2.5" fill="#DC143C" />
        </g>

        {/* Campus location pin icon accent near destination */}
        <g transform="translate(295, 41)">
          <path
            d="M0,-12 C-5,-12 -8,-8 -8,-3 C-8,3 0,10 0,10 C0,10 8,3 8,-3 C8,-8 5,-12 0,-12 Z"
            fill="#DC143C"
            fillOpacity="0.9"
          />
          <circle cx="0" cy="-4" r="2.5" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}
