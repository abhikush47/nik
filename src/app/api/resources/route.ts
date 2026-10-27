import { NextRequest, NextResponse } from "next/server";
import { getResources, getResourceCategories } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const [resources, categories] = await Promise.all([
      getResources({ onlyPublished: true, category, search }),
      getResourceCategories(),
    ]);

    return NextResponse.json(
      {
        resources,
        categories,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err: any) {
    console.error("Public resources API error:", err);
    return NextResponse.json({ error: "Failed to load resources" }, { status: 500 });
  }
}
