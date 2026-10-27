import { NextResponse } from "next/server";
import { getEvents, getUpcomingEvents, getPastEvents, getFeaturedEvent } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "upcoming" | "past" | "featured" | null

    let data: any = {};
    if (filter === "upcoming") {
      data.events = await getUpcomingEvents();
    } else if (filter === "past") {
      data.events = await getPastEvents();
    } else if (filter === "featured") {
      data.event = await getFeaturedEvent();
    } else {
      data.events = await getEvents({ onlyPublished: true });
    }

    return NextResponse.json(
      { ...data, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err: any) {
    console.error("Public events API error:", err);
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}
