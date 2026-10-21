#!/usr/bin/env node
/**
 * CLI Utility to bulk upload photos from a local folder to the NIK Gallery
 *
 * Usage:
 *   node scripts/bulk-upload-photos.mjs "/path/to/folder" [category_slug] [photographer_credit] [title_prefix]
 *
 * Example:
 *   node scripts/bulk-upload-photos.mjs "/Users/ranag/Downloads/dashain_photos" dashain "NIK Media Team" "Dashain Celebration 2026"
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// 1. Read .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [k, ...v] = trimmed.split("=");
    const key = k.trim();
    const val = v.join("=").trim().replace(/^["']|["']$/g, "");
    if (key === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = val;
    if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseKey = val;
  }
}

const args = process.argv.slice(2);
const folderPath = args[0];
const categorySlug = args[1] || "dashain";
const photographerCredit = args[2] || "NIK Media Team";
const titlePrefix = args[3] || "";

if (!folderPath) {
  console.log(`
Usage:
  node scripts/bulk-upload-photos.mjs <folder_path> [category_slug] [photographer_credit] [title_prefix]

Example:
  node scripts/bulk-upload-photos.mjs "~/Downloads/dashain_pics" dashain "NIK Media Team" "Dashain Celebration"
  `);
  process.exit(1);
}

const resolvedFolder = path.resolve(folderPath.replace(/^~(?=$|\/|\\)/, process.env.HOME || ""));

if (!fs.existsSync(resolvedFolder)) {
  console.error(`❌ Error: Folder does not exist: ${resolvedFolder}`);
  process.exit(1);
}

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"];
const files = fs.readdirSync(resolvedFolder).filter((f) => {
  const ext = path.extname(f).toLowerCase();
  return EXTENSIONS.includes(ext) && !f.startsWith(".");
});

if (files.length === 0) {
  console.log(`⚠️ No image files found in ${resolvedFolder}`);
  process.exit(0);
}

console.log(`\n🚀 Found ${files.length} photos in ${resolvedFolder}`);
console.log(`📁 Target Category: ${categorySlug}`);
console.log(`📸 Photographer: ${photographerCredit}`);
if (titlePrefix) console.log(`🏷️ Title Prefix: ${titlePrefix}`);
console.log("--------------------------------------------------");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

function cleanFilenameToTitle(filename) {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  const cleaned = nameWithoutExt.replace(/[-_]+/g, " ").trim();
  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Community Moment";
}

const MIME_MAP = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

async function run() {
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(resolvedFolder, filename);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_MAP[ext] || "image/jpeg";
    const fileBuffer = fs.readFileSync(filePath);

    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

    process.stdout.write(`[${i + 1}/${files.length}] Uploading ${filename}... `);

    try {
      // 1. Upload to Supabase Storage bucket 'community-media'
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("community-media")
        .upload(safeName, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadErr) {
        throw uploadErr;
      }

      // 2. Get Public URL
      const { data: publicData } = supabase.storage
        .from("community-media")
        .getPublicUrl(safeName);

      const fileUrl = publicData.publicUrl;

      // 3. Format Title
      let title = "";
      if (titlePrefix.trim()) {
        title = files.length > 1 ? `${titlePrefix.trim()} #${i + 1}` : titlePrefix.trim();
      } else {
        title = cleanFilenameToTitle(filename);
      }

      const now = new Date().toISOString();
      const { error: dbErr } = await supabase.from("gallery_images").insert({
        title,
        alt_text: `${title} - Nepali in KIIT community gallery`,
        category_slug: categorySlug,
        event_id: null,
        image_url: fileUrl,
        photographer_credit: photographerCredit || null,
        status: "published",
        featured: false,
        display_order: i,
        created_at: now,
        updated_at: now,
      });

      if (dbErr) {
        throw dbErr;
      }

      console.log("✅ Done");
      successCount++;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
      failCount++;
    }
  }

  console.log("\n==================================================");
  console.log(`🎉 Finished! Successfully uploaded: ${successCount} photo(s).`);
  if (failCount > 0) {
    console.log(`⚠️ Failed: ${failCount} photo(s).`);
  }
  console.log(`View gallery at: https://nepaliinkiit.tech/gallery (Category: ${categorySlug})`);
}

run();
