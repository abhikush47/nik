import { NextResponse } from "next/server";
import { getAnnouncements, getActiveMarqueeAnnouncements } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const marqueeOnly = searchParams.get("marquee") === "1" || searchParams.get("marquee") === "true";

    const announcements = marqueeOnly
      ? await getActiveMarqueeAnnouncements()
      : await getAnnouncements({ onlyPublished: true });

    return NextResponse.json(
      { announcements, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err: any) {
    console.error("Public announcements API error:", err);
    return NextResponse.json({ error: "Failed to load announcements" }, { status: 500 });
  }
}
