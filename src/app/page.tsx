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
  Shield,
  GraduationCap,
} from "lucide-react";
import {
  getSiteSettings,
  getUpcomingEvents,
  getFeaturedGalleryImages,
  getAnnouncements,
} from "@/lib/db";
import HimalayanHeroCanvas from "@/components/HimalayanHeroCanvas";

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
    <div className="space-y-20 sm:space-y-28 lg:space-y-32 pb-24 overflow-x-hidden">
      {/* 1. TYPOGRAPHY-FIRST FULL-WIDTH HERO SECTION WITH HIMALAYAN CANVAS */}
      <section className="relative pt-6 sm:pt-12 lg:pt-16 pb-12 sm:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: ~58% width on desktop */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7 animate-fade-rise">
              {/* Small Identity Label */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#0B3D2E] text-xs font-bold uppercase tracking-widest shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#16A05D] animate-ping" />
                <span>Two Nations. One Community.</span>
              </div>

              {/* Expressive Typographic Wordmark: NEPALI in KIIT */}
              <div className="pt-1 pb-2">
                <div
                  className="hero-wordmark font-black tracking-tight font-display select-none inline-flex flex-wrap items-baseline gap-x-2.5 sm:gap-x-4 md:gap-x-5"
                  aria-label="NEPALI in KIIT"
                >
                  <span className="text-[#0B3D2E] uppercase font-black tracking-tighter">
                    NEPALI
                  </span>
                  <span
                    className="hero-cursive-in text-[#DC143C] font-normal tracking-normal lowercase px-1.5 sm:px-2.5 animate-script-reveal"
                    aria-hidden="true"
                  >
                    in
                  </span>
                  <span className="text-[#142B4A] uppercase font-black tracking-tight">
                    KIIT
                  </span>
                </div>
              </div>

              {/* Headline with Balanced Colors & Clean Crimson Accent Line */}
              <div className="space-y-3.5 max-w-2xl">
                <h1 className="hero-headline font-extrabold text-[#17231B] font-display tracking-tight">
                  <span>Far from home. </span>
                  <span className="text-[#0B3D2E]">Never far from </span>
                  <span className="text-[#142B4A]">each other.</span>
                </h1>

                {/* Subtle refined crimson accent bar */}
                <div
                  className="h-1 sm:h-1.5 w-24 sm:w-28 bg-gradient-to-r from-[#DC143C] to-[#DC143C]/40 rounded-full"
                  aria-hidden="true"
                />
              </div>

              {/* Supporting Description */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl font-normal">
                {settings.hero_description ||
                  "NEPALI IN KIIT brings Nepali students together through culture, friendship, shared experiences, and an enduring sense of belonging at KIIT University, Bhubaneswar."}
              </p>

              {/* Inclusive Community Statement */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8ED] border-l-4 border-[#0B3D2E] text-xs sm:text-sm text-[#17231B]/90 font-medium max-w-xl shadow-xs leading-relaxed">
                “Every Nepali in KIIT belongs here. Whether you participate in every event or simply want to connect with familiar roots, you are family.”
              </div>

              {/* Action Buttons (Accessible, min 48px touch target) */}
              <div className="flex flex-wrap items-center gap-4 pt-2 sm:pt-3">
                <Link
                  href="/join"
                  className="min-h-[48px] px-7 py-3.5 rounded-xl bg-[#0B3D2E] hover:bg-[#07261D] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xs hover:shadow-md active:scale-95 focus:ring-2 focus:ring-[#0B3D2E] focus:outline-none"
                >
                  <span>Explore Our Community</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                </Link>

                <Link
                  href="/events"
                  className="min-h-[48px] px-6 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 text-gray-800 font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 border border-gray-200/60 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                >
                  <span>Discover Events</span>
                  <Calendar className="w-4 h-4 text-gray-600" />
                </Link>
              </div>
            </div>

            {/* Right Column: ~42% width on desktop, stacked naturally below on mobile */}
            <div className="lg:col-span-5 w-full pt-4 lg:pt-0">
              <HimalayanHeroCanvas />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECTION A: COMMUNITY INTRODUCTION (Large Typographic Statement) */}
      <section className="bg-gradient-to-b from-[#FFF8ED]/40 via-white to-gray-50/50 py-16 sm:py-24 border-y border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Typographic Statement */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#087F4F]">
                Our Identity & Purpose
              </span>
              <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[#17231B] font-display leading-[1.15]">
                Built by students, <br />
                <span className="text-[#0B3D2E]">for students.</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed pt-2">
                NEPALI IN KIIT is the independent cultural and community sanctuary for all Nepali students at KIIT Deemed to be University, Bhubaneswar, Odisha.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#0B3D2E] hover:text-[#087F4F] transition-colors group"
                >
                  <span>Read our story and core vision</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right: Four Editorial Feature Pillars */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "Cultural Heritage",
                  desc: "Grand celebrations for Dashain, Tihar, Deusi Bhailo, and Nepali New Year away from home.",
                },
                {
                  icon: GraduationCap,
                  title: "Freshers Guidance",
                  desc: "Dedicated senior support for arriving students: campus navigation, hostel settling, and academic tips.",
                },
                {
                  icon: Users,
                  title: "Peer Mentorship",
                  desc: "Academic collaboration across Engineering, Medical, Law, and Management programs.",
                },
                {
                  icon: Shield,
                  title: "Emergency Support",
                  desc: "A united student network standing together during medical needs, local travel, or emergencies.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200/70 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all duration-300 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0B3D2E] flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#0B3D2E]" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 font-display">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION B: COMMUNITY-MEMORY GALLERY PREVIEW (Photo-First Mosaic) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#087F4F]">
              Visual Memories
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17231B] font-display mt-1">
              Moments That Bring Us Together
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              Authentic glimpses of festivals, campus smiles, and gatherings captured across Bhubaneswar.
            </p>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B3D2E] hover:text-[#087F4F] transition-colors"
          >
            <span>Explore Full Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {galleryImages.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Sparkles className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">Gallery moments will appear here soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
            {/* Dominant Asymmetric Lead Photograph (Spans 7 columns on lg) */}
            {galleryImages[0] && (
              <div className="sm:col-span-2 lg:col-span-7">
                <Link
                  href="/gallery"
                  className="group relative block h-72 sm:h-96 lg:h-[440px] rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 border border-gray-200/80 bg-gray-900"
                >
                  <Image
                    src={galleryImages[0].image_url}
                    alt={galleryImages[0].alt_text || galleryImages[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-5 inset-x-5 text-white z-10 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 inline-block">
                      {galleryImages[0].category_slug.replace("-", " ")}
                    </span>
                    <h3 className="text-lg sm:text-2xl font-bold text-white group-hover:text-emerald-200 transition-colors font-display">
                      {galleryImages[0].title}
                    </h3>
                    <p className="text-xs text-gray-300 line-clamp-1">
                      {galleryImages[0].alt_text || "A cherished moment from the NIK community."}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Complementary Photos (Spans 5 columns on lg) */}
            <div className="sm:col-span-2 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5 sm:gap-6">
              {galleryImages.slice(1, 3).map((img) => (
                <Link
                  key={img.id}
                  href="/gallery"
                  className="group relative block h-56 sm:h-44 lg:h-[207px] rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-gray-200/70 bg-gray-900"
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || img.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute bottom-3.5 inset-x-3.5 text-white z-10">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                      {img.category_slug.replace("-", " ")}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors line-clamp-1">
                      {img.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom Row Strip (Images 4, 5, 6) */}
            {galleryImages.slice(3, 6).map((img) => (
              <div key={img.id} className="lg:col-span-4">
                <Link
                  href="/gallery"
                  className="group relative block h-60 sm:h-64 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-gray-200/70 bg-gray-900"
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || img.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute bottom-3.5 inset-x-3.5 text-white z-10">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                      {img.category_slug.replace("-", " ")}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-200 transition-colors line-clamp-1">
                      {img.title}
                    </h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. SECTION C: UPCOMING EVENTS (From Database) */}
      <section className="bg-gradient-to-b from-gray-50/70 via-gray-50 to-white py-16 sm:py-24 border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#DC143C]">
                Mark Your Calendars
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#17231B] font-display mt-1">
                Upcoming Community Gatherings
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                Cultural celebrations, sports tournaments, and student meetups across campus.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0B3D2E] hover:text-[#087F4F] transition-colors"
            >
              <span>View All Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {nextEvents.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200 shadow-2xs">
              <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-700 font-semibold">
                No upcoming events are scheduled at the moment.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Check back soon or explore past festival memories in our gallery.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
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
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#DC143C]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dateFormatted}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#0B3D2E] transition-colors leading-snug font-display">
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
                          className="w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gray-50 group-hover:bg-[#0B3D2E] text-gray-700 group-hover:text-white text-xs font-semibold transition-all active:scale-95"
                        >
                          <span>Event Details & Registration</span>
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
      </section>

      {/* 5. SECTION D: COMPACT ANNOUNCEMENT SECTION (Official Bulletin) */}
      {recentAnnouncements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-10 lg:p-12 rounded-3xl bg-gray-50/90 border border-gray-200/80 shadow-2xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Bulletin Header */}
              <div className="lg:col-span-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#DC143C]">
                  Official Bulletin
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">
                  Announcements & Campus Notices
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Timely updates regarding festival ticket registration, fresher orientation, and committee activities.
                </p>
                <div className="pt-2">
                  <Link
                    href="/announcements"
                    className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#0B3D2E] hover:text-[#087F4F]"
                  >
                    <span>View All Announcements</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Announcement Cards List */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {recentAnnouncements.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-2xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-[#0B3D2E]">
                          {item.category}
                        </span>
                        {item.priority === "high" && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC143C]">
                            Priority
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug font-display">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {item.short_message}
                      </p>
                    </div>

                    <Link
                      href={item.destination_url || "/announcements"}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0B3D2E] hover:text-[#087F4F] pt-2"
                    >
                      <span>Read update</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. SECTION E: GUIDING PRINCIPLES / COMMUNITY VALUES */}
      <section className="bg-[#0B3D2E] text-white py-20 lg:py-24 relative overflow-hidden">
        {/* Subtle decorative background detail */}
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#16A05D_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12 sm:mb-14">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 sm:gap-6">
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
                <h3 className="text-base font-bold text-white font-display">{v.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECTION F: STRONG FINAL INVITATION / CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#142B4A] text-white p-8 sm:p-14 lg:p-16 border border-[#142B4A] shadow-xl">
          {/* Subtle Dhaka / geometric motif accent */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#FFF8ED_2px,transparent_2px)] [background-size:24px_24px] hidden md:block pointer-events-none"
            aria-hidden="true"
          />

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
                className="min-h-[48px] px-8 py-3.5 rounded-xl bg-[#DC143C] hover:bg-[#B80F32] text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Join NIK Community</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="min-h-[48px] px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all flex items-center justify-center"
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
