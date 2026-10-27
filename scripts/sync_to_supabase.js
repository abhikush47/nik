/**
 * One-click synchronization utility:
 * Reads all data currently stored in data/nik.db (SQLite)
 * and uploads it directly to your newly configured Supabase project.
 *
 * Usage: node scripts/sync_to_supabase.js
 */

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const { createClient } = require("@supabase/supabase-js");

// Read .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("❌ .env.local file not found.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

console.log("==================================================");
console.log("🇳🇵 NIK SQLite -> Supabase Full Data Synchronizer");
console.log("==================================================");
console.log(`Connecting to: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

const dbPath = path.join(process.cwd(), "data", "nik.db");
if (!fs.existsSync(dbPath)) {
  console.error("❌ SQLite database data/nik.db not found.");
  process.exit(1);
}

const db = new Database(dbPath);

async function syncAll() {
  try {
    // 1. Site Settings
    console.log("\n📦 1/8 Syncing Site Settings...");
    const settings = db.prepare("SELECT * FROM site_settings WHERE id = 'default'").get();
    if (settings) {
      const { error } = await supabase.from("site_settings").upsert({
        ...settings,
        marquee_ticker_enabled: Boolean(settings.marquee_ticker_enabled),
        maintenance_mode: Boolean(settings.maintenance_mode),
      }, { onConflict: "id" });
      if (error) console.error("   ⚠️ Settings sync error:", error.message);
      else console.log("   ✅ Site Settings synced.");
    }

    // 2. Resource Categories
    console.log("\n📦 2/8 Syncing Resource Categories...");
    const categories = db.prepare("SELECT * FROM resource_categories").all();
    let catsCount = 0;
    for (const c of categories) {
      const { error } = await supabase.from("resource_categories").upsert({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        display_order: c.display_order,
      }, { onConflict: "slug" });
      if (!error) catsCount++;
    }
    console.log(`   ✅ Synced ${catsCount}/${categories.length} categories.`);

    // 3. Resources
    console.log("\n📦 3/8 Syncing Resources...");
    const resources = db.prepare("SELECT * FROM resources").all();
    let resCount = 0;
    for (const r of resources) {
      let tags = [];
      try { tags = JSON.parse(r.tags || "[]"); } catch {}
      const { error } = await supabase.from("resources").upsert({
        id: r.id,
        title: r.title,
        description: r.description,
        drive_url: r.drive_url,
        category: r.category,
        resource_type: r.resource_type,
        cover_image_url: r.cover_image_url,
        tags,
        related_event: r.related_event,
        event_date: r.event_date,
        status: r.status,
        display_order: r.display_order,
        featured: Boolean(r.featured),
        created_by: r.created_by,
        created_at: r.created_at,
        updated_at: r.updated_at,
      }, { onConflict: "id" });
      if (!error) resCount++;
      else console.error(`   ⚠️ Resource error [${r.title}]:`, error.message);
    }
    console.log(`   ✅ Synced ${resCount}/${resources.length} resources.`);

    // 4. Events
    console.log("\n📦 4/8 Syncing Events...");
    const events = db.prepare("SELECT * FROM events").all();
    let evCount = 0;
    for (const ev of events) {
      const { error } = await supabase.from("events").upsert({
        ...ev,
        featured: Boolean(ev.featured),
      }, { onConflict: "slug" });
      if (!error) evCount++;
      else console.error(`   ⚠️ Event error [${ev.title}]:`, error.message);
    }
    console.log(`   ✅ Synced ${evCount}/${events.length} events.`);

    // 5. Announcements
    console.log("\n📦 5/8 Syncing Announcements...");
    const announcements = db.prepare("SELECT * FROM announcements").all();
    let annCount = 0;
    for (const an of announcements) {
      const { error } = await supabase.from("announcements").upsert({
        ...an,
        marquee_enabled: Boolean(an.marquee_enabled),
      }, { onConflict: "slug" });
      if (!error) annCount++;
    }
    console.log(`   ✅ Synced ${annCount}/${announcements.length} announcements.`);

    // 6. Community Profiles
    console.log("\n📦 6/8 Syncing Community Wings & Profiles...");
    const profiles = db.prepare("SELECT * FROM community_profiles").all();
    let profCount = 0;
    for (const p of profiles) {
      const { error } = await supabase.from("community_profiles").upsert({
        ...p,
        is_published: Boolean(p.is_published),
      }, { onConflict: "id" });
      if (!error) profCount++;
    }
    console.log(`   ✅ Synced ${profCount}/${profiles.length} community profiles.`);

    // 7. Page Content
    console.log("\n📦 7/8 Syncing Page Content...");
    const pageContent = db.prepare("SELECT * FROM page_content").all();
    let pageCount = 0;
    for (const pg of pageContent) {
      let meta = {};
      try { meta = JSON.parse(pg.metadata_json || "{}"); } catch {}
      const { error } = await supabase.from("page_content").upsert({
        key: pg.key,
        title: pg.title,
        subtitle: pg.subtitle,
        content: pg.content,
        metadata_json: meta,
      }, { onConflict: "key" });
      if (!error) pageCount++;
    }
    console.log(`   ✅ Synced ${pageCount}/${pageContent.length} page content records.`);

    // 8. Admin User
    console.log("\n📦 8/8 Syncing Admin User...");
    const admin = db.prepare("SELECT * FROM admin_users WHERE email = 'admin@nepaliinkiit.org'").get();
    if (admin) {
      const { error } = await supabase.from("admin_users").upsert({
        ...admin,
        is_active: Boolean(admin.is_active),
      }, { onConflict: "email" });
      if (!error) console.log("   ✅ Admin user credentials synced.");
    }

    console.log("\n==================================================");
    console.log("🎉 ALL DATA SUCCESSFULLY SYNCED TO YOUR NEW SUPABASE!");
    console.log("==================================================");
  } catch (err) {
    console.error("❌ Sync failed with unexpected error:", err);
  }
}

syncAll();
