import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getEvents, createEvent, logAdminActivity } from "@/lib/db";
import { revalidateWebsite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
    const items = await getEvents();
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
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const {
      title,
      slug,
      summary,
      description,
      cover_image,
      poster_image,
      start_date,
      end_date,
      venue,
      category,
      registration_url,
      registration_deadline,
      registration_status,
      featured,
      status,
      seo_title,
      seo_description,
      display_order,
    } = body;

    if (!title || !summary || !description || !cover_image || !start_date || !venue) {
      return NextResponse.json(
        { error: "Title, summary, description, cover image, start date, and venue are required." },
        { status: 400 }
      );
    }

    const safeSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4);

    const created = await createEvent({
      slug: safeSlug,
      title: title.trim(),
      summary: summary.trim(),
      description: description.trim(),
      cover_image: cover_image.trim(),
      poster_image: poster_image ? poster_image.trim() : null,
      start_date,
      end_date: end_date || null,
      venue: venue.trim(),
      category: category || "Cultural Celebrations",
      registration_url: registration_url ? registration_url.trim() : null,
      registration_deadline: registration_deadline || null,
      registration_status: registration_status || "open",
      featured: Boolean(featured),
      status: status || "published",
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      display_order: Number(display_order) || 0,
    });

    await logAdminActivity(
      admin.email,
      "CREATE",
      "EVENT",
      created.id,
      `Created event: "${created.title}"`
    );

    revalidateWebsite();
    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create event error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
