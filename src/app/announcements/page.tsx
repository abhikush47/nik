import { Megaphone } from "lucide-react";
import { getAnnouncements } from "@/lib/db";
import AnnouncementsFeed from "@/components/AnnouncementsFeed";

export const metadata = {
  title: "Announcements & Notices — NEPALI IN KIIT",
  description: "Official bulletins, festival registrations, hostel advisories, and community notices for Nepali students at KIIT University.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

      {/* Main Reactive List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnnouncementsFeed initialAnnouncements={announcements} />
      </div>
    </div>
  );
}
