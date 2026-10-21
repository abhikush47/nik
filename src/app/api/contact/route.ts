import { NextRequest, NextResponse } from "next/server";
import { createContactMessage } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, honeypot } = body;

    // Anti-spam honeypot
    if (honeypot && String(honeypot).trim() !== "") {
      return NextResponse.json({ success: true, message: "Message received." });
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Please provide your full name." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!subject || subject.trim().length < 3) {
      return NextResponse.json({ error: "Please enter a subject line." }, { status: 400 });
    }

    if (!message || message.trim().length < 8) {
      return NextResponse.json({ error: "Please enter your message (at least 8 characters)." }, { status: 400 });
    }

    const saved = await createContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Dhanyabad! Your message has been received. A community coordinator will review it shortly.",
      id: saved.id,
    });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
