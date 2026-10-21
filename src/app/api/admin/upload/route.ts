import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";
import { logAdminActivity } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, AVIF, and GIF are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds maximum size of 15MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

    const supabaseAdmin = getSupabaseAdmin();
    let fileUrl = "";

    if (supabaseAdmin) {
      // Upload to Supabase Storage bucket 'community-media'
      const { data, error } = await supabaseAdmin.storage
        .from("community-media")
        .upload(safeName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error("Supabase storage upload error:", error);
        return NextResponse.json(
          { error: `Cloud storage upload failed: ${error.message}` },
          { status: 500 }
        );
      }

      if (data) {
        const { data: publicData } = supabaseAdmin.storage
          .from("community-media")
          .getPublicUrl(safeName);
        fileUrl = publicData.publicUrl;
      }
    } else {
      // Local storage fallback for development
      if (process.env.VERCEL) {
        return NextResponse.json(
          { error: "Cloud storage is not configured. Please ensure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are set in Vercel." },
          { status: 500 }
        );
      }
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const targetPath = path.join(uploadDir, safeName);
      fs.writeFileSync(targetPath, buffer);
      fileUrl = `/uploads/${safeName}`;
    }


    await logAdminActivity(
      admin.email,
      "UPLOAD",
      "MEDIA",
      safeName,
      `Uploaded image: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
    );

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: safeName,
      size: file.size,
      mimeType: file.type,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Admin upload error:", err);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}
