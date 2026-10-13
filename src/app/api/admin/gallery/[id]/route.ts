import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateGalleryImage, deleteGalleryImage, logAdminActivity } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Photograph ID is required" }, { status: 400 });
    }
    const body = await req.json();

    const updated = await updateGalleryImage(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Photograph not found" }, { status: 404 });
    }

    await logAdminActivity(
      admin.email,
      "UPDATE",
      "GALLERY_IMAGE",
      id,
      `Updated photo: "${updated.title}" (Status: ${updated.status}, Featured: ${updated.featured})`
    );

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized. Please sign in again." }, { status: 401 });
    }
    console.error("Update gallery photo error:", err);
    return NextResponse.json({ error: err.message || "Failed to update gallery photo" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Photograph ID is required" }, { status: 400 });
    }

    const ok = await deleteGalleryImage(id);
    if (!ok) {
      return NextResponse.json({ error: "Photograph not found or already deleted" }, { status: 404 });
    }

    await logAdminActivity(admin.email, "DELETE", "GALLERY_IMAGE", id, `Deleted gallery photo ID: ${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized. Please sign in again." }, { status: 401 });
    }
    console.error("Delete gallery photo error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete gallery photo" }, { status: 500 });
  }
}

