import { NextRequest, NextResponse } from "next/server";
import { createJoinRequest } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, course, year_of_study, interests, why_connect, honeypot } = body;

    // Honeypot anti-spam check
    if (honeypot && String(honeypot).trim() !== "") {
      return NextResponse.json({ success: true, message: "Request received." });
    }

    if (!full_name || full_name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const saved = await createJoinRequest({
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      course: course ? course.trim() : undefined,
      year_of_study: year_of_study ? year_of_study.trim() : undefined,
      interests: interests ? interests.trim() : undefined,
      why_connect: why_connect ? why_connect.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Swagatam! Welcome to NEPALI IN KIIT. We have recorded your information and a coordinator will connect with you.",
      id: saved.id,
    });
  } catch (err: any) {
    console.error("Join API error:", err);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
