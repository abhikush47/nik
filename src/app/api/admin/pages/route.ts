import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllPageContents, updatePageContent, logAdminActivity } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const items = await getAllPageContents();
    return NextResponse.json({ items });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch page contents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { key, title, subtitle, content } = body;

    if (!key || !title || !content) {
      return NextResponse.json({ error: "Key, title, and content are required." }, { status: 400 });
    }

    const updated = await updatePageContent(key, { title, subtitle, content });

    await logAdminActivity(admin.email, "UPDATE", "PAGE_CONTENT", key, `Updated page content for: ${key}`);

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update page content" }, { status: 500 });
  }
}
