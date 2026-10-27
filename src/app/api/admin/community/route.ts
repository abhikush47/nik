import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCommunityProfiles, createCommunityProfile, logAdminActivity } from "@/lib/db";
import { revalidateWebsite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await requireAdmin();
    const items = await getCommunityProfiles();
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
    return NextResponse.json({ error: "Failed to fetch community profiles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { name, role, bio, image_url, display_order, is_published, social_link } = body;

    if (!name || !role || !bio) {
      return NextResponse.json({ error: "Name, role, and bio are required." }, { status: 400 });
    }

    const created = await createCommunityProfile({
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      image_url: image_url ? image_url.trim() : null,
      display_order: Number(display_order) || 0,
      is_published: Boolean(is_published),
      social_link: social_link ? social_link.trim() : null,
    });

    await logAdminActivity(admin.email, "CREATE", "COMMUNITY_PROFILE", created.id, `Created profile for: ${created.name}`);

    revalidateWebsite();
    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }
}
