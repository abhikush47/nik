import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateCommunityProfile, deleteCommunityProfile, logAdminActivity } from "@/lib/db";
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

    const updated = await updateCommunityProfile(id, body);

    await logAdminActivity(
      admin.email,
      "UPDATE",
      "COMMUNITY_PROFILE",
      id,
      `Updated profile: ${updated.name}`
    );

    revalidateWebsite();
    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;

    const ok = await deleteCommunityProfile(id);
    if (!ok) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await logAdminActivity(admin.email, "DELETE", "COMMUNITY_PROFILE", id, `Deleted profile ID: ${id}`);

    revalidateWebsite();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}
