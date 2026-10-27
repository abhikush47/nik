import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAnnouncements, createAnnouncement, logAdminActivity } from "@/lib/db";
import { revalidateWebsite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
    const items = await getAnnouncements();
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const {
      title,
      slug,
      short_message,
      content,
      category,
      cover_image,
      destination_url,
      start_time,
      expiry_time,
      priority,
      marquee_enabled,
      status,
      display_order,
    } = body;

    if (!title || !short_message) {
      return NextResponse.json({ error: "Title and short message are required" }, { status: 400 });
    }

    const safeSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);

    const created = await createAnnouncement({
      title: title.trim(),
      slug: safeSlug,
      short_message: short_message.trim(),
      content: content || null,
      category: category || "General",
      cover_image: cover_image || null,
      destination_url: destination_url || null,
      start_time: start_time || new Date().toISOString(),
      expiry_time: expiry_time || null,
      priority: priority || "normal",
      marquee_enabled: Boolean(marquee_enabled),
      status: status || "published",
      display_order: Number(display_order) || 0,
    });

    await logAdminActivity(
      admin.email,
      "CREATE",
      "ANNOUNCEMENT",
      created.id,
      `Created announcement: "${created.title}"`
    );

    revalidateWebsite();
    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create announcement error:", err);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}
