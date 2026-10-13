import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateEvent, deleteEvent, logAdminActivity } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateEvent(id, body);

    await logAdminActivity(
      admin.email,
      "UPDATE",
      "EVENT",
      id,
      `Updated event: "${updated.title}" (Status: ${updated.status}, Featured: ${updated.featured})`
    );

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update event error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;

    const ok = await deleteEvent(id);
    if (!ok) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await logAdminActivity(admin.email, "DELETE", "EVENT", id, `Deleted event ID: ${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete event error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
