"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const INTEREST_OPTIONS = [
  "Cultural Festivals (Dashain, Tihar)",
  "Dance & Musical Performances",
  "Sports & Futsal Tournaments",
  "Fresher Orientation & Mentorship",
  "Academic & Career Peer Support",
  "Event Photography & Social Media",
  "General Community Volunteering",
];

export default function JoinForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    course: "",
    year_of_study: "1st Year",
    interests: [] as string[],
    why_connect: "",
    honeypot: "",
    consent: false,
  });

  const handleInterestToggle = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter((i) => i !== item)
        : [...prev.interests, item],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim()) {
      setError("Please provide your full name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    if (!formData.consent) {
      setError("Please check the consent box to submit your information.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          course: formData.course,
          year_of_study: formData.year_of_study,
          interests: formData.interests.join(", "),
          why_connect: formData.why_connect,
          honeypot: formData.honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 sm:p-10 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h3 className="text-2xl font-bold text-[#0B3D2E] mb-2 font-display">
          Swagatam! You are part of NIK.
        </h3>
        <p className="text-gray-700 max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-6">
          Your interest has been safely recorded in our community registry. A coordinator will reach out to connect you with fellow students in your campus school or hostel.
        </p>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 max-w-md mx-auto text-xs text-gray-600 mb-6">
          <p className="font-semibold text-gray-900 mb-1">Stay updated with everyday activities:</p>
          <a
            href="https://www.instagram.com/nepaliinkiit/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#DC143C] font-bold hover:underline"
          >
            Follow @nepaliinkiit on Instagram →
          </a>
        </div>
        <button
          onClick={() => {
            setSuccess(false);
            setFormData({
              full_name: "",
              email: "",
              course: "",
              year_of_study: "1st Year",
              interests: [],
              why_connect: "",
              honeypot: "",
              consent: false,
            });
          }}
          className="text-xs font-semibold text-[#0B3D2E] underline uppercase tracking-wider hover:opacity-80"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Honeypot field (hidden from users) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="join_honeypot">Leave blank</label>
        <input
          id="join_honeypot"
          type="text"
          value={formData.honeypot}
          onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Full Name <span className="text-[#DC143C]">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="e.g. Aayush Sharma"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Email Address (KIIT or Personal) <span className="text-[#DC143C]">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. 2305001@kiit.ac.in"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 text-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Course / Department
          </label>
          <input
            type="text"
            value={formData.course}
            onChange={(e) => setFormData({ ...formData, course: e.target.value })}
            placeholder="e.g. B.Tech CSE, MBBS, Law, Biotech"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Current Year of Study
          </label>
          <select
            value={formData.year_of_study}
            onChange={(e) => setFormData({ ...formData, year_of_study: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 text-sm transition-all bg-white"
          >
            <option value="1st Year">1st Year (Fresher)</option>
            <option value="2nd Year">2nd Year (Sophomore)</option>
            <option value="3rd Year">3rd Year (Junior)</option>
            <option value="4th Year">4th Year (Senior)</option>
            <option value="5th Year / Medical / Law">5th Year / Medical / Law</option>
            <option value="Postgraduate / PhD">Postgraduate / PhD</option>
            <option value="Alumni">Alumni</option>
          </select>
        </div>
      </div>

      {/* Areas of Interest */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          Areas of Interest (Select all that apply)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {INTEREST_OPTIONS.map((item) => {
            const isChecked = formData.interests.includes(item);
            return (
              <label
                key={item}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs sm:text-sm cursor-pointer transition-all ${
                  isChecked
                    ? "bg-emerald-50/80 border-[#087F4F] text-[#0B3D2E] font-medium"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleInterestToggle(item)}
                  className="rounded text-[#087F4F] focus:ring-[#0B3D2E] h-4 w-4"
                />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Statement / Note */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Why do you want to connect with NIK? (Optional)
        </label>
        <textarea
          rows={3}
          value={formData.why_connect}
          onChange={(e) => setFormData({ ...formData, why_connect: e.target.value })}
          placeholder="e.g. Looking to meet seniors from Kathmandu, want to participate in Dashain events, or looking for hostel roommates."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 text-sm transition-all"
        />
      </div>

      {/* Consent Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={formData.consent}
            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
            className="mt-1 rounded text-[#087F4F] focus:ring-[#0B3D2E] h-4 w-4"
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            I confirm that I am a Nepali student, scholar, or alumnus connected to KIIT University. I consent to NIK student coordinators contacting me regarding community events and announcements.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3.5 bg-[#0B3D2E] hover:bg-[#07261D] text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting details...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Submit Community Interest</span>
          </>
        )}
      </button>
    </form>
  );
}
