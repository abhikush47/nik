import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Users,
  Compass,
  Sparkles,
  Heart,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import {
  getSiteSettings,
  getUpcomingEvents,
  getFeaturedGalleryImages,
  getAnnouncements,
} from "@/lib/db";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, upcomingEvents, galleryImages, announcements] = await Promise.all([
    getSiteSettings(),
    getUpcomingEvents(),
    getFeaturedGalleryImages(),
    getAnnouncements({ onlyPublished: true }),
  ]);

  const recentAnnouncements = announcements.slice(0, 3);
  const nextEvents = upcomingEvents.slice(0, 3);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 lg:pt-16 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Copy */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              {/* Overline pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#16A05D] animate-ping" />
                <span>Two Nations. One Community.</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[#17231B] leading-[1.08] font-display">
                Far from home. <br />
                <span className="text-[#0B3D2E] underline decoration-[#DC143C]/40 decoration-wavy decoration-2 underline-offset-8">
                  Never far from
                </span>{" "}
                <span className="text-[#142B4A]">each other.</span>
              </h1>

              {/* Supporting Description */}
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-2xl font-normal">
                {settings.hero_description ||
                  "NEPALI IN KIIT brings Nepali students together through culture, friendship, shared experiences, and an enduring sense of belonging at KIIT University, Bhubaneswar."}
              </p>

              {/* Community Inclusivity Statement */}
              <div className="p-4 rounded-xl bg-[#FFF8ED] border-l-4 border-[#0B3D2E] text-xs sm:text-sm text-[#17231B]/90 font-medium max-w-xl shadow-xs">
                “Every Nepali in KIIT belongs here. Whether you participate in every event or simply want to connect with familiar roots, you are family.”
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/join"
                  className="px-7 py-3.5 rounded-xl bg-[#0B3D2E] hover:bg-[#07261D] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-sm active:scale-95"
                >
                  <span>Explore Our Community</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </Link>

                <Link
                  href="/events"
                  className="px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-gray-800 font-semibold text-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <span>Discover Events</span>
                  <Calendar className="w-4 h-4 text-gray-500" />
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative border accent */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#0B3D2E]/20 via-[#DC143C]/10 to-[#142B4A]/20 rounded-3xl blur-lg opacity-70" />

                {/* Main Hero Card */}
                <div className="relative rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xl bg-white">
                  <div className="relative h-96 sm:h-[430px] w-full">
                    <Image
                      src="/images/community/dashain-together.png"
                      alt="Nepali students celebrating Grand Dashain together at KIIT University"
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Badge at Bottom */}
                    <div className="absolute bottom-5 inset-x-5 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950/70 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                        Cultural Festivities
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2 leading-tight">
                        Vijaya Dashami & Cultural Celebrations
                      </h3>
                      <p className="text-xs text-gray-300 mt-1">
                        KIIT Campus 6 & Bhubaneswar Community
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating secondary badge */}
                <div className="absolute -bottom-6 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-xl max-w-[240px] hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0B3D2E] flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-none">Shared Home</p>
                      <p className="text-[11px] text-gray-500 mt-1">Every Nepali student at KIIT belongs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMMUNITY INTRODUCTION & STATEMENT */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#087F4F]">
              Our Identity & Purpose
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] font-display">
              Built by students, for students.
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-normal">
              NEPALI IN KIIT is the independent cultural and community sanctuary for all Nepali students at KIIT Deemed to be University, Bhubaneswar, Odisha. We provide guidance for freshers arriving in India, host grand celebrations for Dashain and Tihar, facilitate academic peer mentorship, and support one another through every high and low of college life.
            </p>
            <div className="pt-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0B3D2E] hover:text-[#087F4F] transition-colors"
              >
                <span>Read our story and core vision</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#DC143C]">
              Mark Your Calendars
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] font-display mt-1">
              Upcoming Community Gatherings
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B3D2E] hover:text-[#087F4F]"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {nextEvents.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">
              No upcoming events are scheduled at the moment.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Check back soon or explore past memories in our gallery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nextEvents.map((event) => {
              const dateObj = new Date(event.start_date);
              const dateFormatted = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={event.cover_image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-[#0B3D2E] shadow-xs">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#DC143C]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateFormatted}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0B3D2E] transition-colors leading-snug">
                        <Link href={`/events/${event.slug}`}>{event.title}</Link>
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {event.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                      <Link
                        href={`/events/${event.slug}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-50 group-hover:bg-[#0B3D2E] text-gray-700 group-hover:text-white text-xs font-semibold transition-all"
                      >
                        <span>Event Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. VALUES SECTION */}
      <section className="bg-[#0B3D2E] text-white py-20 relative overflow-hidden">
        {/* Subtle decorative background detail */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#16A05D_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Guiding Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display mt-1">
              What NEPALI IN KIIT Stands For
            </h2>
            <p className="text-gray-300 text-sm mt-3 leading-relaxed">
              Our community is grounded in mutual assistance, cultural preservation, and shared companionship across every degree and cohort.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                title: "Unity (Ekata)",
                desc: "Uniting students from every district and background across Nepal with equal belonging.",
                icon: Users,
              },
              {
                title: "Heritage (Sanskriti)",
                desc: "Honoring our festivals, language, traditional cuisine, music, and art on Indian soil.",
                icon: Sparkles,
              },
              {
                title: "Belonging (Apnatwa)",
                desc: "A warm environment where no student feels like a stranger or left behind.",
                icon: Heart,
              },
              {
                title: "Friendship (Miteri)",
                desc: "Lifelong bonds bridging senior guides and junior batches across hostels and schools.",
                icon: Compass,
              },
              {
                title: "Growth (Bikas)",
                desc: "Academic collaboration, peer tutoring, career networking, and leadership development.",
                icon: BookOpen,
              },
            ].map((v, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/40 transition-all duration-300 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center">
                  <v.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{v.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#087F4F]">
              Visual Memories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] font-display mt-1">
              Moments That Bring Us Together
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B3D2E] hover:text-[#087F4F]"
          >
            <span>Explore Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.slice(0, 6).map((img) => (
            <Link
              key={img.id}
              href="/gallery"
              className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-gray-100 bg-gray-100"
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || img.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-4 inset-x-4 text-white z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  {img.category_slug.replace("-", " ")}
                </span>
                <h3 className="text-sm font-bold text-white mt-1 group-hover:text-emerald-200 transition-colors line-clamp-1">
                  {img.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. ANNOUNCEMENTS PREVIEW */}
      {recentAnnouncements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gray-50 border border-gray-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#DC143C]">
                  Official Bulletin
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display mt-1">
                  Recent Announcements
                </h2>
              </div>
              <Link
                href="/announcements"
                className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E] hover:underline"
              >
                All Announcements →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-colors"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-[#0B3D2E] inline-block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {item.short_message}
                    </p>
                  </div>

                  <Link
                    href={item.destination_url || "/announcements"}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0B3D2E] hover:text-[#087F4F]"
                  >
                    <span>Read update</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. COMMUNITY CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#142B4A] text-white p-8 sm:p-14 lg:p-16 border border-[#142B4A]">
          {/* Subtle Dhaka / geometric motif accent */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#FFF8ED_2px,transparent_2px)] [background-size:24px_24px] hidden md:block" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Welcome to the Family
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display leading-tight">
              Your journey at KIIT is better together.
            </h2>
            <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
              Find your people. Celebrate your roots. Whether you just stepped on campus or are finishing your final semester, connect with the Nepali student community.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/join"
                className="px-8 py-4 rounded-xl bg-[#DC143C] hover:bg-[#B80F32] text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2"
              >
                <span>Join NIK Community</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
              >
                <span>Contact Coordinators</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
