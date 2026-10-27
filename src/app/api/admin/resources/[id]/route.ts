import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getResourceById, updateResource, deleteResource, logAdminActivity } from "@/lib/db";
import { isValidGoogleDriveUrl, detectGoogleDriveType } from "@/lib/validation";
import { revalidateWebsite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const item = await getResourceById(id);

    if (!item) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const existing = await getResourceById(id);
    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

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

    const updates: any = {};

    if (title !== undefined) {
      if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Resource title cannot be empty." }, { status: 400 });
      }
      if (title.trim().length > 120) {
        return NextResponse.json({ error: "Resource title cannot exceed 120 characters." }, { status: 400 });
      }
      updates.title = title.trim();
    }

    if (drive_url !== undefined) {
      if (!drive_url || typeof drive_url !== "string" || !drive_url.trim()) {
        return NextResponse.json({ error: "Google Drive URL cannot be empty." }, { status: 400 });
      }
      if (!isValidGoogleDriveUrl(drive_url.trim())) {
        return NextResponse.json({
          error: "Invalid Google Drive URL. Must be an HTTPS link hosted on drive.google.com or docs.google.com.",
        }, { status: 400 });
      }
      updates.drive_url = drive_url.trim();
    }

    if (category !== undefined) {
      if (!category || typeof category !== "string" || !category.trim()) {
        return NextResponse.json({ error: "Category cannot be empty." }, { status: 400 });
      }
      updates.category = category.trim();
    }

    if (resource_type !== undefined) {
      updates.resource_type = resource_type;
    } else if (updates.drive_url) {
      updates.resource_type = detectGoogleDriveType(updates.drive_url);
    }

    if (description !== undefined) {
      updates.description = description ? description.trim().slice(0, 500) : null;
    }

    if (cover_image_url !== undefined) {
      updates.cover_image_url = cover_image_url ? cover_image_url.trim() : null;
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        updates.tags = Array.from(new Set(tags.map((t) => (typeof t === "string" ? t.trim() : "")).filter(Boolean)));
      }
    }

    if (related_event !== undefined) {
      updates.related_event = related_event ? related_event.trim() : null;
    }

    if (event_date !== undefined) {
      updates.event_date = event_date || null;
    }

    if (status !== undefined) {
      updates.status = status;
    }

    if (display_order !== undefined) {
      updates.display_order = Number(display_order) || 0;
    }

    if (featured !== undefined) {
      updates.featured = Boolean(featured);
    }

    const updated = await updateResource(id, updates);

    await logAdminActivity(
      admin.email,
      "UPDATE",
      "RESOURCE",
      id,
      `Updated resource "${updated.title}" (status: ${updated.status})`
    );

    revalidateWebsite();
    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update resource error:", err);
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const existing = await getResourceById(id);
    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const deleted = await deleteResource(id);

    if (deleted) {
      await logAdminActivity(
        admin.email,
        "DELETE",
        "RESOURCE",
        id,
        `Deleted resource record "${existing.title}"`
      );
    }

    revalidateWebsite();
    return NextResponse.json({ success: true, deleted });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete resource error:", err);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
