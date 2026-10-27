"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Search, ArrowRight, CheckCircle, Clock } from "lucide-react";
import { EventItem } from "@/lib/types";

interface EventsFilterProps {
  initialEvents: EventItem[];
}

const CATEGORIES = [
  "All",
  "Cultural Celebrations",
  "Student Gathering",
  "Sports & Tournaments",
  "Academic & Workshops",
];

export default function EventsFilter({ initialEvents }: EventsFilterProps) {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(initialEvents || []);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setEvents(initialEvents || []);
  }, [initialEvents]);

  // Real-time zero-delay cross-tab listener
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/events?_t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.events)) setEvents(data.events);
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

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleUpdate);
    const visHandler = () => {
      if (document.visibilityState === "visible") handleUpdate();
    };
    document.addEventListener("visibilitychange", visHandler);

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
      document.removeEventListener("visibilitychange", visHandler);
      if (bc) bc.close();
    };
  }, [router]);

  const { upcomingList, pastList } = useMemo(() => {
    const currentTime = new Date();
    const upcoming: EventItem[] = [];
    const past: EventItem[] = [];

    for (const ev of events) {
      const evDate = new Date(ev.start_date);
      if (ev.status === "past" || evDate < currentTime) {
        past.push(ev);
      } else {
        upcoming.push(ev);
      }
    }

    return {
      upcomingList: upcoming.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()),
      pastList: past.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()),
    };
  }, [events]);

  const activeList = tab === "upcoming" ? upcomingList : pastList;

  const filteredEvents = useMemo(() => {
    return activeList.filter((ev) => {
      const matchesCategory =
        selectedCategory === "All" || ev.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.summary.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [activeList, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Tab Switcher & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        {/* Upcoming vs Past Tabs */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl max-w-fit">
          <button
            onClick={() => setTab("upcoming")}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "upcoming"
                ? "bg-white text-[#0B3D2E] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Upcoming Events ({upcomingList.length})
          </button>
          <button
            onClick={() => setTab("past")}
            className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              tab === "past"
                ? "bg-white text-[#0B3D2E] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Past Memories ({pastList.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] transition-all bg-white"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-[#0B3D2E] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No events found</h3>
          <p className="text-gray-500 text-xs mt-1">
            {tab === "upcoming"
              ? "There are currently no upcoming events matching this filter. Check back soon!"
              : "No past events match this query."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const dateObj = new Date(event.start_date);
            const dateFormatted = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const timeFormatted = dateObj.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={event.id}
                className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={event.cover_image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#0B3D2E] shadow-xs">
                      {event.category}
                    </span>
                  </div>
                  {event.registration_status === "open" && tab === "upcoming" && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16A05D] text-white flex items-center gap-1 shadow-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>Registration Open</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#DC143C]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dateFormatted} • {timeFormatted}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0B3D2E] transition-colors leading-snug line-clamp-2">
                      <Link href={`/events/${event.slug}`}>{event.title}</Link>
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {event.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>

                    <Link
                      href={`/events/${event.slug}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-gray-50 group-hover:bg-[#0B3D2E] text-gray-700 group-hover:text-white text-xs font-semibold transition-all"
                    >
                      <span>View Event Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
