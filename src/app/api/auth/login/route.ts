import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, signToken, logAdminActivity } from "@/lib/db";
import { COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const admin = await authenticateAdmin(email.trim().toLowerCase(), password);
    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 7 days token expiration
    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const token = signToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role,
      exp,
    });

    const ip = req.headers.get("x-forwarded-for") || "local";
    await logAdminActivity(admin.email, "LOGIN", "AUTH", admin.id, "Admin logged in successfully", ip);

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
