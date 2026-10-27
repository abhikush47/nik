import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getResourceCategories, createResourceCategory, logAdminActivity } from "@/lib/db";
import { revalidateWebsite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await getResourceCategories();
    return NextResponse.json({ categories });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { name, slug, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const created = await createResourceCategory(name.trim(), slug, description);

    await logAdminActivity(
      admin.email,
      "CREATE",
      "RESOURCE_CATEGORY",
      created.id,
      `Created resource category "${created.name}"`
    );

    revalidateWebsite();
    return NextResponse.json({ success: true, category: created });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create resource category error:", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
