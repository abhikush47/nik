"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  X,
  ExternalLink,
  Folder,
  FileText,
  Table,
  Presentation,
  FileDown,
  Film,
  Layers,
  Calendar,
  Tag as TagIcon,
  Sparkles,
} from "lucide-react";
import { ResourceItem, ResourceCategory, ResourceType } from "@/lib/types";

interface ResourcesHubProps {
  initialResources: ResourceItem[];
  categories: ResourceCategory[];
}

function getResourceTypeIcon(type: ResourceType) {
  switch (type) {
    case "Google Drive Folder":
      return <Folder className="w-4 h-4 text-emerald-700" />;
    case "Google Docs":
      return <FileText className="w-4 h-4 text-blue-600" />;
    case "Google Sheets":
      return <Table className="w-4 h-4 text-emerald-600" />;
    case "Google Slides":
      return <Presentation className="w-4 h-4 text-amber-600" />;
    case "PDF":
      return <FileDown className="w-4 h-4 text-rose-600" />;
    case "Video":
      return <Film className="w-4 h-4 text-purple-600" />;
    default:
      return <Layers className="w-4 h-4 text-gray-600" />;
  }
}

function getResourceTypeBadgeClass(type: ResourceType) {
  switch (type) {
    case "Google Drive Folder":
      return "bg-emerald-50 text-emerald-800 border-emerald-200/60";
    case "Google Docs":
      return "bg-blue-50 text-blue-800 border-blue-200/60";
    case "Google Sheets":
      return "bg-teal-50 text-teal-800 border-teal-200/60";
    case "Google Slides":
      return "bg-amber-50 text-amber-800 border-amber-200/60";
    case "PDF":
      return "bg-rose-50 text-rose-800 border-rose-200/60";
    case "Video":
      return "bg-purple-50 text-purple-800 border-purple-200/60";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function ResourcesHub({ initialResources, categories }: ResourcesHubProps) {
  const router = useRouter();
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [categoryList, setCategoryList] = useState<ResourceCategory[]>(categories);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync state if server props update
  useEffect(() => {
    setResources(initialResources);
  }, [initialResources]);

  useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  // Real-time zero-delay revalidation across tabs and window focus
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/resources?_t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.resources)) setResources(data.resources);
          if (Array.isArray(data.categories)) setCategoryList(data.categories);
        }
      } catch {}
    };

    const handleUpdate = () => {
      fetchLatest();
      router.refresh();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "nik_data_updated") {
        handleUpdate();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleUpdate();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleUpdate);
    document.addEventListener("visibilitychange", handleVisibility);

    let bc: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        bc = new BroadcastChannel("nik_live_sync");
        bc.onmessage = () => {
          handleUpdate();
        };
      } catch {}
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleUpdate);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (bc) bc.close();
    };
  }, [router]);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesCategory =
        selectedCategory === "all" ||
        res.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        res.title.toLowerCase().includes(q) ||
        (res.description && res.description.toLowerCase().includes(q)) ||
        res.category.toLowerCase().includes(q) ||
        (res.related_event && res.related_event.toLowerCase().includes(q)) ||
        (res.tags && res.tags.some((tag) => tag.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [resources, selectedCategory, searchQuery]);

  const activeCategoryName =
    selectedCategory === "all"
      ? "All Resources"
      : categoryList.find((c) => c.slug === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase())?.name || selectedCategory;

  return (
    <div className="space-y-8">
      {/* Search and Category Filter Controls */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, documents, events, or keywords..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm bg-gray-50/50 focus:bg-white focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/10 transition-all placeholder:text-gray-400 text-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-gray-500 font-medium whitespace-nowrap self-end md:self-center">
            Showing <strong className="text-gray-900">{filteredResources.length}</strong> of{" "}
            {initialResources.length} published resources
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-gray-100">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === "all"
                ? "bg-[#0B3D2E] text-white shadow-xs"
                : "bg-gray-100/80 text-gray-700 hover:bg-gray-200/70"
            }`}
          >
            <span>All Resources</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {initialResources.length}
            </span>
          </button>

          {categories.map((c) => {
            const count = initialResources.filter(
              (r) => r.category.toLowerCase() === c.name.toLowerCase() || r.category.toLowerCase() === c.slug.toLowerCase()
            ).length;
            const isSelected =
              selectedCategory === c.slug || selectedCategory.toLowerCase() === c.name.toLowerCase();

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#0B3D2E] text-white shadow-xs"
                    : "bg-gray-100/80 text-gray-700 hover:bg-gray-200/70"
                }`}
              >
                <span>{c.name}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#0B3D2E] flex items-center justify-center mx-auto border border-emerald-100">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900 font-display">
            No resources found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? `No resources match "${searchQuery}" in ${activeCategoryName}. Try adjusting your keywords or clearing the filter.`
              : `No resources have been published in "${activeCategoryName}" yet.`}
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold transition-colors"
            >
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <article
              key={res.id}
              className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-[#0B3D2E]/40 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Top Media / Thumbnail Banner */}
              <div className="relative h-44 w-full bg-linear-to-br from-[#0B3D2E]/10 via-emerald-50 to-warm-ivory border-b border-gray-100 overflow-hidden">
                {res.cover_image_url ? (
                  <Image
                    src={res.cover_image_url}
                    alt={res.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {getResourceTypeIcon(res.resource_type)}
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 mt-2 font-display">
                      {res.resource_type}
                    </span>
                  </div>
                )}

                {/* Category Pill Over Media */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#0B3D2E] shadow-xs backdrop-blur-xs">
                    {res.category}
                  </span>
                </div>

                {/* Featured Badge */}
                {res.featured && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-2.5 h-2.5" />
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Type and Event Info Row */}
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${getResourceTypeBadgeClass(
                        res.resource_type
                      )}`}
                    >
                      {getResourceTypeIcon(res.resource_type)}
                      <span>{res.resource_type}</span>
                    </span>

                    {res.event_date && (
                      <span className="text-gray-500 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(res.event_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-[#0B3D2E] transition-colors line-clamp-2 font-display">
                    {res.title}
                  </h3>

                  {/* Description */}
                  {res.description && (
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  {/* Related Event Badge */}
                  {res.related_event && (
                    <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">Event: {res.related_event}</span>
                    </div>
                  )}

                  {/* Tags */}
                  {res.tags && res.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {res.tags.slice(0, 4).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium"
                        >
                          <TagIcon className="w-2.5 h-2.5 text-gray-400" />
                          <span>{tag}</span>
                        </span>
                      ))}
                      {res.tags.length > 4 && (
                        <span className="text-[10px] text-gray-400 self-center">
                          +{res.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Google Drive Link</span>
                  <a
                    href={res.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B3D2E] text-white hover:bg-[#07261D] text-xs font-bold transition-all shadow-xs hover:shadow group-hover:scale-[1.02]"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
