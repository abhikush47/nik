"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  Search,
  CheckCircle2,
  Trash2,
  X,
  Loader2,
  Mail,
  Calendar,
  Save,
  Tag,
} from "lucide-react";
import { ContactMessage, JoinRequest } from "@/lib/types";

export default function AdminMessagesPage() {
  const [activeTab, setActiveTab] = useState<"contact" | "join">("contact");
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [selectedJoin, setSelectedJoin] = useState<JoinRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      if (res.ok) {
        setContactMessages(data.messages || []);
        setJoinRequests(data.joinRequests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, type: "contact" | "join", status: string) => {
    try {
      const endpoint =
        type === "contact"
          ? `/api/admin/messages/${id}`
          : `/api/admin/join-requests/${id}`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchMessages();
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev: any) => ({ ...prev, status }));
        }
        if (selectedJoin && selectedJoin.id === id) {
          setSelectedJoin((prev: any) => ({ ...prev, status }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      if (selectedMessage) {
        await fetch(`/api/admin/messages/${selectedMessage.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ private_notes: notes }),
        });
        setSelectedMessage({ ...selectedMessage, private_notes: notes });
      } else if (selectedJoin) {
        await fetch(`/api/admin/join-requests/${selectedJoin.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ private_notes: notes }),
        });
        setSelectedJoin({ ...selectedJoin, private_notes: notes });
      }
      setSuccess("Internal notes saved successfully.");
      fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string, type: "contact" | "join") => {
    if (!confirm("Are you sure you want to permanently delete this submission?")) return;
    try {
      const endpoint =
        type === "contact"
          ? `/api/admin/messages/${id}`
          : `/api/admin/join-requests/${id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        setSelectedMessage(null);
        setSelectedJoin(null);
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredContact = contactMessages.filter((m) => {
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filteredJoin = joinRequests.filter((j) => {
    const matchesStatus = statusFilter === "all" || j.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      j.full_name.toLowerCase().includes(q) ||
      j.email.toLowerCase().includes(q) ||
      (j.course && j.course.toLowerCase().includes(q)) ||
      (j.interests && j.interests.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Inquiries & Community Requests
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review incoming contact form submissions and student community interest forms.
        </p>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200">
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => {
              setActiveTab("contact");
              setSelectedMessage(null);
              setSelectedJoin(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "contact"
                ? "bg-white text-[#0B3D2E] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Contact Messages ({contactMessages.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("join");
              setSelectedMessage(null);
              setSelectedJoin(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "join"
                ? "bg-white text-[#0B3D2E] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Join Requests ({joinRequests.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read / Reviewed</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Inbox Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List Column */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin text-[#0B3D2E] mx-auto mb-2" />
              <span>Loading messages...</span>
            </div>
          ) : activeTab === "contact" ? (
            filteredContact.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No contact messages.</div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredContact.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setSelectedJoin(null);
                      setNotes(msg.private_notes || "");
                    }}
                    className={`p-4 cursor-pointer transition-colors text-xs ${
                      selectedMessage?.id === msg.id
                        ? "bg-emerald-50/70 border-l-4 border-[#0B3D2E]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-gray-900 truncate">{msg.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          msg.status === "new"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-700 truncate">{msg.subject}</p>
                    <p className="text-gray-500 truncate mt-0.5">{msg.message}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : filteredJoin.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">No join requests.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredJoin.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedJoin(req);
                    setSelectedMessage(null);
                    setNotes(req.private_notes || "");
                  }}
                  className={`p-4 cursor-pointer transition-colors text-xs ${
                    selectedJoin?.id === req.id
                      ? "bg-emerald-50/70 border-l-4 border-[#0B3D2E]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-gray-900 truncate">{req.full_name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        req.status === "new"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">
                    {req.course || "KIIT Student"} • {req.year_of_study || ""}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-2 block">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
          {selectedMessage ? (
            <div className="space-y-6 text-xs">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-bold text-gray-900">{selectedMessage.subject}</h2>
                  <p className="text-gray-500 mt-0.5">
                    From: <span className="font-semibold text-gray-800">{selectedMessage.name}</span> (
                    <a href={`mailto:${selectedMessage.email}`} className="text-[#0B3D2E] underline">
                      {selectedMessage.email}
                    </a>
                    )
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Received: {new Date(selectedMessage.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleUpdateStatus(selectedMessage.id, "contact", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-300 font-semibold text-xs bg-white"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>

                  <button
                    onClick={() => handleDelete(selectedMessage.id, "contact")}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-4 rounded-xl bg-gray-50 text-gray-800 leading-relaxed whitespace-pre-wrap text-sm border border-gray-100">
                {selectedMessage.message}
              </div>

              {/* Private Notes */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                  Internal Coordinator Notes (Private to Admin)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record follow-up actions, who called this student, resolution notes..."
                  className="w-full p-3 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-[#0B3D2E]"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-[#0B3D2E] text-white font-bold rounded-lg text-xs hover:bg-[#07261D] flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingNotes ? "Saving..." : "Save Notes"}</span>
                </button>
              </div>
            </div>
          ) : selectedJoin ? (
            <div className="space-y-6 text-xs">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-bold text-gray-900">{selectedJoin.full_name}</h2>
                  <p className="text-gray-500 mt-0.5">
                    Email:{" "}
                    <a href={`mailto:${selectedJoin.email}`} className="text-[#0B3D2E] underline font-semibold">
                      {selectedJoin.email}
                    </a>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Submitted: {new Date(selectedJoin.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedJoin.status}
                    onChange={(e) => handleUpdateStatus(selectedJoin.id, "join", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-300 font-semibold text-xs bg-white"
                  >
                    <option value="new">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="contacted">Contacted</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>

                  <button
                    onClick={() => handleDelete(selectedJoin.id, "join")}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Course:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedJoin.course || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Year of Study:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedJoin.year_of_study || "1st Year"}</p>
                </div>
              </div>

              {selectedJoin.interests && (
                <div className="space-y-1">
                  <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Interests:</span>
                  <p className="font-medium text-gray-800 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                    {selectedJoin.interests}
                  </p>
                </div>
              )}

              {selectedJoin.why_connect && (
                <div className="space-y-1">
                  <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold">Statement:</span>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                    “{selectedJoin.why_connect}”
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                  Internal Coordinator Notes (Private to Admin)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record follow-up notes, assigned hostel senior, WhatsApp group addition..."
                  className="w-full p-3 rounded-lg border border-gray-300 text-xs focus:ring-1 focus:ring-[#0B3D2E]"
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-4 py-2 bg-[#0B3D2E] text-white font-bold rounded-lg text-xs hover:bg-[#07261D] flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingNotes ? "Saving..." : "Save Notes"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 text-xs">
              Select an item on the left to inspect its full details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
