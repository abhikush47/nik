"use client";

import { useState, useEffect } from "react";
import { History, Shield, Loader2, ArrowLeft } from "lucide-react";
import { AdminActivityLog } from "@/lib/types";

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/activity");
      const data = await res.json();
      if (res.ok) setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-display">
          Administrator Activity Audit Log
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Chronological record of administrator logins, creations, edits, and deletions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#0B3D2E] mx-auto mb-2" />
            <span>Loading audit log...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No activity logs recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Admin</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => {
                  const dateObj = new Date(log.created_at);
                  const timeFormatted = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="p-4 whitespace-nowrap text-gray-400 text-[11px]">
                        {timeFormatted}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {log.admin_email}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-[#0B3D2E]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-gray-600">
                        {log.entity_type}
                      </td>
                      <td className="p-4 text-gray-700 max-w-md truncate" title={log.details || ""}>
                        {log.details || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
