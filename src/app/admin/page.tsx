import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  Image as ImageIcon,
  Megaphone,
  MessageSquare,
  Users,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  FolderOpen,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth";
import { getDashboardMetrics, getAdminActivityLogs } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const [metrics, recentLogs] = await Promise.all([
    getDashboardMetrics(),
    getAdminActivityLogs(8),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B3D2E] bg-emerald-50 px-2.5 py-1 rounded-full">
            Live Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display mt-2">
            Namaste, {admin.name.split(" ")[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Welcome to the NEPALI IN KIIT content management system.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B3D2E] text-white text-xs font-bold hover:bg-[#07261D] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Event</span>
          </Link>
          <Link
            href="/admin/resources"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Resource</span>
          </Link>
          <Link
            href="/admin/announcements"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Notice</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Events Metric */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Events</span>
            <Calendar className="w-4 h-4 text-[#0B3D2E]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              {metrics.totalEvents}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {metrics.upcomingEvents} Upcoming
            </p>
          </div>
          <Link
            href="/admin/events"
            className="text-[11px] font-bold text-[#0B3D2E] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Manage Events</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Announcements Metric */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Notices</span>
            <Megaphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              {metrics.totalAnnouncements ?? 0}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {metrics.activeAnnouncements ?? 0} Active Notices
            </p>
          </div>
          <Link
            href="/admin/announcements"
            className="text-[11px] font-bold text-[#0B3D2E] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Manage Notices</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Resources Metric */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Resources</span>
            <FolderOpen className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              {metrics.totalResources ?? 0}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {metrics.publishedResources ?? 0} Published
            </p>
          </div>
          <Link
            href="/admin/resources"
            className="text-[11px] font-bold text-[#0B3D2E] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Manage Resources</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Messages Metric */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Inquiries</span>
            <MessageSquare className="w-4 h-4 text-[#DC143C]" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              {metrics.unreadMessages}
            </p>
            <p className="text-[11px] text-[#DC143C] font-semibold mt-0.5">
              Unread Messages
            </p>
          </div>
          <Link
            href="/admin/messages"
            className="text-[11px] font-bold text-[#0B3D2E] hover:underline flex items-center gap-1 pt-1"
          >
            <span>View Inbox</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Join Requests Metric */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider">Join Requests</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 font-display">
              {metrics.pendingJoinRequests}
            </p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
              Pending Registrations
            </p>
          </div>
          <Link
            href="/admin/messages"
            className="text-[11px] font-bold text-[#0B3D2E] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Review Requests</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Activity Trail & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Admin Logs */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0B3D2E]" />
              <h2 className="text-base font-bold text-gray-900">Recent Administrator Activity</h2>
            </div>
            <Link
              href="/admin/activity"
              className="text-xs font-semibold text-[#0B3D2E] hover:underline"
            >
              Full Audit Log →
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No recent activity recorded.</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => {
                const dateObj = new Date(log.created_at);
                const timeAgo = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={log.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{log.action}</span>
                        <span className="px-1.5 py-0.2 rounded bg-gray-200 text-gray-700 text-[10px] font-semibold">
                          {log.entity_type}
                        </span>
                      </div>
                      <p className="text-gray-600">{log.details || `Modified ${log.entity_type}`}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick System Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">System Information</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500">Database Engine:</span>
                <span className="font-semibold text-gray-900">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Supabase PostgreSQL" : "Local Persistent SQLite"}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500">Active Ticker:</span>
                <span className="font-semibold text-emerald-600">
                  {metrics.activeAnnouncements} Announcements Active
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500">Security Mode:</span>
                <span className="font-semibold text-gray-900">Signed Session HMAC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Admin Account:</span>
                <span className="font-semibold text-[#0B3D2E] truncate max-w-[140px]">{admin.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
