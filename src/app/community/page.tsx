import Image from "next/image";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { getCommunityProfiles } from "@/lib/db";

export const metadata = {
  title: "Our Community — Student Life & Collective Belonging",
  description: "Discover life as a Nepali student at KIIT University: cultural celebrations, peer mentorship, campus sports, and community guidelines.",
};

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

      {/* 2. Visual Collage & Activities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs p-6 space-y-4">
            <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100">
              <Image
                src="/images/community/campus-celebration.png"
                alt="Nepali festival campus celebration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-display">Cultural Life</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Every autumn, our Dashain and Deusi-Bhailo gatherings gather hundreds of students for traditional blessings, authentic cuisine, and folk music.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs p-6 space-y-4">
            <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100">
              <Image
                src="/images/community/talent-showcase.png"
                alt="Nepali music and arts talent showcase"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-display">Arts & Expression</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              From Sarangi tunes and acoustic guitar open-mics to traditional Newari, Tamang, and Tharu dances, our students showcase the breadth of Nepali creativity.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs p-6 space-y-4">
            <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100">
              <Image
                src="/images/community/kiit-gate.jpg"
                alt="KIIT University campus front gate"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-display">Campus Navigation</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Fresher orientations, hostel guides, academic peer tutoring, and city navigation tips help newcomers settle comfortably in Bhubaneswar.
            </p>
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
