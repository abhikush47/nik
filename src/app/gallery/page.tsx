import { getGalleryImages, getGalleryCategories } from "@/lib/db";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata = {
  title: "Community Gallery — Moments & Memories",
  description: "Browse authentic photographs of Nepali student life, Dashain celebrations, acoustic music showcases, and campus gatherings at KIIT University.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const [images, categories] = await Promise.all([
    getGalleryImages({ onlyPublished: true }),
    getGalleryCategories(),
  ]);

  return (
    <div className="space-y-12 pb-24">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#FFF8ED]/50 to-white pt-16 pb-12 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3D2E] text-xs font-bold uppercase tracking-wider">
            <span>Visual Archive</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-display tracking-tight">
            Memories of Home Away From Home
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Authentic photographs capturing the spirit, festivals, and everyday camaraderie of Nepali students at KIIT University.
          </p>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GalleryGrid initialImages={images} categories={categories} />
      </div>
    </div>
  );
}
