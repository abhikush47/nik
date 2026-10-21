import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getContactMessages, getJoinRequests } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const [messages, joinRequests] = await Promise.all([
      getContactMessages(),
      getJoinRequests(),
    ]);
    return NextResponse.json({ messages, joinRequests });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
