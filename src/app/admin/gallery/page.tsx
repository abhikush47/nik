"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  Upload,
  Star,
  Camera,
  Tag,
} from "lucide-react";
import { GalleryImage, GalleryCategory } from "@/lib/types";

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryImage | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    alt_text: "",
    category_slug: "dashain",
    image_url: "",
    photographer_credit: "NIK Media Team",
    status: "published" as any,
    featured: false,
    display_order: 0,
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (res.ok) {
        setImages(data.images || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      alt_text: "",
      category_slug: categories[0]?.slug || "dashain",
      image_url: "",
      photographer_credit: "NIK Media Team",
      status: "published",
      featured: false,
      display_order: 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: GalleryImage) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      alt_text: item.alt_text,
      category_slug: item.category_slug,
      image_url: item.image_url,
      photographer_credit: item.photographer_credit || "",
      status: item.status,
      featured: item.featured,
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

      setFormData((prev) => ({
        ...prev,
        image_url: data.url,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
        alt_text: prev.alt_text || file.name.replace(/\.[^/.]+$/, ""),
      }));
      setSuccess("Image uploaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      setError("Please select or upload an image file.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to update photograph");
        setSuccess("Photograph updated successfully!");
      } else {
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to add photograph");
        setSuccess("Photograph added to gallery!");
      }
      setModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/gallery/${deleteConfirmItem.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to delete photograph");
      setSuccess(`Photograph "${deleteConfirmItem.title}" deleted successfully.`);
      setDeleteConfirmItem(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete photograph");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFeatured = async (item: GalleryImage) => {
    try {
      setError(null);
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !item.featured }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to update featured status");
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to update featured status");
    }
  };


  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Gallery Photographs
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Upload and organize authentic community moments and festival photos.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#07261D] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Photograph</span>
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

      {/* Grid of gallery photos */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0B3D2E]" />
            <span>Loading gallery...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            No gallery photographs uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
              >
                <div className="relative h-44 w-full bg-gray-200">
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || img.title}
                    fill
                    className="object-cover"
                    sizes="250px"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-[#0B3D2E]">
                      {img.category_slug}
                    </span>
                  </div>
                  {img.featured && (
                    <div className="absolute top-2 right-2">
                      <span className="p-1 rounded-full bg-amber-400 text-white inline-block shadow-xs">
                        <Star className="w-3 h-3 fill-white" />
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-2">
                  <h3 className="font-bold text-gray-900 text-xs truncate" title={img.title}>
                    {img.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="truncate">{img.photographer_credit || "NIK Media"}</span>
                    <span className="capitalize">{img.status}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => toggleFeatured(img)}
                      className={`p-1.5 rounded-md ${
                        img.featured ? "text-amber-600 bg-amber-50" : "text-gray-400 hover:text-gray-700"
                      }`}
                      title="Toggle homepage featured preview"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(img)}
                        className="p-1.5 text-gray-600 hover:text-[#0B3D2E] rounded-md hover:bg-gray-100"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmItem({ id: img.id, title: img.title })}
                        disabled={actionLoading}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                {editingItem ? "Edit Photograph" : "Upload New Photograph"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* File Upload Selector */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <label className="block font-bold text-gray-700">Image Source / File</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="/images/community/... or upload a file"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-lg bg-[#0B3D2E] text-white font-semibold text-xs flex items-center gap-1">
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
                  Title / Caption <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Vijaya Dashami Tika Blessings at Campus 6"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Alt Text (Accessibility)</label>
                <input
                  type="text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  placeholder="Descriptive text for visually impaired readers..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category_slug}
                    onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Photographer Credit</label>
                  <input
                    type="text"
                    value={formData.photographer_credit}
                    onChange={(e) => setFormData({ ...formData, photographer_credit: e.target.value })}
                    placeholder="e.g. NIK Media Team"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="featured_img"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-[#087F4F] focus:ring-[#0B3D2E] h-4 w-4"
                  />
                  <label htmlFor="featured_img" className="font-bold text-gray-700">
                    Feature on Homepage
                  </label>
                </div>
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
                  <span>{editingItem ? "Save Changes" : "Add to Gallery"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Delete Photograph</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-gray-900 font-semibold">"{deleteConfirmItem.title}"</strong>?
              The photograph record and its cloud storage file will be removed.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={executeDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Photograph</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

