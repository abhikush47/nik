"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  X,
  Loader2,
  AlertCircle,
  Radio,
  ExternalLink,
} from "lucide-react";
import { Announcement } from "@/lib/types";
import { notifyWebsiteUpdate } from "@/lib/broadcast";

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    short_message: "",
    content: "",
    category: "General",
    destination_url: "",
    priority: "normal",
    marquee_enabled: true,
    status: "published",
    display_order: 0,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/admin/announcements?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.items) {
        setItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      slug: "",
      short_message: "",
      content: "",
      category: "General",
      destination_url: "",
      priority: "normal",
      marquee_enabled: true,
      status: "published",
      display_order: 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Announcement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      short_message: item.short_message,
      content: item.content || "",
      category: item.category,
      destination_url: item.destination_url || "",
      priority: item.priority,
      marquee_enabled: item.marquee_enabled,
      status: item.status,
      display_order: item.display_order,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/announcements/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to update announcement");
        setSuccess("Announcement updated successfully!");
      } else {
        const res = await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to create announcement");
        setSuccess("Announcement created successfully!");
      }
      setModalOpen(false);
      notifyWebsiteUpdate();
      router.refresh();
      await fetchItems();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setActionLoading(true);
    setError(null);
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete announcement");
      setSuccess("Announcement deleted.");
      notifyWebsiteUpdate();
      router.refresh();
      await fetchItems();
    } catch (err: any) {
      setError(err.message || "Failed to delete announcement");
      await fetchItems();
    } finally {
      setActionLoading(false);
    }
  };

  const toggleMarquee = async (item: Announcement) => {
    try {
      setError(null);
      setItems((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, marquee_enabled: !a.marquee_enabled } : a))
      );
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marquee_enabled: !item.marquee_enabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update marquee status");
      notifyWebsiteUpdate();
      router.refresh();
      fetchItems();
    } catch (err: any) {
      setError(err.message || "Failed to update marquee status");
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Announcements & Ticker
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage public notices and the top marquee ticker running on the website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#07261D] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Announcements Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0B3D2E]" />
            <span>Loading announcements...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            No announcements found. Click &quot;New Announcement&quot; above to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Title & Message</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Top Ticker</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 max-w-sm">
                      <p className="font-bold text-gray-900 truncate">{item.title}</p>
                      <p className="text-gray-500 truncate mt-0.5">{item.short_message}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                          item.priority === "urgent" || item.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          item.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleMarquee(item)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          item.marquee_enabled
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-100 text-gray-400 hover:text-gray-700"
                        }`}
                        title="Click to toggle banner ticker display"
                      >
                        {item.marquee_enabled ? "Active on Ticker" : "Off Ticker"}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-gray-600 hover:text-[#0B3D2E] rounded-md hover:bg-gray-100"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                {editingItem ? "Edit Announcement" : "Create Announcement"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Dashain 2026 Registration Announcement"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-[#0B3D2E]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Short Ticker Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.short_message}
                  onChange={(e) => setFormData({ ...formData, short_message: e.target.value })}
                  placeholder="One sentence that scrolls across the marquee..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-[#0B3D2E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Events">Events</option>
                    <option value="Important">Important</option>
                    <option value="Community Updates">Community Updates</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Destination URL (Optional)</label>
                <input
                  type="text"
                  value={formData.destination_url}
                  onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                  placeholder="e.g. /events/grand-dashain or external form"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Content (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Full text description for the announcements page..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Publication Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="modal_marquee"
                    checked={formData.marquee_enabled}
                    onChange={(e) => setFormData({ ...formData, marquee_enabled: e.target.checked })}
                    className="rounded text-[#087F4F] focus:ring-[#0B3D2E] h-4 w-4"
                  />
                  <label htmlFor="modal_marquee" className="font-bold text-gray-700">
                    Enable on top ticker
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-[#0B3D2E] hover:bg-[#07261D] text-white font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{editingItem ? "Save Changes" : "Create Announcement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
