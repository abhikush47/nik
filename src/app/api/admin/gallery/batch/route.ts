import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth";
import { createGalleryImage, logAdminActivity } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

function cleanFilenameToTitle(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  // Replace underscores, dashes, and extra spaces with spaces
  const cleaned = nameWithoutExt.replace(/[-_]+/g, " ").trim();
  // Capitalize words
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Community Moment";
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const formData = await req.formData();

    const category_slug = (formData.get("category_slug") as string) || "dashain";
    const photographer_credit = (formData.get("photographer_credit") as string) || "NIK Media Team";
    const title_prefix = (formData.get("title_prefix") as string) || "";
    const status = (formData.get("status") as string) || "published";

    // Gather all files from 'files' or 'file' keys
    const rawFiles = formData.getAll("files");
    const fallbackFiles = rawFiles.length > 0 ? rawFiles : formData.getAll("file");
    const files = fallbackFiles.filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!supabaseAdmin && !fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedImages = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file format.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Exceeds 15MB maximum file size.`);
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name).toLowerCase() || ".jpg";
        const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

        let fileUrl = "";

        if (supabaseAdmin) {
          const { data, error: uploadErr } = await supabaseAdmin.storage
            .from("community-media")
            .upload(safeName, buffer, {
              contentType: file.type,
              upsert: true,
            });

          if (uploadErr) {
            console.error("Batch upload storage error:", uploadErr);
            errors.push(`${file.name}: Storage upload failed (${uploadErr.message})`);
            continue;
          }

          if (data) {
            const { data: publicData } = supabaseAdmin.storage
              .from("community-media")
              .getPublicUrl(safeName);
            fileUrl = publicData.publicUrl;
          }
        } else {
          if (process.env.VERCEL) {
            errors.push(`${file.name}: Supabase storage is not configured.`);
            continue;
          }
          const targetPath = path.join(uploadDir, safeName);
          fs.writeFileSync(targetPath, buffer);
          fileUrl = `/uploads/${safeName}`;
        }

        // Generate title
        let finalTitle = "";
        if (title_prefix.trim()) {
          finalTitle = files.length > 1 ? `${title_prefix.trim()} #${i + 1}` : title_prefix.trim();
        } else {
          finalTitle = cleanFilenameToTitle(file.name);
        }

        const created = await createGalleryImage({
          title: finalTitle,
          alt_text: `${finalTitle} - Nepali in KIIT community gallery`,
          category_slug,
          event_id: null,
          image_url: fileUrl,
          photographer_credit: photographer_credit.trim() || null,
          status: status as any,
          featured: false,
          display_order: i,
        });

        uploadedImages.push(created);
      } catch (err: any) {
        console.error(`Error processing file ${file.name}:`, err);
        errors.push(`${file.name}: ${err.message || "Failed to process"}`);
      }
    }

    if (uploadedImages.length > 0) {
      await logAdminActivity(
        admin.email,
        "BATCH_UPLOAD",
        "GALLERY_IMAGE",
        category_slug,
        `Batch uploaded ${uploadedImages.length} photo(s) to gallery category "${category_slug}"`
      );
    }

    return NextResponse.json({
      success: true,
      count: uploadedImages.length,
      images: uploadedImages,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Batch upload route error:", err);
    return NextResponse.json({ error: "Failed to batch upload photos." }, { status: 500 });
  }
}
