import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateContactMessage, deleteContactMessage, logAdminActivity } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateContactMessage(id, body);

    await logAdminActivity(
      admin.email,
      "UPDATE_STATUS",
      "CONTACT_MESSAGE",
      id,
      `Updated message from ${updated.name} to status: ${updated.status}`
    );

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update message error:", err);
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;

    const ok = await deleteContactMessage(id);
    if (!ok) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    await logAdminActivity(admin.email, "DELETE", "CONTACT_MESSAGE", id, `Deleted contact message ID: ${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete message error:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
