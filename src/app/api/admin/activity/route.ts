import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminActivityLogs } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const logs = await getAdminActivityLogs(100);
    return NextResponse.json({ logs });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}
