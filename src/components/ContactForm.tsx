"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || formData.name.length < 2) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.subject.trim() || formData.subject.length < 3) {
      setError("Please provide a subject line.");
      return;
    }

    if (!formData.message.trim() || formData.message.length < 8) {
      setError("Please write your message (at least 8 characters).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 sm:p-10 text-center animate-in fade-in duration-300">
        <div className="w-14 h-14 bg-[#087F4F] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#0B3D2E] mb-2 font-display">
          Message Sent Successfully
        </h3>
        <p className="text-gray-700 text-sm max-w-md mx-auto leading-relaxed mb-6">
          Dhanyabad for reaching out. Your message has been routed to the NIK student coordination team. We will get back to your email shortly.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setFormData({ name: "", email: "", subject: "", message: "", honeypot: "" });
          }}
          className="text-xs font-semibold text-[#0B3D2E] underline uppercase tracking-wider hover:opacity-80"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-5">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Honeypot field */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact_phone_trap">Leave blank</label>
        <input
          id="contact_phone_trap"
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
            Your Name <span className="text-[#DC143C]">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Samip Thapa"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
            Your Email <span className="text-[#DC143C]">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. samip@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 text-sm transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Subject <span className="text-[#DC143C]">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="e.g. Inquiry regarding Dashain Celebration passes"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 text-sm transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
          Message <span className="text-[#DC143C]">*</span>
        </label>
        <textarea
          rows={5}
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="How can the NIK community coordinators assist you?"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#0B3D2E] focus:ring-2 focus:ring-[#0B3D2E]/20 text-sm transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3.5 bg-[#0B3D2E] hover:bg-[#07261D] text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending message...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}
