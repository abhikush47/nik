import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getGalleryImages, getGalleryCategories, createGalleryImage, logAdminActivity } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const [images, categories] = await Promise.all([
      getGalleryImages(),
      getGalleryCategories(),
    ]);
    return NextResponse.json({ images, categories });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const {
      title,
      alt_text,
      category_slug,
      event_id,
      image_url,
      photographer_credit,
      status,
      featured,
      display_order,
    } = body;

    if (!title || !image_url || !category_slug) {
      return NextResponse.json(
        { error: "Title, image URL, and category are required." },
        { status: 400 }
      );
    }

    const created = await createGalleryImage({
      title: title.trim(),
      alt_text: alt_text ? alt_text.trim() : title.trim(),
      category_slug,
      event_id: event_id || null,
      image_url: image_url.trim(),
      photographer_credit: photographer_credit ? photographer_credit.trim() : null,
      status: status || "published",
      featured: Boolean(featured),
      display_order: Number(display_order) || 0,
    });

    await logAdminActivity(
      admin.email,
      "CREATE",
      "GALLERY_IMAGE",
      created.id,
      `Added gallery photo: "${created.title}" (${created.category_slug})`
    );

    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create gallery photo error:", err);
    return NextResponse.json({ error: "Failed to add gallery photo" }, { status: 500 });
  }
}
