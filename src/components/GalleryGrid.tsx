"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Tag, Camera, Maximize2 } from "lucide-react";
import { GalleryImage, GalleryCategory } from "@/lib/types";
import Lightbox from "./Lightbox";

interface GalleryGridProps {
  initialImages: GalleryImage[];
  categories: GalleryCategory[];
}

export default function GalleryGrid({ initialImages, categories }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    return initialImages.filter((img) => {
      const matchesCategory =
        selectedCategory === "all" || img.category_slug === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        img.title.toLowerCase().includes(q) ||
        img.alt_text.toLowerCase().includes(q) ||
        (img.photographer_credit && img.photographer_credit.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialImages, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "all"
                ? "bg-[#0B3D2E] text-white shadow-xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Moments ({initialImages.length})
          </button>
          {categories.map((cat) => {
            const count = initialImages.filter((i) => i.category_slug === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-[#0B3D2E] text-white shadow-xs"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.name} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search moments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-full border border-gray-200 bg-white text-xs focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all"
          />
        </div>
      </div>

      {/* Grid of Images */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">No photographs found matching your filter.</p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-3 text-xs font-semibold text-[#0B3D2E] underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 bg-gray-100"
            >
              <Image
                src={image.image_url}
                alt={image.alt_text || image.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              {/* Category badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                  <Tag className="w-3 h-3 text-emerald-300" />
                  {image.category_slug.replace("-", " ")}
                </span>
              </div>

              {/* Maximize icon on hover */}
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md inline-block">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Caption details at bottom */}
              <div className="absolute bottom-0 inset-x-0 p-4 text-white z-10 transition-transform duration-300">
                <h3 className="text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-emerald-200">
                  {image.title}
                </h3>
                {image.photographer_credit && (
                  <p className="text-xs text-emerald-300/80 mt-1 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>{image.photographer_credit}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        images={filteredImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
}
