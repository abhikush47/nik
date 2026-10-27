"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  Upload,
  CheckCircle,
  Star,
  MapPin,
} from "lucide-react";
import { EventItem } from "@/lib/types";
import { notifyWebsiteUpdate } from "@/lib/broadcast";

export default function AdminEventsPage() {
  const router = useRouter();
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    description: "",
    cover_image: "/images/community/dashain-together.png",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    venue: "Campus 6 Auditorium, KIIT University",
    category: "Cultural Celebrations" as any,
    registration_url: "/join",
    registration_status: "open" as any,
    featured: false,
    status: "published" as any,
    display_order: 0,
  });

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/admin/events?_t=${Date.now()}`, { cache: "no-store" });
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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7);
    tomorrow.setHours(14, 0, 0, 0);

    setFormData({
      title: "",
      slug: "",
      summary: "",
      description: "",
      cover_image: "/images/community/dashain-together.png",
      start_date: tomorrow.toISOString().slice(0, 16),
      end_date: "",
      registration_deadline: "",
      venue: "Campus 6 Auditorium, KIIT University",
      category: "Cultural Celebrations",
      registration_url: "/join",
      registration_status: "open",
      featured: false,
      status: "published",
      display_order: 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: EventItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      description: item.description,
      cover_image: item.cover_image,
      start_date: item.start_date.slice(0, 16),
      end_date: item.end_date ? item.end_date.slice(0, 16) : "",
      registration_deadline: item.registration_deadline ? item.registration_deadline.slice(0, 16) : "",
      venue: item.venue,
      category: item.category,
      registration_url: item.registration_url || "",
      registration_status: item.registration_status,
      featured: item.featured,
      status: item.status,
      display_order: item.display_order,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFormData((prev) => ({ ...prev, cover_image: data.url }));
      setSuccess("Cover image uploaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    // Validation: Ensure deadline is on or before start_date if both are provided
    if (formData.registration_deadline && formData.start_date) {
      const deadlineTime = new Date(formData.registration_deadline).getTime();
      const startTime = new Date(formData.start_date).getTime();
      if (deadlineTime > startTime) {
        setError("Registration deadline cannot fall after the event start date.");
        setActionLoading(false);
        return;
      }
    }

    const payload = {
      ...formData,
      registration_deadline: formData.registration_deadline ? formData.registration_deadline : null,
      end_date: formData.end_date ? formData.end_date : null,
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/events/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to update event");
        setSuccess("Event updated successfully!");
      } else {
        const res = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to create event");
        setSuccess("Event created successfully!");
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
    if (!confirm(`Are you sure you want to delete event "${title}"?`)) return;
    setActionLoading(true);
    setError(null);
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete event");
      setSuccess("Event deleted.");
      notifyWebsiteUpdate();
      router.refresh();
      await fetchItems();
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
      await fetchItems();
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFeatured = async (item: EventItem) => {
    try {
      setError(null);
      setItems((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, featured: !e.featured } : e))
      );
      const res = await fetch(`/api/admin/events/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !item.featured }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update featured status");
      notifyWebsiteUpdate();
      router.refresh();
      fetchItems();
    } catch (err: any) {
      setError(err.message || "Failed to update featured status");
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Event */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Events Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create and update cultural festivals, gatherings, and student meets.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#07261D] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>

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

      {/* Events List Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0B3D2E]" />
            <span>Loading events...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            No events found. Click &quot;New Event&quot; above to create one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((event) => (
              <div
                key={event.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <Image
                      src={event.cover_image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm truncate max-w-md">
                        {event.title}
                      </span>
                      {event.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>{new Date(event.start_date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{event.venue}</span>
                      <span>•</span>
                      <span className="capitalize">{event.category}</span>
                      {event.registration_deadline && (
                        <>
                          <span>•</span>
                          <span className="text-[#DC143C] font-semibold">
                            Deadline: {new Date(event.registration_deadline).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                  <button
                    onClick={() => toggleFeatured(event)}
                    className={`p-2 rounded-lg text-xs font-semibold border ${
                      event.featured
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "text-gray-400 hover:text-gray-700 border-gray-200"
                    }`}
                    title="Toggle featured spotlight"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(event)}
                    className="p-2 text-gray-600 hover:text-[#0B3D2E] rounded-lg border border-gray-200 hover:bg-gray-100"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id, event.title)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingItem ? "Edit Event" : "Create New Event"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Grand Vijaya Dashami Cultural Feast"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Short Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="One or two sentences for event cards..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-[#0B3D2E] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">
                      Registration Deadline <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    {formData.registration_deadline && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, registration_deadline: "" })}
                        className="text-[10px] text-red-600 hover:underline font-semibold"
                        title="Remove registration deadline"
                      >
                        Clear deadline
                      </button>
                    )}
                  </div>
                  <input
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-[#0B3D2E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-[#0B3D2E] focus:outline-none"
                  >
                    <option value="Cultural Celebrations">Cultural Celebrations</option>
                    <option value="Student Gathering">Student Gathering</option>
                    <option value="Sports & Tournaments">Sports & Tournaments</option>
                    <option value="Academic & Workshops">Academic & Workshops</option>
                    <option value="Community Meetup">Community Meetup</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">
                      End Date & Time <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    {formData.end_date && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, end_date: "" })}
                        className="text-[10px] text-red-600 hover:underline font-semibold"
                      >
                        Clear end date
                      </button>
                    )}
                  </div>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs focus:ring-2 focus:ring-[#0B3D2E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Venue / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Campus 6 Auditorium & Lawn, KIIT University"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              {/* Cover Image Upload */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <label className="block font-bold text-gray-700">Cover Image</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={formData.cover_image}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                    placeholder="/images/community/dashain-together.png"
                  />
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#0B3D2E] text-white font-semibold text-xs flex items-center gap-1">
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Full Description (Markdown supported) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Complete schedule, schedule details, highlights, dress code..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Registration Status</label>
                  <select
                    value={formData.registration_status}
                    onChange={(e) => setFormData({ ...formData, registration_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="invite_only">Invite Only</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Publication Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="past">Past</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured_checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded text-[#087F4F] focus:ring-[#0B3D2E] h-4 w-4"
                />
                <label htmlFor="featured_checkbox" className="font-bold text-gray-700">
                  Feature in Events banner
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-[#0B3D2E] text-white font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{editingItem ? "Save Changes" : "Create Event"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
