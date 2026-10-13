"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { SiteSettings } from "@/lib/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save site settings");
      setSuccess("Site configuration updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save site settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Site Settings & Configuration
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage brand identifiers, footer descriptions, contacts, and marquee ticker settings.
        </p>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading || !settings ? (
        <div className="p-12 text-center text-xs text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#0B3D2E] mx-auto mb-2" />
          <span>Loading settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Brand Identity Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Brand Identity</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Community Full Name</label>
                <input
                  type="text"
                  required
                  value={settings.community_name}
                  onChange={(e) => setSettings({ ...settings, community_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Short Name</label>
                <input
                  type="text"
                  required
                  value={settings.short_name}
                  onChange={(e) => setSettings({ ...settings, short_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Supporting Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Core Community Message</label>
                <input
                  type="text"
                  value={settings.core_message}
                  onChange={(e) => setSettings({ ...settings, core_message: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Hero & Description */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Homepage Editorial Text</h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Hero Main Headline</label>
                <input
                  type="text"
                  value={settings.hero_headline}
                  onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Hero Description</label>
                <textarea
                  rows={3}
                  value={settings.hero_description}
                  onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Footer Description</label>
                <textarea
                  rows={2}
                  value={settings.footer_text}
                  onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Contact & Social Links */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Contact & Social Channels</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Campus Location</label>
                <input
                  type="text"
                  value={settings.contact_location}
                  onChange={(e) => setSettings({ ...settings, contact_location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Official Instagram URL</label>
                <input
                  type="text"
                  value={settings.instagram_url}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#0B3D2E] hover:bg-[#07261D] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Site Configuration</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
