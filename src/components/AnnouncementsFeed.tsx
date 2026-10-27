"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Megaphone, Calendar, ArrowUpRight, ExternalLink } from "lucide-react";
import { Announcement } from "@/lib/types";

interface AnnouncementsFeedProps {
  initialAnnouncements: Announcement[];
}

export default function AnnouncementsFeed({ initialAnnouncements }: AnnouncementsFeedProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements || []);

  useEffect(() => {
    setAnnouncements(initialAnnouncements || []);
  }, [initialAnnouncements]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/announcements?_t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.announcements)) setAnnouncements(data.announcements);
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

  if (announcements.length === 0) {
    return (
      <div className="p-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <Megaphone className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-800">No active announcements</h3>
        <p className="text-xs text-gray-500 mt-1">
          There are no published announcements at this moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {announcements.map((item) => {
        const dateObj = new Date(item.start_time);
        const dateFormatted = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const isUrgent = item.priority === "urgent" || item.priority === "high";

        return (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-4 ${
              isUrgent ? "border-red-200 bg-red-50/10" : "border-gray-200"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0B3D2E]">
                  {item.category}
                </span>
                {isUrgent && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DC143C] text-white">
                    Important Notice
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{dateFormatted}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-display">
                {item.title}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
                {item.short_message}
              </p>
              {item.content && (
                <div className="pt-2 text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t border-gray-100 mt-3">
                  {item.content}
                </div>
              )}
            </div>

            {item.destination_url && (
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href={item.destination_url}
                  target={item.destination_url.startsWith("http") ? "_blank" : undefined}
                  rel={item.destination_url.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D2E] hover:text-[#07261D] group"
                >
                  <span>Learn more & proceed</span>
                  {item.destination_url.startsWith("http") ? (
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  )}
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
