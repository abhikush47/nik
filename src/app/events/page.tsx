import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { getEvents, getFeaturedEvent } from "@/lib/db";
import EventsFilter from "@/components/EventsFilter";

export const metadata = {
  title: "Events & Celebrations — NEPALI IN KIIT",
  description: "Browse upcoming and past events hosted by NEPALI IN KIIT: Grand Dashain, musical acoustic nights, freshers orientations, and sports tournaments.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [events, featuredEvent] = await Promise.all([
    getEvents({ onlyPublished: true }),
    getFeaturedEvent(),
  ]);

  return (
    <div className="space-y-16 pb-24">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-b from-[#FFF8ED]/60 to-white pt-16 pb-14 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider">
            <span>Community Calendar</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-display tracking-tight">
            Events & Cultural Celebrations
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            From grand Dashain Tika ceremonies to weekend acoustic evenings and futsal tournaments, explore all NIK gatherings.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. Featured Event Banner (if available) */}
        {featuredEvent && (
          <section className="relative rounded-3xl overflow-hidden border border-gray-200/80 shadow-md bg-[#0D1C30] text-white">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="relative h-64 sm:h-80 lg:h-auto lg:col-span-5 bg-gray-900">
                <Image
                  src={featuredEvent.cover_image}
                  alt={featuredEvent.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
              </div>

              <div className="p-8 sm:p-10 lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#DC143C] text-white">
                      Featured Spotlight
                    </span>
                    <span className="text-xs text-emerald-300 font-semibold">
                      {featuredEvent.category}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display leading-snug">
                    <Link href={`/events/${featuredEvent.slug}`}>
                      {featuredEvent.title}
                    </Link>
                  </h2>

                  <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                    {featuredEvent.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs text-gray-300">
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="w-4 h-4 text-[#DC143C]" />
                      <span>
                        {new Date(featuredEvent.start_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span>{featuredEvent.venue}</span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${featuredEvent.slug}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0B3D2E] font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 transition-all shadow-sm"
                  >
                    <span>View Event & Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Filterable Events Grid (Upcoming & Past) */}
        <EventsFilter initialEvents={events} />
      </div>
    </div>
  );
}
