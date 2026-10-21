import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateJoinRequest, deleteJoinRequest, logAdminActivity } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateJoinRequest(id, body);

    await logAdminActivity(
      admin.email,
      "UPDATE_STATUS",
      "JOIN_REQUEST",
      id,
      `Updated join request from ${updated.full_name} to status: ${updated.status}`
    );

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Update join request error:", err);
    return NextResponse.json({ error: "Failed to update join request" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;

    const ok = await deleteJoinRequest(id);
    if (!ok) {
      return NextResponse.json({ error: "Join request not found" }, { status: 404 });
    }

    await logAdminActivity(admin.email, "DELETE", "JOIN_REQUEST", id, `Deleted join request ID: ${id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Delete join request error:", err);
    return NextResponse.json({ error: "Failed to delete join request" }, { status: 500 });
  }
}
