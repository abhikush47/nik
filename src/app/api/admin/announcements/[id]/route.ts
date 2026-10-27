import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateAnnouncement, deleteAnnouncement, logAdminActivity } from "@/lib/db";
import { revalidateWebsite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateAnnouncement(id, body);

    await logAdminActivity(
      admin.email,
      "UPDATE",
      "ANNOUNCEMENT",
      id,
      `Updated announcement: "${updated.title}" (Status: ${updated.status}, Marquee: ${updated.marquee_enabled})`
    );

    revalidateWebsite();
    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update announcement error:", err);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;

    const ok = await deleteAnnouncement(id);
    if (!ok) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    await logAdminActivity(admin.email, "DELETE", "ANNOUNCEMENT", id, `Deleted announcement ID: ${id}`);

    revalidateWebsite();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete announcement error:", err);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
