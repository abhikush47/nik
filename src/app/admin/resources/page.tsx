"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  ExternalLink,
  Eye,
  CheckCircle2,
  Upload,
  Search,
  Sparkles,
  Layers,
  Folder,
  FileText,
  Table,
  Presentation,
  FileDown,
  Film,
  AlertCircle,
  HelpCircle,
  Tag as TagIcon,
  Globe,
  Lock,
  Database,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  CheckCircle,
} from "lucide-react";
import { ResourceItem, ResourceCategory, ResourceType } from "@/lib/types";
import { isValidGoogleDriveUrl, detectGoogleDriveType } from "@/lib/validation";
import { notifyWebsiteUpdate } from "@/lib/broadcast";

function getResourceTypeIcon(type: ResourceType) {
  switch (type) {
    case "Google Drive Folder":
      return <Folder className="w-3.5 h-3.5 text-emerald-700" />;
    case "Google Docs":
      return <FileText className="w-3.5 h-3.5 text-blue-600" />;
    case "Google Sheets":
      return <Table className="w-3.5 h-3.5 text-emerald-600" />;
    case "Google Slides":
      return <Presentation className="w-3.5 h-3.5 text-amber-600" />;
    case "PDF":
      return <FileDown className="w-3.5 h-3.5 text-rose-600" />;
    case "Video":
      return <Film className="w-3.5 h-3.5 text-purple-600" />;
    default:
      return <Layers className="w-3.5 h-3.5 text-gray-600" />;
  }
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"updated" | "title" | "order">("updated");

  // Notifications
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ResourceItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<ResourceItem | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    drive_url: "",
    category: "Event Gallery",
    resource_type: "Google Drive Folder" as ResourceType,
    cover_image_url: "",
    related_event: "",
    event_date: "",
    status: "published" as "published" | "draft" | "archived",
    display_order: 0,
    featured: false,
  });

  const router = useRouter();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [supabaseHealth, setSupabaseHealth] = useState<any>(null);
  const [checkingSupabase, setCheckingSupabase] = useState(false);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Check Supabase connection health
  const checkSupabaseStatus = async () => {
    setCheckingSupabase(true);
    try {
      const res = await fetch(`/api/admin/supabase-status?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setSupabaseHealth(data.health);
      }
    } catch (err) {
      console.error("Supabase status check failed:", err);
    } finally {
      setCheckingSupabase(false);
    }
  };

  // Sync all local SQLite data up to Supabase
  const handleSyncToSupabase = async () => {
    setSyncingSupabase(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/supabase-status", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to sync to Supabase");
      }
      setSuccess(`Synced ${data.syncResult?.syncedCategories || 0} categories & ${data.syncResult?.syncedResources || 0} resources to Supabase!`);
      setSupabaseHealth(data.health);
    } catch (err: any) {
      setError(err.message || "Failed to sync to Supabase");
    } finally {
      setSyncingSupabase(false);
    }
  };

  // Fetch resources & categories (with cache-busting)
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/resources?_t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setResources(data.resources || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load admin resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    checkSupabaseStatus();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      drive_url: "",
      category: categories[0]?.name || "Event Gallery",
      resource_type: "Google Drive Folder",
      cover_image_url: "",
      related_event: "",
      event_date: "",
      status: "published",
      display_order: 0,
      featured: false,
    });
    setTags([]);
    setTagInput("");
    setModalOpen(true);
  };

  const openEditModal = (item: ResourceItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      drive_url: item.drive_url,
      category: item.category,
      resource_type: item.resource_type,
      cover_image_url: item.cover_image_url || "",
      related_event: item.related_event || "",
      event_date: item.event_date || "",
      status: item.status,
      display_order: item.display_order,
      featured: item.featured,
    });
    setTags(item.tags || []);
    setTagInput("");
    setModalOpen(true);
  };

  // Google Drive URL live type auto-detection
  const handleDriveUrlChange = (val: string) => {
    setFormData((prev) => {
      const detected = detectGoogleDriveType(val);
      return {
        ...prev,
        drive_url: val,
        resource_type: prev.resource_type === "Google Drive Folder" && detected !== "Google Drive Folder" ? detected : prev.resource_type,
      };
    });
  };

  // Tag helper
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Image Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed");

      setFormData((prev) => ({
        ...prev,
        cover_image_url: data.url,
      }));
      setSuccess("Cover image uploaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingCover(false);
    }
  };

  // Submit resource form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please provide a resource title.");
      return;
    }

    if (!formData.drive_url.trim()) {
      setError("Please provide a Google Drive URL.");
      return;
    }

    if (!isValidGoogleDriveUrl(formData.drive_url.trim())) {
      setError("Invalid Google Drive URL. URL must start with https:// and be hosted on drive.google.com or docs.google.com.");
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        tags,
      };

      if (editingItem) {
        const res = await fetch(`/api/admin/resources/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update resource");
        setSuccess(`Resource "${data.item.title}" updated successfully!`);
      } else {
        const res = await fetch("/api/admin/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create resource");
        setSuccess(`Resource "${data.item.title}" created successfully!`);
      }

      setModalOpen(false);
      notifyWebsiteUpdate();
      router.refresh();
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to save resource");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Publish/Unpublish
  const togglePublication = async (item: ResourceItem) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/resources/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle status");
      setSuccess(`Resource "${item.title}" is now ${nextStatus}.`);
      notifyWebsiteUpdate();
      router.refresh();
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to update publication status");
    }
  };

  // Delete resource
  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    setActionLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/resources/${deleteConfirmItem.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete resource");
      setSuccess(`Resource record "${deleteConfirmItem.title}" was deleted.`);
      setDeleteConfirmItem(null);
      notifyWebsiteUpdate();
      router.refresh();
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete resource");
    } finally {
      setActionLoading(false);
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/resources/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDesc.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");
      setSuccess(`Category "${data.category.name}" created!`);
      setNewCategoryName("");
      setNewCategoryDesc("");
      setCategoryModalOpen(false);
      notifyWebsiteUpdate();
      router.refresh();
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to add category");
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered & Sorted Resources
  const displayedResources = useMemo(() => {
    return resources
      .filter((item) => {
        const matchesCategory =
          categoryFilter === "all" ||
          item.category.toLowerCase() === categoryFilter.toLowerCase();

        const matchesStatus =
          statusFilter === "all" || item.status === statusFilter;

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));

        return matchesCategory && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "order") return a.display_order - b.display_order;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [resources, categoryFilter, statusFilter, searchQuery, sortBy]);

  // Metrics
  const totalCount = resources.length;
  const publishedCount = resources.filter((r) => r.status === "published").length;
  const draftCount = resources.filter((r) => r.status === "draft").length;
  const categoryCount = categories.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">
            Resource Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage community Google Drive shared folders, documents, event materials, and archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#07261D] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {success}
          </span>
          <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {error}
          </span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Supabase Cloud Connection & Sync Status */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              supabaseHealth?.status === "connected"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : supabaseHealth?.status === "restricted_quota"
                ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                : "bg-blue-50 text-blue-700 border border-blue-200/60"
            }`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900">Supabase Cloud Database</span>
                {checkingSupabase ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Checking...
                  </span>
                ) : supabaseHealth?.status === "connected" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-2.5 h-2.5" /> Connected & Storing Resources
                  </span>
                ) : supabaseHealth?.status === "restricted_quota" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                    <AlertTriangle className="w-2.5 h-2.5" /> Egress Quota Exceeded (SQLite Fallback Active)
                  </span>
                ) : supabaseHealth?.status === "missing_tables" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full border border-indigo-200">
                    <AlertCircle className="w-2.5 h-2.5" /> Migration Needed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                    Local SQLite Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {supabaseHealth?.message || "Local SQLite active and ready to mirror with Supabase."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {supabaseHealth?.status === "missing_tables" && (
              <button
                onClick={() => setShowSqlModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Migration SQL</span>
              </button>
            )}

            <button
              onClick={handleSyncToSupabase}
              disabled={syncingSupabase || checkingSupabase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-colors disabled:opacity-50"
              title="Test connection and push all local resources to Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingSupabase ? "animate-spin" : ""}`} />
              <span>{syncingSupabase ? "Syncing..." : "Sync Local → Supabase"}</span>
            </button>
          </div>
        </div>

        {supabaseHealth?.status === "restricted_quota" && (
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              How to restore Supabase Cloud:
            </p>
            <p className="text-amber-800 leading-relaxed">
              Your free Supabase project <code className="bg-amber-100 px-1 rounded text-amber-900 font-mono">ursfdfolewopzrjdofiu</code> hit the free 5 GB bandwidth limit (HTTP 402). Don&apos;t worry: your website is running with zero downtime using local SQLite!
              To restore Supabase, log in to{" "}
              <a
                href="https://supabase.com/dashboard/project/ursfdfolewopzrjdofiu/settings/billing/subscription"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-amber-950 inline-flex items-center gap-0.5 hover:text-black"
              >
                Supabase Billing Settings <ExternalLink className="w-2.5 h-2.5" />
              </a>{" "}
              and disable the Spend Cap, or add a fresh Supabase project in <code className="bg-amber-100 px-1 rounded text-amber-900 font-mono">.env.local</code>. Once done, click <strong>Sync Local → Supabase</strong> above!
            </p>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Resources</span>
          <p className="text-2xl font-black text-gray-900 mt-1 font-display">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Published</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-display">{publishedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Drafts</span>
          <p className="text-2xl font-black text-amber-700 mt-1 font-display">{draftCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Categories</span>
          <p className="text-2xl font-black text-gray-900 mt-1 font-display">{categoryCount}</p>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, category, tags..."
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-xs bg-gray-50/50 focus:bg-white focus:border-[#0B3D2E] text-gray-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-700 font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white text-gray-700 font-medium"
          >
            <option value="updated">Recently Updated</option>
            <option value="title">Title (A-Z)</option>
            <option value="order">Display Order</option>
          </select>
        </div>
      </div>

      {/* Resource Table / List View */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0B3D2E]" />
            <span>Loading resources...</span>
          </div>
        ) : displayedResources.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs space-y-2">
            <p className="font-semibold text-gray-700">No resources found.</p>
            <p className="text-[11px]">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try clearing your search or filters."
                : "Get started by adding your first community Google Drive resource."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedResources.map((res) => (
                  <tr key={res.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Title & Preview */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                          {res.cover_image_url ? (
                            <Image
                              src={res.cover_image_url}
                              alt={res.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            getResourceTypeIcon(res.resource_type)
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-sm">
                          <div className="font-bold text-gray-900 truncate flex items-center gap-1.5" title={res.title}>
                            <span>{res.title}</span>
                            {res.featured && (
                              <span title="Featured">
                                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                              </span>
                            )}
                          </div>
                          {res.description && (
                            <p className="text-[11px] text-gray-400 truncate" title={res.description}>
                              {res.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        {res.category}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-50 border border-gray-200">
                        {getResourceTypeIcon(res.resource_type)}
                        <span>{res.resource_type}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublication(res)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                          res.status === "published"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        }`}
                        title="Click to toggle publish status"
                      >
                        {res.status === "published" ? (
                          <>
                            <Globe className="w-2.5 h-2.5" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-2.5 h-2.5" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-[11px] text-gray-500">
                      {new Date(res.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Test Google Drive Link */}
                        <a
                          href={res.drive_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-[#0B3D2E] rounded-md hover:bg-gray-100"
                          title="Open Google Drive Link in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Card Preview */}
                        <button
                          onClick={() => setPreviewItem(res)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                          title="Preview public card"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(res)}
                          className="p-1.5 text-gray-400 hover:text-emerald-700 rounded-md hover:bg-emerald-50"
                          title="Edit Resource"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirmItem(res)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                          title="Delete Resource Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#0B3D2E]" />
                Public Card Preview
              </span>
              <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Card */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs bg-white">
              <div className="relative h-36 w-full bg-linear-to-br from-[#0B3D2E]/10 via-emerald-50 to-warm-ivory flex items-center justify-center">
                {previewItem.cover_image_url ? (
                  <Image src={previewItem.cover_image_url} alt={previewItem.title} fill className="object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-emerald-100 flex items-center justify-center mx-auto">
                      {getResourceTypeIcon(previewItem.resource_type)}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 mt-1 block">
                      {previewItem.resource_type}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/90 text-[#0B3D2E]">
                    {previewItem.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700">
                  {getResourceTypeIcon(previewItem.resource_type)}
                  <span>{previewItem.resource_type}</span>
                </span>
                <h4 className="font-bold text-gray-900 text-sm font-display line-clamp-2">
                  {previewItem.title}
                </h4>
                {previewItem.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {previewItem.description}
                  </p>
                )}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <span className="text-[10px] text-gray-400">Google Drive</span>
                  <a
                    href={previewItem.drive_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B3D2E] text-white text-xs font-bold"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setPreviewItem(null)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Delete Resource Record</h3>
                <p className="text-xs text-gray-500">Record will be removed from NIK website</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently remove{" "}
              <strong className="text-gray-900 font-semibold">&ldquo;{deleteConfirmItem.title}&rdquo;</strong>?
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Important:</strong> This deletes the NIK catalog record only. Your actual files and folders inside Google Drive remain completely safe and untouched.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
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
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#0B3D2E]">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 font-display">
                    {editingItem ? "Edit Resource" : "Add New Resource"}
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Connect a Google Drive folder or document to the community hub
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              {/* Resource Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">
                    Resource Title <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-gray-400">
                    {formData.title.length}/120
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Dashain Celebration 2026 — Official Photos"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900"
                />
              </div>

              {/* Google Drive URL + Test Link */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">
                    Google Drive URL <span className="text-red-500">*</span>
                  </label>
                  {formData.drive_url && (
                    <a
                      href={formData.drive_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Test Link</span>
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  required
                  value={formData.drive_url}
                  onChange={(e) => handleDriveUrlChange(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/... or docs.google.com"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Must be an HTTPS URL hosted on drive.google.com or docs.google.com.
                </p>
              </div>

              {/* Sharing Permissions Reminder */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-800 text-[11px] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Tip:</strong> Ensure the Google Drive sharing permissions (e.g. &ldquo;Anyone with the link can view&rdquo;) allow your intended community audience to access this resource.
                </span>
              </div>

              {/* Category & Resource Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white text-gray-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Resource Type</label>
                  <select
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value as ResourceType })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white text-gray-900"
                  >
                    <option value="Google Drive Folder">Google Drive Folder</option>
                    <option value="Google Docs">Google Docs</option>
                    <option value="Google Sheets">Google Sheets</option>
                    <option value="Google Slides">Google Slides</option>
                    <option value="PDF">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-700">Short Description</label>
                  <span className="text-[10px] text-gray-400">
                    {formData.description.length}/300
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={300}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe what is contained in this Google Drive resource..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900"
                />
              </div>

              {/* Cover Image Upload / URL */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <label className="block font-bold text-gray-700">Cover Image (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.cover_image_url}
                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                    placeholder="/images/community/... or paste image URL"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white text-gray-900"
                  />
                  <label className="cursor-pointer px-3 py-2 rounded-lg bg-[#0B3D2E] text-white font-semibold text-xs flex items-center gap-1">
                    {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {formData.cover_image_url && (
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative w-12 h-8 rounded border border-gray-200 overflow-hidden shrink-0">
                      <Image src={formData.cover_image_url} alt="Cover preview" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Remove cover
                    </button>
                  </div>
                )}
              </div>

              {/* Tags Manager */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tags (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Type tag and press Add or Enter..."
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]"
                      >
                        <TagIcon className="w-3 h-3 text-emerald-600" />
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Event Info & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Related Event (Optional)</label>
                  <input
                    type="text"
                    value={formData.related_event}
                    onChange={(e) => setFormData({ ...formData, related_event: e.target.value })}
                    placeholder="e.g. Dashain Celebration 2026"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Event Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Status, Display Order, Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Publication Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white text-gray-900"
                  >
                    <option value="draft">Draft (Unpublished)</option>
                    <option value="published">Published (Visible Publicly)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="res_featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-[#087F4F] focus:ring-[#0B3D2E] h-4 w-4"
                  />
                  <label htmlFor="res_featured" className="font-bold text-gray-700">
                    Mark as Featured
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-lg bg-[#0B3D2E] text-white font-bold disabled:opacity-50 flex items-center gap-1.5 shadow-sm hover:bg-[#07261D]"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{editingItem ? "Save Changes" : "Create Resource"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add New Resource Category</h3>
              <button onClick={() => setCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Study Materials"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Brief description of this category..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !newCategoryName.trim()}
                  className="px-4 py-1.5 rounded-lg bg-[#0B3D2E] text-white font-bold disabled:opacity-50 flex items-center gap-1"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Add Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SQL Migration Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">Supabase SQL Migration for Resources</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Copy and paste this script into your{" "}
              <a
                href="https://supabase.com/dashboard/project/ursfdfolewopzrjdofiu/sql/new"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-indigo-600"
              >
                Supabase SQL Editor
              </a>{" "}
              and click <strong>Run</strong> to create the Resources Hub tables and Row Level Security policies:
            </p>

            <div className="relative">
              <pre className="p-3 bg-gray-900 text-gray-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
{`CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  drive_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  resource_type TEXT NOT NULL DEFAULT 'Google Drive Folder',
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  related_event TEXT,
  event_date DATE,
  status TEXT NOT NULL DEFAULT 'published',
  display_order INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read resource categories" ON resource_categories FOR SELECT USING (true);
CREATE POLICY "Public read published resources" ON resources FOR SELECT USING (status = 'published');
CREATE POLICY "Admin write resource categories" ON resource_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin write resources" ON resources FOR ALL TO authenticated USING (true);`}
              </pre>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  drive_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  resource_type TEXT NOT NULL DEFAULT 'Google Drive Folder',
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  related_event TEXT,
  event_date DATE,
  status TEXT NOT NULL DEFAULT 'published',
  display_order INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read resource categories" ON resource_categories FOR SELECT USING (true);
CREATE POLICY "Public read published resources" ON resources FOR SELECT USING (status = 'published');
CREATE POLICY "Admin write resource categories" ON resource_categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin write resources" ON resources FOR ALL TO authenticated USING (true);`);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold backdrop-blur-xs transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? "Copied!" : "Copy SQL"}</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
