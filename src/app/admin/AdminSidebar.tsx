"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Users,
  FileText,
  Settings,
  History,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  FolderOpen,
} from "lucide-react";
import Wordmark from "@/components/Wordmark";
import { AdminUser } from "@/lib/types";

interface AdminSidebarProps {
  admin: AdminUser | null;
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/events", label: "Events Manager", icon: Calendar },
  { href: "/admin/resources", label: "Resources Hub", icon: FolderOpen },
  { href: "/admin/messages", label: "Inquiries & Requests", icon: MessageSquare },
  { href: "/admin/community", label: "Community Wings", icon: Users },
  { href: "/admin/pages", label: "Page Content", icon: FileText },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/activity", label: "Activity Audit Log", icon: History },
];

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login route, don't show the sidebar shell
  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      router.push("/admin/login");
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#0B3D2E] text-white p-4 flex items-center justify-between border-b border-emerald-800">
        <Wordmark size="sm" light />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-white hover:bg-emerald-900 rounded-lg"
          aria-label="Toggle admin sidebar"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`${
          mobileOpen ? "block" : "hidden"
        } md:flex flex-col w-full md:w-64 bg-[#0B3D2E] text-white border-r border-emerald-900/60 p-5 space-y-6 flex-shrink-0 z-40`}
      >
        {/* Brand Wordmark */}
        <div className="hidden md:block pb-2 border-b border-emerald-800/60">
          <Wordmark size="md" light />
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300 mt-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin CMS Portal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-white text-[#0B3D2E] shadow-xs font-bold"
                    : "text-emerald-100 hover:text-white hover:bg-emerald-900/60"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="pt-4 border-t border-emerald-800/80 space-y-3">
          {admin && (
            <div className="px-3 py-2 rounded-lg bg-emerald-900/40 text-[11px] leading-tight">
              <p className="font-bold text-white truncate">{admin.name}</p>
              <p className="text-emerald-300 truncate text-[10px]">{admin.email}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-200 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
