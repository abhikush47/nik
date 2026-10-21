import { Users, Shield } from "lucide-react";
import JoinForm from "@/components/JoinForm";

export const metadata = {
  title: "Join NIK — Nepali In KIIT Community Registration",
  description: "Connect with the Nepali student community at KIIT University, Bhubaneswar. Free, open to all Nepali students, scholars, and alumni.",
};

export default function JoinPage() {
  return (
    <div className="space-y-16 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#FFF8ED]/50 to-white pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Community Registry</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-display tracking-tight">
            Connect with Nepali In KIIT
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Every Nepali student at KIIT belongs here. Share a few quick details to help coordinators connect you with batchmates and campus activities.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Explanatory Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FFF8ED] p-6 sm:p-8 rounded-2xl border border-amber-200/60 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B3D2E] bg-white px-2.5 py-1 rounded-full border border-amber-200">
                What to Expect
              </span>
              <h2 className="text-xl font-bold text-gray-900 font-display">
                No barriers. No fees. Just family.
              </h2>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B3D2E] mt-2 flex-shrink-0" />
                  <span>Receive direct notices for Dashain feasts, tika ceremonies, and sports cups.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B3D2E] mt-2 flex-shrink-0" />
                  <span>Get paired with senior mentors in your specific engineering or medical branch.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B3D2E] mt-2 flex-shrink-0" />
                  <span>Access community emergency support when sick, traveling, or in need.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Strict Student Privacy</span>
              </div>
              <p className="leading-relaxed">
                Your contact details are stored securely and only accessible to authorized student coordinators. We never sell, share, or publish student data.
              </p>
            </div>
          </div>

          {/* Right: Interactive Form */}
          <div className="lg:col-span-7">
            <JoinForm />
          </div>
        </div>
      </div>
    </div>
  );
}
