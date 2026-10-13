import { getCurrentAdmin } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin CMS Dashboard — NEPALI IN KIIT",
  description: "Management dashboard for announcements, events, gallery, and student inquiries.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // If not logged in, AdminSidebar will handle or page can redirect.
  // Note: if user is visiting /admin/login, we don't redirect.
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900">
      <AdminSidebar admin={admin} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
