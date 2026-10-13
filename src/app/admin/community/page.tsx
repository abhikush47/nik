"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Edit2, X, Loader2, Upload, Check } from "lucide-react";
import { CommunityProfile } from "@/lib/types";

export default function AdminCommunityPage() {
  const [profiles, setProfiles] = useState<CommunityProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CommunityProfile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image_url: "",
    display_order: 0,
    is_published: true,
    social_link: "https://www.instagram.com/nepaliinkiit/",
  });

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/admin/community");
      const data = await res.json();
      if (res.ok) setProfiles(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      role: "",
      bio: "",
      image_url: "",
      display_order: profiles.length + 1,
      is_published: true,
      social_link: "https://www.instagram.com/nepaliinkiit/",
    });
    setModalOpen(true);
  };

  const openEditModal = (p: CommunityProfile) => {
    setEditingItem(p);
    setFormData({
      name: p.name,
      role: p.role,
      bio: p.bio,
      image_url: p.image_url || "",
      display_order: p.display_order,
      is_published: p.is_published,
      social_link: p.social_link || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/community/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update profile");
        setSuccess("Profile updated successfully!");
      } else {
        const res = await fetch("/api/admin/community", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create profile");
        setSuccess("Profile created successfully!");
      }
      setModalOpen(false);
      fetchProfiles();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete profile "${name}"?`)) return;
    try {
      await fetch(`/api/admin/community/${id}`, { method: "DELETE" });
      fetchProfiles();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePublished = async (p: CommunityProfile) => {
    try {
      await fetch(`/api/admin/community/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !p.is_published }),
      });
      fetchProfiles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Community Volunteer Wings
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage public committee profiles, coordinator wings, and volunteer roles.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#07261D] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Volunteer Wing</span>
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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#0B3D2E] mx-auto mb-2" />
            <span>Loading community profiles...</span>
          </div>
        ) : profiles.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No profiles found. Add one to introduce your volunteer team.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {profiles.map((p) => (
              <div
                key={p.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">{p.name}</h3>
                    <span className="text-xs text-[#0B3D2E] font-semibold">({p.role})</span>
                  </div>
                  <p className="text-xs text-gray-600 max-w-xl">{p.bio}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => togglePublished(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      p.is_published
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {p.is_published ? "Published" : "Draft"}
                  </button>
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 text-gray-600 hover:text-[#0B3D2E] rounded-md hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                {editingItem ? "Edit Volunteer Wing" : "New Volunteer Wing"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Wing / Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cultural & Arts Committee"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Role / Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Festival Logistics & Performances"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Biography / Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="What this volunteer wing does for students..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/images/community/..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published_profile"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded text-[#087F4F] focus:ring-[#0B3D2E] h-4 w-4"
                />
                <label htmlFor="published_profile" className="font-bold text-gray-700">
                  Visible publicly on website
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
                  <span>{editingItem ? "Save Changes" : "Create Wing"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
