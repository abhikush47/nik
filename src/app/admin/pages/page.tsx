"use client";

import { useState, useEffect } from "react";
import { FileText, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { PageContent } from "@/lib/types";

export default function AdminPagesManager() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      if (res.ok) setPages(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleUpdateField = (key: string, field: "title" | "subtitle" | "content", val: string) => {
    setPages((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [field]: val } : p))
    );
  };

  const handleSave = async (item: PageContent) => {
    setSavingKey(item.key);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: item.key,
          title: item.title,
          subtitle: item.subtitle,
          content: item.content,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save changes");
      setSuccess(`Saved changes for "${item.title}". Changes will appear on public site.`);
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Page Content & Editorial Copy
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Edit long-form story narratives, core values, and community charters.
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

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin text-[#0B3D2E] mx-auto mb-2" />
          <span>Loading editable content blocks...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {pages.map((item) => (
            <div
              key={item.key}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B3D2E] bg-emerald-50 px-2 py-0.5 rounded">
                    Key: {item.key}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 mt-1">{item.title}</h3>
                </div>

                <button
                  onClick={() => handleSave(item)}
                  disabled={savingKey === item.key}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#07261D] transition-colors disabled:opacity-50"
                >
                  {savingKey === item.key ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateField(item.key, "title", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-[#0B3D2E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Subtitle / Overline</label>
                  <input
                    type="text"
                    value={item.subtitle || ""}
                    onChange={(e) => handleUpdateField(item.key, "subtitle", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-[#0B3D2E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Content Body (Markdown supported)
                  </label>
                  <textarea
                    rows={6}
                    value={item.content}
                    onChange={(e) => handleUpdateField(item.key, "content", e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 text-xs leading-relaxed focus:ring-1 focus:ring-[#0B3D2E] font-mono"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
