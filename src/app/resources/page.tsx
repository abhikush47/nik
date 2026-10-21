import { Metadata } from "next";
import { getResources, getResourceCategories } from "@/lib/db";
import ResourcesHub from "@/components/ResourcesHub";
import { FolderArchive } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NIK Resources — Digital Library & Shared Drives",
  description:
    "One place for our community's memories, documents, events, and shared Google Drive resources for Nepali students at KIIT University.",
};

export default async function ResourcesPage() {
  const [resources, categories] = await Promise.all([
    getResources({ onlyPublished: true }),
    getResourceCategories(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50/60 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Page Identity Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-[#0B3D2E] text-[11px] font-bold tracking-wider uppercase border border-emerald-200/50">
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Nepali in KIIT • Digital Archive</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight font-display">
            NIK Resources
          </h1>

          <p className="text-base sm:text-lg text-gray-700 font-medium">
            One place for our community&apos;s memories, documents, events, and shared resources.
          </p>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
            Explore the resources shared by Nepali in KIIT. Access event photographs, important documents, cultural materials, announcements, and other community resources in one place.
          </p>
        </div>

        {/* Dynamic Client Hub */}
        <ResourcesHub initialResources={resources} categories={categories} />
      </div>
    </div>
  );
}
