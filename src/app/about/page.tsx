import Image from "next/image";
import Link from "next/link";
import { Users, Heart, Sparkles, Compass, ArrowRight, ShieldCheck } from "lucide-react";
import { getPageContent, getCommunityProfiles } from "@/lib/db";

export const metadata = {
  title: "About NIK — Our Story & Shared Purpose",
  description: "Learn about the history, vision, and values uniting Nepali students at KIIT University, Bhubaneswar, Odisha.",
};

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

      {/* 2. Authentic Photo & Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-200 h-96 sm:h-[480px]">
              <Image
                src="/images/community/heritage-campus.png"
                alt="Nepali students representing cultural heritage on KIIT campus"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xl max-w-xs">
              <p className="text-xs font-bold text-[#0B3D2E] uppercase tracking-wider">
                Two Nations. One Community.
              </p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Celebrating Nepali cultural warmth alongside KIIT University campus life.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#DC143C]">
              Our Story
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display">
              {storyContent?.title || "Why NEPALI IN KIIT Exists"}
            </h2>
            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4 text-base">
              <p>
                KIIT Deemed to be University attracts hundreds of talented Nepali students every year to its engineering, medical, computer science, law, and biotechnology schools. Leaving home, family, and familiar mountains to study in Odisha is an exciting leap—yet adjusting to a new city, language, and campus environment brings real challenges.
              </p>
              <p>
                NEPALI IN KIIT (NIK) was formed organically as an open student space where seniors welcome incoming freshers, help them settle into hostels, explain academic pathways, celebrate traditional festivals, and cultivate mutual support.
              </p>
              <p className="font-semibold text-gray-900 bg-gray-50 p-4 rounded-xl border-l-4 border-[#0B3D2E]">
                NIK belongs equally to every Nepali student at KIIT. It is not an exclusive club or the private domain of any single individual; it is the collective pride of our student body.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission, Vision, and Everyone Belongs */}
      <section className="bg-gray-50 py-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#0B3D2E] flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-display">Our Mission</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                To foster an inclusive, supportive, and vibrant community that enriches the academic, cultural, and personal journey of every Nepali student at KIIT University.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#142B4A] flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-display">Our Vision</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                To represent Nepal with dignity, scholarship, and creative distinction at KIIT while building lifelong cross-border friendships between Nepal and India.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-[#DC143C] flex items-center justify-center font-bold">
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

      {/* 4. Volunteer Wings & Coordination Council */}
      {profiles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#087F4F]">
              Student Volunteer Wings
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 font-display">
              Coordinators & Volunteer Pillars
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              NIK operates through self-motivated student volunteers dedicated to organizing cultural events, sports meets, and peer mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs p-6 space-y-4 flex flex-col justify-between"
              >
                {profile.image_url && (
                  <div className="relative h-44 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={profile.image_url}
                      alt={profile.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">{profile.name}</h3>
                  <p className="text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider">
                    {profile.role}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed pt-2">
                    {profile.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Join Invitation CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0B3D2E] text-white space-y-5">
          <h2 className="text-3xl font-bold font-display">
            Become an active voice in our community
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-lg mx-auto">
            Whether you want to volunteer for event planning, perform on stage, or simply connect with seniors, reach out today.
          </p>
          <div className="pt-2">
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#0B3D2E] font-bold rounded-xl text-sm shadow-md hover:bg-emerald-50 transition-all"
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
