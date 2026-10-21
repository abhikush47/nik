import Link from "next/link";
import { Megaphone, Calendar, Tag, ArrowUpRight, ExternalLink } from "lucide-react";
import { getAnnouncements } from "@/lib/db";

export const metadata = {
  title: "Announcements & Notices — NEPALI IN KIIT",
  description: "Official bulletins, festival registrations, hostel advisories, and community notices for Nepali students at KIIT University.",
};

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements({ onlyPublished: true });

  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#FFF8ED]/50 to-white pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Community Bulletin</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-display tracking-tight">
            Announcements & Official Notices
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Stay informed with verified updates regarding festival registrations, academic peer groups, and community initiatives.
          </p>
        </div>
      </section>

      {/* Main List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {announcements.length === 0 ? (
          <div className="p-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Megaphone className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">No active announcements</h3>
            <p className="text-xs text-gray-500 mt-1">
              There are no published announcements at this moment.
            </p>
          </div>
        ) : (
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
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {item.short_message}
                    </p>
                    {item.content && (
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-2">
                        {item.content}
                      </p>
                    )}
                  </div>

                  {item.destination_url && (
                    <div className="pt-3 border-t border-gray-100">
                      <Link
                        href={item.destination_url}
                        target={item.destination_url.startsWith("http") ? "_blank" : undefined}
                        rel={item.destination_url.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3D2E] hover:text-[#087F4F]"
                      >
                        <span>Related Link / Action</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
