import { Mail, MapPin, MessageSquare } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";
import ContactForm from "@/components/ContactForm";
import { getSiteSettings } from "@/lib/db";

export const metadata = {
  title: "Contact NIK — Connect with Student Coordinators",
  description: "Get in touch with NEPALI IN KIIT student coordinators for event inquiries, volunteer opportunities, or general community support.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-16 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#FFF8ED]/50 to-white pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Communications</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-display tracking-tight">
            We are here for you.
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Whether you have questions about festival celebrations, student mentorship, or need assistance settling in, drop us a line.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#142B4A] text-white p-8 rounded-3xl space-y-6 shadow-md">
              <h2 className="text-2xl font-bold font-display">Contact Channels</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Connect with our coordination team online or on campus.
              </p>

              <div className="space-y-5 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</p>
                    <a
                      href={`mailto:${settings.contact_email}`}
                      className="text-sm font-semibold text-white hover:text-emerald-300 transition-colors"
                    >
                      {settings.contact_email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#DC143C] flex-shrink-0">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Official Instagram</p>
                    <a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-white hover:text-emerald-300 transition-colors underline underline-offset-4"
                    >
                      @nepaliinkiit
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Campus Location</p>
                    <p className="text-sm text-gray-200 leading-snug">
                      {settings.contact_location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
