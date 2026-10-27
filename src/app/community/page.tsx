import Link from "next/link";
import { Check, ArrowRight, Sparkles, Music, Compass } from "lucide-react";
import { getCommunityProfiles } from "@/lib/db";
import {
  CulturalLifeGraphic,
  ArtsExpressionGraphic,
  CampusNavigationGraphic,
} from "@/components/CommunityCardGraphics";

export const metadata = {
  title: "Our Community — Student Life & Collective Belonging",
  description: "Discover life as a Nepali student at KIIT University: cultural celebrations, peer mentorship, campus sports, and community guidelines.",
};

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const profiles = await getCommunityProfiles({ onlyPublished: true });

  return (
    <div className="space-y-20 sm:space-y-28 pb-24">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-b from-[#F0FDF4]/50 to-white pt-16 pb-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider">
            <span>Collective Student Life</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#17231B] font-display tracking-tight leading-tight">
            A home away from home <br />
            <span className="text-[#0B3D2E]">across every campus school.</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed font-normal max-w-2xl mx-auto">
            Nepali students at KIIT thrive in laboratories, lecture halls, and auditoriums across all 25 campuses in Bhubaneswar.
          </p>
        </div>
      </section>

      {/* 2. Graphic-Led Community Life Panels (Typography & Vector Led) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Cultural Life */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-emerald-400 p-6 sm:p-7 space-y-5 flex flex-col justify-between transition-all duration-300 group">
            <div className="space-y-4">
              {/* Top Badge Row */}
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#0B3D2E] border border-emerald-100 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-[#0B3D2E]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-[#0B3D2E] border border-emerald-200/60">
                  Tradition & Heritage
                </span>
              </div>

              {/* Purpose-designed graphic illustration */}
              <CulturalLifeGraphic />

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#087F4F] block">
                  Festive Celebrations & Identity
                </span>
                <h3 className="text-xl font-bold text-gray-900 font-display mt-0.5 group-hover:text-[#0B3D2E] transition-colors">
                  Cultural Life
                </h3>
              </div>

              <div className="h-0.5 w-12 bg-emerald-600/30 rounded-full" />

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Every autumn, our Dashain and Deusi-Bhailo gatherings gather hundreds of students for traditional blessings, authentic cuisine, and folk music.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Core Highlights
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Dashain Tika & Jamara blessings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Deusi-Bhailo festive gatherings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Authentic Nepali cuisine & feasts</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Arts & Expression */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-rose-400 p-6 sm:p-7 space-y-5 flex flex-col justify-between transition-all duration-300 group">
            <div className="space-y-4">
              {/* Top Badge Row */}
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-[#DC143C] border border-rose-100 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Music className="w-5 h-5 text-[#DC143C]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-[#DC143C] border border-rose-200/60">
                  Culture & Arts
                </span>
              </div>

              {/* Purpose-designed graphic illustration */}
              <ArtsExpressionGraphic />

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#DC143C] block">
                  Music, Dance & Creativity
                </span>
                <h3 className="text-xl font-bold text-gray-900 font-display mt-0.5 group-hover:text-[#DC143C] transition-colors">
                  Arts & Expression
                </h3>
              </div>

              <div className="h-0.5 w-12 bg-rose-600/30 rounded-full" />

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                From Sarangi tunes and acoustic guitar open-mics to traditional Newari, Tamang, and Tharu dances, our students showcase the breadth of Nepali creativity.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Core Highlights
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
                  <span>Sarangi fusion & acoustic open-mics</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
                  <span>Traditional Newari, Tamang & Tharu dance</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC143C]" />
                  <span>Student stage showcases & talent nights</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Campus Navigation */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl hover:border-blue-400 p-6 sm:p-7 space-y-5 flex flex-col justify-between transition-all duration-300 group">
            <div className="space-y-4">
              {/* Top Badge Row */}
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#142B4A] border border-blue-100 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5 text-[#142B4A]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-[#142B4A] border border-blue-200/60">
                  Guidance & Transit
                </span>
              </div>

              {/* Purpose-designed graphic illustration */}
              <CampusNavigationGraphic />

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#142B4A] block">
                  Onboarding & Mentorship
                </span>
                <h3 className="text-xl font-bold text-gray-900 font-display mt-0.5 group-hover:text-[#142B4A] transition-colors">
                  Campus Navigation
                </h3>
              </div>

              <div className="h-0.5 w-12 bg-blue-600/30 rounded-full" />

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Fresher orientations, hostel guides, academic peer tutoring, and city navigation tips help newcomers settle comfortably in Bhubaneswar.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Core Highlights
              </p>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#142B4A]" />
                  <span>Freshers orientation & hostel guides</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#142B4A]" />
                  <span>Academic peer tutoring & notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#142B4A]" />
                  <span>Bhubaneswar city & transit navigation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Community Guidelines & Charter */}
      <section className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#087F4F]">
              Inclusivity & Mutual Respect
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 font-display">
              Our Community Charter
            </h2>
            <p className="text-sm text-gray-600">
              The fundamental standards that govern all NIK events and interactions.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs space-y-6">
            <div className="space-y-4">
              {[
                {
                  title: "1. Equal Ownership",
                  desc: "Every Nepali student enrolled at KIIT is a full, equal member of NIK. No registration fee, executive status, or political affiliation is required.",
                },
                {
                  title: "2. Zero Discrimination & Cultural Dignity",
                  desc: "We celebrate the multilingual, multiethnic fabric of Nepal. Discrimination based on region, caste, gender, religion, or degree cohort is strictly prohibited.",
                },
                {
                  title: "3. Student Privacy & Safety",
                  desc: "We never expose private phone numbers, home addresses, or student ID records publicly. Contact information is maintained with strict confidentiality.",
                },
                {
                  title: "4. University & Host City Respect",
                  desc: "We represent our motherland with pride by honoring KIIT University guidelines and respecting the cultural traditions of our host city Bhubaneswar and the state of Odisha.",
                },
                {
                  title: "5. Peer Solidarity & Emergency Assistance",
                  desc: "When a fellow Nepali student faces medical emergencies, travel disruption, or academic distress, the community mobilizes to assist immediately.",
                },
              ].map((rule, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/60 border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#0B3D2E] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{rule.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed mt-1">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Volunteer Wings */}
      {profiles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0B3D2E]">
              Working Wings
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 font-display">
              Community Volunteer Wings
            </h2>
            <p className="text-xs text-gray-500">
              Coordinators are students volunteering their spare time to serve the community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Volunteer Wing
                </span>
                <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                <p className="text-xs font-semibold text-[#0B3D2E]">{p.role}</p>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">{p.bio}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Join CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-[#142B4A] text-white p-10 rounded-3xl space-y-5">
          <h2 className="text-3xl font-bold font-display">Ready to connect?</h2>
          <p className="text-sm text-gray-200 max-w-md mx-auto">
            Fill out our simple community interest form and meet fellow Nepali students in your campus school today.
          </p>
          <div className="pt-2">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#DC143C] hover:bg-[#B80F32] text-white font-bold rounded-xl text-sm transition-all shadow-md"
            >
              <span>Join NIK Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
