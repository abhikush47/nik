import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, getCurrentAdmin } from "@/lib/auth";
import { logAdminActivity } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (admin) {
      const ip = req.headers.get("x-forwarded-for") || "local";
      await logAdminActivity(admin.email, "LOGOUT", "AUTH", admin.id, "Admin logged out", ip);
    }
  } catch (e) {
    // ignore
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
