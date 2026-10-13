import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Student Data Charter — NEPALI IN KIIT",
  description: "Read how NEPALI IN KIIT protects student confidentiality, prevents public exposure of contact details, and handles interest submissions.",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#FFF8ED]/50 to-white pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Student Privacy Commitment</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-display tracking-tight">
            Privacy Policy & Data Charter
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Your safety, privacy, and confidentiality are fundamental to our community principles.
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 font-display">1. Information We Collect</h2>
          <p>
            When you choose to submit information through the <strong>Join NIK</strong> or <strong>Contact Us</strong> forms, we collect the details you voluntarily provide: your name, email address, optional degree course, year of study, and areas of interest.
          </p>
          <p>
            We do not collect unnecessary private information such as passport details, bank accounts, or identity numbers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 font-display">2. How Your Information is Used</h2>
          <p>Information submitted to NIK is used exclusively for:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Connecting you with fellow Nepali students and mentors in your school or campus.</li>
            <li>Informing you of upcoming cultural gatherings, Dashain celebrations, and tournaments.</li>
            <li>Responding to your direct inquiries submitted through the contact form.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 font-display">3. Zero Public Exposure of Records</h2>
          <p className="bg-gray-50 p-4 rounded-xl border-l-4 border-[#0B3D2E] font-medium text-gray-900">
            We never publish private student contact lists, phone numbers, or email addresses on public web pages or directories. All messages and interest requests are secured behind server-side authentication and database policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-900 font-display">4. Data Retention & Deletion</h2>
          <p>
            You may request the deletion of your submitted contact details at any time by contacting our administrators at{" "}
            <a href="mailto:contact@nepaliinkiit.org" className="text-[#0B3D2E] font-semibold underline">
              contact@nepaliinkiit.org
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
