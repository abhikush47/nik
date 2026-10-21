#!/usr/bin/env node
/**
 * CLI Utility to bulk upload photos from a local folder to the NIK Gallery
 *
 * Usage:
 *   node scripts/bulk-upload-photos.mjs "/path/to/folder" [category_slug] [photographer_credit] [title_prefix]
 *
 * Example:
 *   node scripts/bulk-upload-photos.mjs "/Volumes/T7 Shield/Dashain_Images" dashain "NIK Media Team" "Dashain Celebration 2026"
 */

// Polyfill WebSocket before loading Supabase in Node 20
if (typeof globalThis !== "undefined" && typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class DummyWebSocket {};
}

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
const titlePrefix = args[3] || "Dashain Celebration 2026";

if (!folderPath) {
  console.log(`
Usage:
  node scripts/bulk-upload-photos.mjs <folder_path> [category_slug] [photographer_credit] [title_prefix]

Example:
  node scripts/bulk-upload-photos.mjs "/Volumes/T7 Shield/Dashain_Images" dashain "NIK Media Team" "Dashain Celebration 2026"
  `);
  process.exit(1);
}

const resolvedFolder = path.resolve(folderPath.replace(/^~(?=$|\/|\\)/, process.env.HOME || ""));

if (!fs.existsSync(resolvedFolder)) {
  console.error(`❌ Error: Folder does not exist: ${resolvedFolder}`);
  process.exit(1);
}

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const files = fs.readdirSync(resolvedFolder).filter((f) => {
  const ext = path.extname(f).toLowerCase();
  return EXTENSIONS.includes(ext) && !f.startsWith(".");
});

// Sort natural order
files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

if (files.length === 0) {
  console.log(`⚠️ No image files found in ${resolvedFolder}`);
  process.exit(0);
}

console.log(`\n======================================================`);
console.log(`🚀 NIK BULK PHOTO UPLOADER (Option B)`);
console.log(`======================================================`);
console.log(`📂 Source Folder:  ${resolvedFolder}`);
console.log(`📸 Total Photos:   ${files.length}`);
console.log(`🏷️ Category Slug:  ${categorySlug}`);
console.log(`👤 Credit:         ${photographerCredit}`);
console.log(`📝 Title Prefix:   ${titlePrefix}`);
console.log(`------------------------------------------------------\n`);

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

// Optional local SQLite sync
let localDb = null;
try {
  const Database = (await import("better-sqlite3")).default;
  const dbPath = path.resolve(process.cwd(), "data", "nik.db");
  if (fs.existsSync(dbPath)) {
    localDb = new Database(dbPath);
  }
} catch {
  // SQLite optional
}

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
};

async function uploadSingleFile(filename, index, total) {
  const filePath = path.join(resolvedFolder, filename);
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_MAP[ext] || "image/jpeg";
  const fileBuffer = fs.readFileSync(filePath);

  const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

  // 1. Upload to Supabase Storage bucket 'community-media'
  const { error: uploadErr } = await supabase.storage
    .from("community-media")
    .upload(safeName, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadErr) {
    throw new Error(`Storage upload failed: ${uploadErr.message}`);
  }

  // 2. Get Public URL
  const { data: publicData } = supabase.storage
    .from("community-media")
    .getPublicUrl(safeName);

  const fileUrl = publicData.publicUrl;

  // 3. Title formatting
  let title = "";
  if (titlePrefix.trim()) {
    title = `${titlePrefix.trim()} #${index + 1}`;
  } else {
    title = cleanFilenameToTitle(filename);
  }

  const now = new Date().toISOString();

  // 4. Insert into Supabase DB
  const { error: dbErr } = await supabase.from("gallery_images").insert({
    title,
    alt_text: `${title} - Nepali in KIIT community gallery`,
    category_slug: categorySlug,
    event_id: null,
    image_url: fileUrl,
    photographer_credit: photographerCredit || null,
    status: "published",
    featured: index < 4, // Feature the first few images
    display_order: index,
    created_at: now,
    updated_at: now,
  });

  if (dbErr) {
    throw new Error(`Database insert failed: ${dbErr.message}`);
  }

  // 5. Also insert into local SQLite if available
  if (localDb) {
    try {
      localDb.prepare(`
        INSERT INTO gallery_images (
          id, title, alt_text, category_slug, event_id, image_url,
          photographer_credit, status, featured, display_order,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        crypto.randomUUID(),
        title,
        `${title} - Nepali in KIIT community gallery`,
        categorySlug,
        null,
        fileUrl,
        photographerCredit || null,
        "published",
        index < 4 ? 1 : 0,
        index,
        now,
        now
      );
    } catch {
      // Ignore local duplicate errors
    }
  }

  return { title, filename, fileUrl };
}

// Concurrency pool runner
async function runPool(items, concurrency, fn) {
  let index = 0;
  let completed = 0;
  let successes = 0;
  let failures = 0;
  const errors = [];

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      const item = items[currentIndex];
      try {
        await fn(item, currentIndex, items.length);
        successes++;
        completed++;
        const percent = Math.round((completed / items.length) * 100);
        console.log(`[${completed}/${items.length}] (${percent}%) ✅ Uploaded: ${item}`);
      } catch (err) {
        failures++;
        completed++;
        errors.push({ file: item, error: err.message });
        console.error(`[${completed}/${items.length}] ❌ Failed ${item}: ${err.message}`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return { successes, failures, errors };
}

async function main() {
  const startTime = Date.now();
  console.log(`Starting upload with 5 parallel workers...\n`);

  const result = await runPool(files, 5, uploadSingleFile);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n======================================================`);
  console.log(`🏁 BATCH UPLOAD FINISHED in ${duration}s`);
  console.log(`✅ Success: ${result.successes} photos`);
  if (result.failures > 0) {
    console.log(`❌ Failures: ${result.failures} photos`);
    result.errors.slice(0, 5).forEach((e) => console.log(`   - ${e.file}: ${e.error}`));
  }
  console.log(`======================================================`);
  console.log(`🎉 Check the gallery now at:`);
  console.log(`   - Production: https://nepaliinkiit.tech/gallery (Filter: Dashain Celebrations)`);
  console.log(`   - Local:      http://localhost:3000/gallery\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
