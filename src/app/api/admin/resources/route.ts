import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getResources, getResourceCategories, createResource, logAdminActivity } from "@/lib/db";
import { isValidGoogleDriveUrl, detectGoogleDriveType } from "@/lib/validation";
import { revalidateWebsite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
    const [resources, categories] = await Promise.all([
      getResources(), // fetches all including drafts
      getResourceCategories(),
    ]);
    return NextResponse.json(
      { resources, categories },
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
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const {
      title,
      description,
      drive_url,
      category,
      resource_type,
      cover_image_url,
      tags,
      related_event,
      event_date,
      status,
      display_order,
      featured,
    } = body;

    // 1. Validate required fields
    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Resource title is required." }, { status: 400 });
    }

    if (title.trim().length > 120) {
      return NextResponse.json({ error: "Resource title cannot exceed 120 characters." }, { status: 400 });
    }

    if (!drive_url || typeof drive_url !== "string" || !drive_url.trim()) {
      return NextResponse.json({ error: "Google Drive URL is required." }, { status: 400 });
    }

    // 2. Strict Google Drive URL validation
    if (!isValidGoogleDriveUrl(drive_url.trim())) {
      return NextResponse.json({
        error: "Invalid Google Drive URL. Must be an HTTPS link hosted on drive.google.com or docs.google.com.",
      }, { status: 400 });
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      return NextResponse.json({ error: "Category is required." }, { status: 400 });
    }

    // 3. Format tags
    let cleanTags: string[] = [];
    if (Array.isArray(tags)) {
      cleanTags = tags
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter((t) => t.length > 0);
      cleanTags = Array.from(new Set(cleanTags));
    }

    const finalType = resource_type || detectGoogleDriveType(drive_url.trim());

    // 4. Create resource in database
    const created = await createResource({
      title: title.trim(),
      description: description ? description.trim().slice(0, 500) : null,
      drive_url: drive_url.trim(),
      category: category.trim(),
      resource_type: finalType,
      cover_image_url: cover_image_url ? cover_image_url.trim() : null,
      tags: cleanTags,
      related_event: related_event ? related_event.trim() : null,
      event_date: event_date || null,
      status: status || "draft",
      display_order: Number(display_order) || 0,
      featured: Boolean(featured),
      created_by: admin.email,
    });

    await logAdminActivity(
      admin.email,
      "CREATE",
      "RESOURCE",
      created.id,
      `Created resource: "${created.title}" (${created.category})`
    );

    revalidateWebsite();
    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create resource error:", err);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}
