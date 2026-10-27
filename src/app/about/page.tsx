import Link from "next/link";
import { Users, Heart, Sparkles, Compass, ArrowRight, ShieldCheck } from "lucide-react";
import { getPageContent, getCommunityProfiles } from "@/lib/db";
import StoryTypographicPanel from "@/components/StoryTypographicPanel";

export const metadata = {
  title: "About NIK — Our Story & Shared Purpose",
  description: "Learn about the history, vision, and values uniting Nepali students at KIIT University, Bhubaneswar, Odisha.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [storyContent, valuesContent, profiles] = await Promise.all([
    getPageContent("about_our_story"),
    getPageContent("about_values"),
    getCommunityProfiles({ onlyPublished: true }),
  ]);

  return (
    <div className="space-y-20 sm:space-y-28 pb-24">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-b from-[#FFF8ED]/60 to-white pt-16 pb-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider">
            <span>Identity & Heritage</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#17231B] font-display tracking-tight leading-tight">
            An unbroken bridge between <br />
            <span className="text-[#0B3D2E]">Nepal</span> and{" "}
            <span className="text-[#142B4A]">Bhubaneswar.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-normal max-w-2xl mx-auto">
            NEPALI IN KIIT was created with a single enduring conviction: no Nepali student traveling to KIIT should ever feel alone or disconnected from their roots.
          </p>
        </div>
      </section>

      {/* 2. Typographic Story Panel & Narrative Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5 relative">
            <StoryTypographicPanel />
          </div>

          <div className="lg:col-span-7 space-y-6 pt-4 lg:pt-0">
            <span className="text-xs font-bold uppercase tracking-widest text-[#DC143C]">
              Our Story
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] font-display tracking-tight">
              {storyContent?.title || "Why NEPALI IN KIIT Exists"}
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4 text-base">
              <p>
                KIIT Deemed to be University attracts hundreds of talented Nepali students every year to its engineering, medical, computer science, law, and biotechnology schools. Leaving home, family, and familiar mountains to study in Odisha is an exciting leap—yet adjusting to a new city, language, and campus environment brings real challenges.
              </p>
              <p>
                NEPALI IN KIIT (NIK) was formed organically as an open student space where seniors welcome incoming freshers, help them settle into hostels, explain academic pathways, celebrate traditional festivals, and cultivate mutual support.
              </p>
              <p className="font-semibold text-gray-900 bg-[#FFF8ED] p-4 sm:p-5 rounded-2xl border-l-4 border-[#0B3D2E] shadow-2xs leading-relaxed text-sm">
                NIK belongs equally to every Nepali student at KIIT. It is not an exclusive club or the private domain of any single individual; it is the collective pride of our student body.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission, Vision, and Everyone Belongs */}
      <section className="bg-gray-50/80 py-20 border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4 hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0B3D2E] flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-display">Our Mission</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                To foster an inclusive, supportive, and vibrant community that enriches the academic, cultural, and personal journey of every Nepali student at KIIT University.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#142B4A] flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-display">Our Vision</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                To represent Nepal with dignity, scholarship, and creative distinction at KIIT while building lifelong cross-border friendships between Nepal and India.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4 hover:border-rose-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#DC143C] flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-display">Everyone Belongs</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                There are no membership barriers, caste distinctions, or prerequisite requirements. If you are a Nepali student at KIIT, NIK is unconditionally your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Volunteer Wings & Coordination Council (Typography-Led Redesign) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#087F4F]">
            Student Volunteer Wings
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17231B] font-display">
            Coordinators & Volunteer Pillars
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            NIK operates through self-motivated student volunteers dedicated to organizing cultural events, sports meets, and peer mentorship.
          </p>
        </div>

        {/* 3 Refined Typography-Led Editorial Panels (No images) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Panel 1: General Coordination Council */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-emerald-400 p-6 sm:p-7 space-y-5 flex flex-col justify-between transition-all duration-300 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#0B3D2E] border border-emerald-100 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 text-[#0B3D2E]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-[#0B3D2E] border border-emerald-200/60">
                  Operations
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#087F4F] block">
                  Student Community Operations
                </span>
                <h3 className="text-xl font-bold text-gray-900 font-display mt-0.5 group-hover:text-[#0B3D2E] transition-colors">
                  General Coordination Council
                </h3>
              </div>

              <div className="h-0.5 w-12 bg-emerald-600/30 rounded-full" />

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Facilitates daily student community operations, event logistics, newcomer orientation, hostel onboarding, and student welfare support across all schools.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Core Responsibilities
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Freshers welcome & hostel settling</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Event logistics & venue coordination</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Emergency assistance & peer mentorship</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Panel 2: Cultural & Arts Committee */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-rose-400 p-6 sm:p-7 space-y-5 flex flex-col justify-between transition-all duration-300 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#DC143C] border border-rose-100 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-[#DC143C]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-[#DC143C] border border-rose-200/60">
                  Culture & Arts
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#DC143C] block">
                  Festival & Performance Planning
                </span>
                <h3 className="text-xl font-bold text-gray-900 font-display mt-0.5 group-hover:text-[#DC143C] transition-colors">
                  Cultural & Arts Committee
                </h3>
              </div>

              <div className="h-0.5 w-12 bg-rose-600/30 rounded-full" />

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Curates and celebrates traditional festivals, acoustic musical open-mics, folk dance performances, stage design, and creative cultural expression on campus.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Core Responsibilities
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
                  <span>Grand Dashain & Tihar celebrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
                  <span>Nepali acoustic sessions & talent nights</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
                  <span>Folk dance, Sarangi fusion & stage art</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Panel 3: Sports & Wellness Wing */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-blue-400 p-6 sm:p-7 space-y-5 flex flex-col justify-between transition-all duration-300 group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#142B4A] border border-blue-100 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5 text-[#142B4A]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-[#142B4A] border border-blue-200/60">
                  Sports & Health
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#142B4A] block">
                  Student Tournaments & Fitness
                </span>
                <h3 className="text-xl font-bold text-gray-900 font-display mt-0.5 group-hover:text-[#142B4A] transition-colors">
                  Sports & Wellness Wing
                </h3>
              </div>

              <div className="h-0.5 w-12 bg-blue-600/30 rounded-full" />

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Coordinates annual student tournaments, recreational fitness, and wellness outings to promote camaraderie, healthy competition, and balance amidst academic life.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Core Responsibilities
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#142B4A]" />
                  <span>Annual NIK Futsal Championship</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#142B4A]" />
                  <span>Cricket matches & badminton leagues</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#142B4A]" />
                  <span>Outdoor weekend recreation & fitness</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Inclusive Community Positioning Note */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8ED] border-l-4 border-[#0B3D2E] text-xs sm:text-sm text-[#17231B]/90 font-medium max-w-3xl mx-auto shadow-xs leading-relaxed text-center">
          “These volunteer councils coordinate events and logistics for the collective good of the student body. Every Nepali student at KIIT is an equal and valued member of NIK, whether or not they hold a formal role.”
        </div>
      </section>

      {/* 5. Join Invitation CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0B3D2E] text-white space-y-5 shadow-xl">
          <h2 className="text-3xl font-bold font-display">
            Become an active voice in our community
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-lg mx-auto">
            Whether you want to volunteer for event planning, perform on stage, or simply connect with seniors, reach out today.
          </p>
          <div className="pt-2">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#0B3D2E] font-bold rounded-xl text-sm shadow-md hover:bg-emerald-50 transition-all active:scale-95"
            >
              <span>Connect with NIK</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
