import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { getSupabaseAdmin } from "../supabase";
import {
  AdminUser,
  SiteSettings,
  Announcement,
  EventItem,
  GalleryCategory,
  GalleryImage,
  CommunityProfile,
  PageContent,
  ContactMessage,
  JoinRequest,
  AdminActivityLog,
  DashboardMetrics,
} from "../types";

// ==============================================================================
// STORAGE UTILITY
// ==============================================================================

export function extractStoragePath(imageUrl: string, bucket: string = "community-media"): string | null {
  if (!imageUrl) return null;
  const marker = `/${bucket}/`;
  if (imageUrl.includes(marker)) {
    const parts = imageUrl.split(marker);
    if (parts[1]) {
      return decodeURIComponent(parts[1].split("?")[0]);
    }
  }
  return null;
}

// ==============================================================================
// SQLITE FALLBACK SETUP (Zero-leak prepared statement cache & safe serverless path)
// ==============================================================================

function getDatabasePath(): string {
  const localDir = path.join(process.cwd(), "data");
  let canWriteLocal = false;
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, `.write-test-${process.pid}`);
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    canWriteLocal = true;
  } catch {
    canWriteLocal = false;
  }

  if (canWriteLocal) {
    return path.join(localDir, "nik.db");
  }

  // Fallback to /tmp in read-only environments (e.g. Vercel serverless runtime without Supabase)
  const tmpDir = path.join("/tmp", "nik-data");
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const tmpDbPath = path.join(tmpDir, "nik.db");
    const localDbPath = path.join(localDir, "nik.db");
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(localDbPath)) {
      fs.copyFileSync(localDbPath, tmpDbPath);
    }
    return tmpDbPath;
  } catch {
    return path.join(localDir, "nik.db");
  }
}

let dbInstance: Database.Database | null = null;
const statementCache = new Map<string, Database.Statement>();

function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = getDatabasePath();
    const rawDb = new Database(dbPath);
    try {
      rawDb.pragma("journal_mode = WAL");
    } catch {
      try {
        rawDb.pragma("journal_mode = DELETE");
      } catch {
        // fallback ignored
      }
    }
    rawDb.pragma("foreign_keys = ON");

    // Cache prepared statements on dbInstance so Statement destructors (~Statement())
    // are never triggered during worker garbage collection
    const origPrepare = rawDb.prepare.bind(rawDb);
    (rawDb as any).prepare = (sql: string) => {
      let stmt = statementCache.get(sql);
      if (!stmt) {
        stmt = origPrepare(sql);
        statementCache.set(sql, stmt);
      }
      return stmt;
    };

    initSQLiteSchema(rawDb);
    dbInstance = rawDb;
  }
  return dbInstance;
}

function initSQLiteSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      community_name TEXT NOT NULL,
      short_name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      core_message TEXT NOT NULL,
      hero_headline TEXT NOT NULL,
      hero_description TEXT NOT NULL,
      footer_text TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      contact_location TEXT NOT NULL,
      instagram_url TEXT NOT NULL,
      marquee_ticker_enabled INTEGER NOT NULL DEFAULT 1,
      marquee_ticker_speed INTEGER NOT NULL DEFAULT 35,
      maintenance_mode INTEGER NOT NULL DEFAULT 0,
      meta_title TEXT NOT NULL,
      meta_description TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_message TEXT NOT NULL,
      content TEXT,
      category TEXT NOT NULL DEFAULT 'General',
      cover_image TEXT,
      destination_url TEXT,
      start_time TEXT NOT NULL,
      expiry_time TEXT,
      priority TEXT NOT NULL DEFAULT 'normal',
      marquee_enabled INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'published',
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      poster_image TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      venue TEXT NOT NULL,
      category TEXT NOT NULL,
      registration_url TEXT,
      registration_deadline TEXT,
      registration_status TEXT NOT NULL DEFAULT 'open',
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      seo_title TEXT,
      seo_description TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gallery_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gallery_images (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      alt_text TEXT NOT NULL,
      category_slug TEXT NOT NULL,
      event_id TEXT,
      image_url TEXT NOT NULL,
      photographer_credit TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      featured INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS community_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      bio TEXT NOT NULL,
      image_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      social_link TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS page_content (
      key TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      content TEXT NOT NULL,
      metadata_json TEXT DEFAULT '{}',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      private_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS join_requests (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      course TEXT,
      year_of_study TEXT,
      interests TEXT,
      why_connect TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      private_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id TEXT PRIMARY KEY,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );
  `);

  seedSQLiteInitialData(db);
}

// Deterministic seed data constants (Guarantees zero-drift matching across Supabase & SQLite)
const SEED_ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const SEED_SETTINGS_ID = "default";

const SEED_CATEGORIES = [
  { id: "00000000-0000-0000-0000-000000000011", name: "Dashain Celebrations", slug: "dashain", description: "Grand Vijaya Dashami festivities, tika ceremonies, and cultural music", display_order: 1 },
  { id: "00000000-0000-0000-0000-000000000012", name: "Cultural Celebrations", slug: "cultural-celebrations", description: "Tihar, Deusi Bhailo, New Year, and cultural showcases", display_order: 2 },
  { id: "00000000-0000-0000-0000-000000000013", name: "Student Life & Campus", slug: "student-life", description: "Everyday campus memories, hostel gatherings, and library sessions", display_order: 3 },
  { id: "00000000-0000-0000-0000-000000000014", name: "Sports & Tournaments", slug: "sports", description: "Futsal leagues, cricket matches, and friendly sports meets", display_order: 4 },
  { id: "00000000-0000-0000-0000-000000000015", name: "Community Gatherings", slug: "community-events", description: "Freshers welcomes, orientation meets, and farewell dinners", display_order: 5 },
  { id: "00000000-0000-0000-0000-000000000016", name: "Behind The Scenes", slug: "memories", description: "Preparations, stage decoration, rehearsals, and candid moments", display_order: 6 },
];

const SEED_GALLERY_IMAGES = [
  {
    id: "00000000-0000-0000-0000-000000000021",
    title: "Grand Dashain Community Gathering",
    alt_text: "Nepali students celebrating Dashain together at KIIT with traditional attire and smiles",
    category_slug: "dashain",
    image_url: "/images/community/dashain-together.png",
    photographer_credit: "NIK Media Team",
    featured: true,
    display_order: 1,
    status: "published",
  },
  {
    id: "00000000-0000-0000-0000-000000000022",
    title: "Campus Cultural Festival Experience",
    alt_text: "Nepali festival cultural showcase and stage performances on campus",
    category_slug: "cultural-celebrations",
    image_url: "/images/community/festival-experience.png",
    photographer_credit: "NIK Media Team",
    featured: true,
    display_order: 2,
    status: "published",
  },
  {
    id: "00000000-0000-0000-0000-000000000023",
    title: "Nepali Heritage Meets KIIT Campus",
    alt_text: "Nepali students proudly representing heritage on the KIIT University campus grounds",
    category_slug: "student-life",
    image_url: "/images/community/heritage-campus.png",
    photographer_credit: "NIK Photography",
    featured: true,
    display_order: 3,
    status: "published",
  },
  {
    id: "00000000-0000-0000-0000-000000000024",
    title: "Festival Campus Celebration & Unity",
    alt_text: "Group celebration of Nepali festival traditions in Bhubaneswar",
    category_slug: "cultural-celebrations",
    image_url: "/images/community/campus-celebration.png",
    photographer_credit: "NIK Volunteer",
    featured: true,
    display_order: 4,
    status: "published",
  },
  {
    id: "00000000-0000-0000-0000-000000000025",
    title: "Dashain Talent Showcase & Acoustic Session",
    alt_text: "Poster and visual memory of Nepali musical talent showcase at KIIT",
    category_slug: "dashain",
    image_url: "/images/community/talent-showcase.png",
    photographer_credit: "NIK Arts Committee",
    featured: true,
    display_order: 5,
    status: "published",
  },
  {
    id: "00000000-0000-0000-0000-000000000026",
    title: "KIIT Campus 6 Front Gate & Landmark",
    alt_text: "Campus 6 front gate where Nepali students meet and attend daily classes",
    category_slug: "student-life",
    image_url: "/images/community/kiit-gate.jpg",
    photographer_credit: "Campus Photography",
    featured: false,
    display_order: 6,
    status: "published",
  },
];

const SEED_EVENTS = [
  {
    id: "00000000-0000-0000-0000-000000000031",
    slug: "grand-dashain-celebration-2026",
    title: "Grand Dashain Together: Nepali Cultural Celebration 2026",
    summary: "Join the entire Nepali community at KIIT for Jamara distribution, Tika blessings, traditional feasts, folk dance, and musical performances.",
    description: `Vijaya Dashami is the heart of Nepali celebration. Away from home in Bhubaneswar, NEPALI IN KIIT creates a warm, family-like festival experience where every student receives blessings, wears traditional attire, and celebrates alongside hundreds of fellow Nepali students.\n\n### Event Highlights\n- Traditional Tika & Jamara Ceremony with respected seniors and mentors\n- Authentic Nepali cuisine feast including Sel Roti, Aalu Dum, and festive delicacies\n- Live cultural dance and acoustic musical performances by KIIT Nepali students\n- Interactive Deusi-Bhailo rehearsal & community photo booth\n\nDress code: Traditional Nepali attire (Daura Suruwal, Kurtha, Gunyou Cholo) or formal festive wear.`,
    cover_image: "/images/community/dashain-together.png",
    poster_image: "/images/community/talent-showcase.png",
    start_date: "2026-10-21T10:00:00+05:30",
    end_date: "2026-10-21T18:00:00+05:30",
    venue: "Campus 6 Auditorium & Lawn, KIIT University, Bhubaneswar",
    category: "Cultural Celebrations" as const,
    registration_url: "/join",
    registration_deadline: "2026-10-19T23:59:59+05:30",
    registration_status: "open" as const,
    featured: true,
    status: "published" as const,
    display_order: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000032",
    slug: "nepali-cultural-talent-showcase",
    title: "Nepali Talent Showcase & Acoustic Evening",
    summary: "An open stage showcasing Nepali acoustic music, modern and traditional dance, poetry recitations, and storytelling.",
    description: `A creative evening celebrating the diverse artistic talents within our student community. From contemporary Sarangi fusion to rock acoustics and theatrical skits, come cheer for your peers.\n\nOpen for solo vocalists, bands, solo/group dancers, and spoken-word artists.`,
    cover_image: "/images/community/talent-showcase.png",
    poster_image: "/images/community/campus-celebration.png",
    start_date: "2026-11-08T17:30:00+05:30",
    end_date: "2026-11-08T21:00:00+05:30",
    venue: "Student Activity Center (SAC) Stage, Campus 13, KIIT",
    category: "Cultural Celebrations" as const,
    registration_url: "/join",
    registration_deadline: "2026-11-05T18:00:00+05:30",
    registration_status: "open" as const,
    featured: true,
    status: "published" as const,
    display_order: 2,
  },
  {
    id: "00000000-0000-0000-0000-000000000033",
    slug: "nik-orientation-freshers-welcome-2026",
    title: "NIK Freshers Orientation & Welcome Meet",
    summary: "Welcoming all newly admitted Nepali students to KIIT University. Learn campus navigation, academics tips, hostel life, and city guidance.",
    description: `Starting your college journey in a new city can be intimidating. NIK seniors and peers gather to welcome new students, share essential academic guidance, guide you through Bhubaneswar local life, and help you find immediate companionship.`,
    cover_image: "/images/community/heritage-campus.png",
    poster_image: "/images/community/kiit-gate.jpg",
    start_date: "2026-08-25T14:00:00+05:30",
    end_date: "2026-08-25T17:30:00+05:30",
    venue: "Campus 7 Central Seminar Hall, KIIT University",
    category: "Student Gathering" as const,
    registration_url: "/join",
    registration_deadline: "2026-08-24T12:00:00+05:30",
    registration_status: "closed" as const,
    featured: false,
    status: "past" as const,
    display_order: 3,
  },
];

const SEED_ANNOUNCEMENTS = [
  {
    id: "00000000-0000-0000-0000-000000000041",
    slug: "dashain-2026-registration-open",
    title: "Registration Now Open for Grand Dashain Celebration 2026",
    short_message: "Pre-registration is required for the annual Dashain Tika and Community Feast. Reserve your place early!",
    content: "We invite all Nepali students across all KIIT departments and years to register for the Grand Dashain Celebration. Please fill out the registration form to help our logistics team prepare accurate meals and traditional gifts.",
    category: "Events" as const,
    cover_image: "/images/community/dashain-together.png",
    destination_url: "/events/grand-dashain-celebration-2026",
    priority: "high" as const,
    marquee_enabled: true,
    status: "published" as const,
    display_order: 1,
  },
  {
    id: "00000000-0000-0000-0000-000000000042",
    slug: "welcome-new-nepali-students-2026",
    title: "Namaste! Welcome to all new Nepali students arriving at KIIT",
    short_message: "Need help with hostel check-in, sim cards, or campus navigation? Connect with NIK volunteers anytime.",
    content: "If you have recently arrived in Bhubaneswar or have questions regarding academic registration, local travel, or settling in, reach out to NIK coordinators via the Join Community form or Instagram.",
    category: "Community Updates" as const,
    cover_image: "/images/community/campus-celebration.png",
    destination_url: "/join",
    priority: "normal" as const,
    marquee_enabled: true,
    status: "published" as const,
    display_order: 2,
  },
  {
    id: "00000000-0000-0000-0000-000000000043",
    slug: "call-for-cultural-performers",
    title: "Open Call: Cultural Dancers, Musicians & Volunteers",
    short_message: "Showcase your cultural art or volunteer for event coordination in the upcoming festival celebration.",
    content: "Auditions and collaborative practice sessions will take place every weekend. All experience levels are welcome to participate.",
    category: "General" as const,
    cover_image: "/images/community/talent-showcase.png",
    destination_url: "/contact",
    priority: "normal" as const,
    marquee_enabled: false,
    status: "published" as const,
    display_order: 3,
  },
];

const SEED_PROFILES = [
  {
    id: "00000000-0000-0000-0000-000000000051",
    name: "General Coordination Council",
    role: "Student Community Operations",
    bio: "Dedicated volunteers facilitating academic peer support, campus logistics, and newcomer orientations.",
    image_url: "/images/community/heritage-campus.png",
    display_order: 1,
    is_published: true,
    social_link: "https://www.instagram.com/nepaliinkiit/",
  },
  {
    id: "00000000-0000-0000-0000-000000000052",
    name: "Cultural & Arts Committee",
    role: "Festival & Performance Planning",
    bio: "Organizes Dashain ceremonies, acoustic open-mics, folk dance performances, and art exhibitions.",
    image_url: "/images/community/talent-showcase.png",
    display_order: 2,
    is_published: true,
    social_link: "https://www.instagram.com/nepaliinkiit/",
  },
  {
    id: "00000000-0000-0000-0000-000000000053",
    name: "Sports & Wellness Wing",
    role: "Student Tournaments & Fitness",
    bio: "Coordinates the annual NIK Futsal tournament, cricket matches, and recreational outings.",
    image_url: "/images/community/campus-celebration.png",
    display_order: 3,
    is_published: true,
    social_link: "https://www.instagram.com/nepaliinkiit/",
  },
];

const SEED_PAGE_CONTENTS = [
  {
    key: "about_our_story",
    title: "Our Story: An Unbroken Bridge Between Nepal and Bhubaneswar",
    subtitle: "How hundreds of students found a home away from home",
    content: `KIIT University has long been a preferred higher education destination for hundreds of ambitious Nepali students pursuing engineering, medicine, management, law, and computer applications.\n\nNEPALI IN KIIT (NIK) emerged naturally from a shared need: when living thousands of kilometers away from the hills, plains, and valleys of Nepal, having a trustworthy circle of peers turns a foreign campus into a second home.\n\nNIK is not owned by any single cohort, founder, or executive committee. It belongs equally to every Nepali student who steps foot inside KIIT. Whether you are an undergraduate freshman learning your way around Campus 6, a postgraduate scholar presenting your thesis, or a sports enthusiast playing under the stadium lights, you are an essential part of NIK.`,
    metadata_json: { section: "about" },
  },
  {
    key: "about_values",
    title: "The Pillars That Define Us",
    subtitle: "Five principles guiding our community life",
    content: `**Unity (Ekata):** Crossing all geographic backgrounds from Mechi to Mahakali.\n**Cultural Heritage (Sanskriti):** Preserving our festivals, cuisine, language, and warmth.\n**Belonging (Apnatwa):** Ensuring no Nepali student feels isolated or unheard.\n**Friendship (Miteri):** Fostering lifelong companionship across senior and junior batches.\n**Growth (Bikas):** Supporting academic excellence, leadership skills, and career guidance.`,
    metadata_json: { section: "values" },
  },
  {
    key: "community_guidelines",
    title: "Community Guidelines & Inclusivity Charter",
    subtitle: "Respect, mutual assistance, and shared responsibility",
    content: `1. **Every Nepali Belongs:** Membership is inherent to your presence at KIIT. No fees or political affiliations are required.\n2. **Mutual Respect:** We celebrate all linguistic and cultural traditions of Nepal with zero discrimination.\n3. **Academic Integrity & Campus Respect:** We represent Nepal proudly by respecting KIIT University policies and host city traditions.\n4. **Safety & Peer Support:** When a fellow student is sick or in distress, the community rallies to assist immediately.`,
    metadata_json: { section: "community" },
  },
];

function seedSQLiteInitialData(db: Database.Database) {
  const now = new Date().toISOString();

  // 1. Admin user seed
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM admin_users").get() as { count: number };
  if (adminCount.count === 0) {
    const passwordHash = bcrypt.hashSync("AdminNik2026!", 10);
    db.prepare(`
      INSERT INTO admin_users (id, email, password_hash, name, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      SEED_ADMIN_ID,
      "admin@nepaliinkiit.org",
      passwordHash,
      "NIK Community Administrator",
      "superadmin",
      1,
      now,
      now
    );
  }

  // 2. Site settings seed
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO site_settings (
        id, community_name, short_name, tagline, core_message,
        hero_headline, hero_description, footer_text, contact_email,
        contact_phone, contact_location, instagram_url,
        marquee_ticker_enabled, marquee_ticker_speed, maintenance_mode,
        meta_title, meta_description, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      SEED_SETTINGS_ID,
      "NEPALI IN KIIT",
      "NIK",
      "Two Nations. One Community.",
      "Every Nepali in KIIT belongs here.",
      "Far from home. Never far from each other.",
      "NEPALI IN KIIT brings Nepali students together through culture, friendship, shared experiences, and a vibrant sense of home away from home at KIIT University, Bhubaneswar.",
      "NEPALI IN KIIT (NIK) is the student-led community uniting Nepali students across schools at KIIT Deemed to be University, Bhubaneswar, Odisha, India.",
      "contact@nepaliinkiit.org",
      "+91 7978 000 000",
      "Campus 6 & Campus 15, KIIT University, Bhubaneswar, Odisha, India",
      "https://www.instagram.com/nepaliinkiit/",
      1,
      35,
      0,
      "NEPALI IN KIIT — Official Student Community",
      "The premier digital home, cultural heart, and student community for Nepali students at KIIT University, Bhubaneswar, Odisha.",
      now
    );
  }

  // 3. Gallery Categories seed
  const catCount = db.prepare("SELECT COUNT(*) as count FROM gallery_categories").get() as { count: number };
  if (catCount.count === 0) {
    for (const c of SEED_CATEGORIES) {
      db.prepare(`
        INSERT INTO gallery_categories (id, name, slug, description, display_order, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(c.id, c.name, c.slug, c.description, c.display_order, now);
    }
  }

  // 4. Events seed
  const eventCount = db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number };
  if (eventCount.count === 0) {
    for (const ev of SEED_EVENTS) {
      const existing = db.prepare("SELECT id FROM events WHERE slug = ?").get(ev.slug);
      if (!existing) {
        db.prepare(`
          INSERT INTO events (
            id, slug, title, summary, description, cover_image, poster_image,
            start_date, end_date, venue, category, registration_url,
            registration_deadline, registration_status, featured, status,
            display_order, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          ev.id,
          ev.slug,
          ev.title,
          ev.summary,
          ev.description,
          ev.cover_image,
          ev.poster_image || null,
          ev.start_date,
          ev.end_date || null,
          ev.venue,
          ev.category,
          ev.registration_url || null,
          ev.registration_deadline || null,
          ev.registration_status || "open",
          ev.featured ? 1 : 0,
          ev.status || "published",
          ev.display_order,
          now,
          now
        );
      }
    }
  }

  // 5. Announcements seed
  const annCount = db.prepare("SELECT COUNT(*) as count FROM announcements").get() as { count: number };
  if (annCount.count === 0) {
    for (const an of SEED_ANNOUNCEMENTS) {
      db.prepare(`
        INSERT INTO announcements (
          id, title, slug, short_message, content, category,
          cover_image, destination_url, start_time, priority,
          marquee_enabled, status, display_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        an.id,
        an.title,
        an.slug,
        an.short_message,
        an.content,
        an.category,
        an.cover_image,
        an.destination_url,
        now,
        an.priority,
        an.marquee_enabled ? 1 : 0,
        an.status,
        an.display_order,
        now,
        now
      );
    }
  }

  // 6. Gallery Images seed
  const imgCount = db.prepare("SELECT COUNT(*) as count FROM gallery_images").get() as { count: number };
  if (!imgCount || imgCount.count === 0) {
    for (const img of SEED_GALLERY_IMAGES) {
      db.prepare(`
        INSERT INTO gallery_images (
          id, title, alt_text, category_slug, image_url,
          photographer_credit, status, featured, display_order,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        img.id,
        img.title,
        img.alt_text,
        img.category_slug,
        img.image_url,
        img.photographer_credit,
        img.status,
        img.featured ? 1 : 0,
        img.display_order,
        now,
        now
      );
    }
  }

  // 7. Community Profiles seed
  const profCount = db.prepare("SELECT COUNT(*) as count FROM community_profiles").get() as { count: number };
  if (profCount.count === 0) {
    for (const p of SEED_PROFILES) {
      db.prepare(`
        INSERT INTO community_profiles (
          id, name, role, bio, image_url, display_order, is_published, social_link, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(p.id, p.name, p.role, p.bio, p.image_url, p.display_order, p.is_published ? 1 : 0, p.social_link, now, now);
    }
  }

  // 8. Page Content seed
  const contentCount = db.prepare("SELECT COUNT(*) as count FROM page_content").get() as { count: number };
  if (contentCount.count === 0) {
    for (const c of SEED_PAGE_CONTENTS) {
      db.prepare(`
        INSERT INTO page_content (key, title, subtitle, content, metadata_json, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(c.key, c.title, c.subtitle, c.content, JSON.stringify(c.metadata_json), now);
    }
  }
}

// ==============================================================================
// SUPABASE AUTO-INITIALIZER (Runs once if Supabase backend is clean/unseeded)
// ==============================================================================

let supabaseSeededChecked = false;

async function ensureSupabaseSeeded(supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>) {
  if (supabaseSeededChecked) return;
  supabaseSeededChecked = true;

  try {
    const { count } = await supabase.from("site_settings").select("*", { count: "exact", head: true });
    if (count === 0 || count === null) {
      const now = new Date().toISOString();
      const passwordHash = bcrypt.hashSync("AdminNik2026!", 10);

      await supabase.from("admin_users").upsert({
        id: SEED_ADMIN_ID,
        email: "admin@nepaliinkiit.org",
        password_hash: passwordHash,
        name: "NIK Community Administrator",
        role: "superadmin",
        is_active: true,
      }, { onConflict: "id" });

      await supabase.from("site_settings").upsert({
        id: SEED_SETTINGS_ID,
        community_name: "NEPALI IN KIIT",
        short_name: "NIK",
        tagline: "Two Nations. One Community.",
        core_message: "Every Nepali in KIIT belongs here.",
        hero_headline: "Far from home. Never far from each other.",
        hero_description: "NEPALI IN KIIT brings Nepali students together through culture, friendship, shared experiences, and a vibrant sense of home away from home at KIIT University, Bhubaneswar.",
        footer_text: "NEPALI IN KIIT (NIK) is the student-led community uniting Nepali students across schools at KIIT Deemed to be University, Bhubaneswar, Odisha, India.",
        contact_email: "contact@nepaliinkiit.org",
        contact_phone: "+91 7978 000 000",
        contact_location: "Campus 6 & Campus 15, KIIT University, Bhubaneswar, Odisha, India",
        instagram_url: "https://www.instagram.com/nepaliinkiit/",
        marquee_ticker_enabled: true,
        marquee_ticker_speed: 35,
        maintenance_mode: false,
        meta_title: "NEPALI IN KIIT — Official Student Community",
        meta_description: "The premier digital home, cultural heart, and student community for Nepali students at KIIT University, Bhubaneswar, Odisha.",
        updated_at: now,
      }, { onConflict: "id" });

      for (const c of SEED_CATEGORIES) {
        await supabase.from("gallery_categories").upsert(c, { onConflict: "slug" });
      }

      for (const img of SEED_GALLERY_IMAGES) {
        await supabase.from("gallery_images").upsert(img, { onConflict: "id" });
      }

      for (const ev of SEED_EVENTS) {
        await supabase.from("events").upsert(ev as any, { onConflict: "slug" });
      }

      for (const an of SEED_ANNOUNCEMENTS) {
        await supabase.from("announcements").upsert(an as any, { onConflict: "slug" });
      }

      for (const p of SEED_PROFILES) {
        await supabase.from("community_profiles").upsert(p, { onConflict: "id" });
      }

      for (const c of SEED_PAGE_CONTENTS) {
        await supabase.from("page_content").upsert(c, { onConflict: "key" });
      }
    }
  } catch (err) {
    console.warn("Supabase auto-seed check non-critical warning:", err);
  }
}

// ==============================================================================
// 1. SITE SETTINGS REPOSITORY
// ==============================================================================

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", "default").maybeSingle();
    if (!error && data) {
      return {
        ...data,
        marquee_ticker_enabled: Boolean(data.marquee_ticker_enabled),
        maintenance_mode: Boolean(data.maintenance_mode),
      };
    }
  }

  const db = getDb();
  const row = db.prepare("SELECT * FROM site_settings WHERE id = 'default'").get() as any;
  if (!row) {
    throw new Error("Site settings record missing");
  }
  return {
    ...row,
    marquee_ticker_enabled: Boolean(row.marquee_ticker_enabled),
    maintenance_mode: Boolean(row.maintenance_mode),
  };
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const current = await getSiteSettings();
    const updated: SiteSettings = {
      ...current,
      ...settings,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("site_settings").update(updated).eq("id", "default").select().single();
    if (error) {
      console.error("Supabase updateSiteSettings error:", error);
      throw new Error(`Failed to update site settings: ${error.message}`);
    }
    return {
      ...data,
      marquee_ticker_enabled: Boolean(data.marquee_ticker_enabled),
      maintenance_mode: Boolean(data.maintenance_mode),
    };
  }

  const db = getDb();
  const current = await getSiteSettings();
  const updated: SiteSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE site_settings SET
      community_name = ?,
      short_name = ?,
      tagline = ?,
      core_message = ?,
      hero_headline = ?,
      hero_description = ?,
      footer_text = ?,
      contact_email = ?,
      contact_phone = ?,
      contact_location = ?,
      instagram_url = ?,
      marquee_ticker_enabled = ?,
      marquee_ticker_speed = ?,
      maintenance_mode = ?,
      meta_title = ?,
      meta_description = ?,
      updated_at = ?
    WHERE id = 'default'
  `).run(
    updated.community_name,
    updated.short_name,
    updated.tagline,
    updated.core_message,
    updated.hero_headline,
    updated.hero_description,
    updated.footer_text,
    updated.contact_email,
    updated.contact_phone,
    updated.contact_location,
    updated.instagram_url,
    updated.marquee_ticker_enabled ? 1 : 0,
    updated.marquee_ticker_speed,
    updated.maintenance_mode ? 1 : 0,
    updated.meta_title,
    updated.meta_description,
    updated.updated_at
  );

  return updated;
}

// ==============================================================================
// 2. ANNOUNCEMENTS REPOSITORY
// ==============================================================================

export async function getAnnouncements(options?: { onlyPublished?: boolean; marqueeOnly?: boolean }): Promise<Announcement[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    let query = supabase.from("announcements").select("*");
    if (options?.onlyPublished) query = query.eq("status", "published");
    if (options?.marqueeOnly) query = query.eq("marquee_enabled", true);
    query = query.order("display_order", { ascending: true }).order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) {
      console.error("Supabase getAnnouncements error:", error);
      throw error;
    }
    return (data || []).map((r) => ({
      ...r,
      marquee_enabled: Boolean(r.marquee_enabled),
    }));
  }

  const db = getDb();
  let query = "SELECT * FROM announcements";
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.onlyPublished) {
    conditions.push("status = 'published'");
  }
  if (options?.marqueeOnly) {
    conditions.push("marquee_enabled = 1");
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY display_order ASC, created_at DESC";

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => ({
    ...r,
    marquee_enabled: Boolean(r.marquee_enabled),
  }));
}

export async function getActiveMarqueeAnnouncements(): Promise<Announcement[]> {
  return getAnnouncements({ onlyPublished: true, marqueeOnly: true });
}

export async function getAnnouncementBySlug(slug: string): Promise<Announcement | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase.from("announcements").select("*").eq("slug", slug).maybeSingle();
    return data ? { ...data, marquee_enabled: Boolean(data.marquee_enabled) } : null;
  }

  const db = getDb();
  const row = db.prepare("SELECT * FROM announcements WHERE slug = ?").get(slug) as any;
  if (!row) return null;
  return {
    ...row,
    marquee_enabled: Boolean(row.marquee_enabled),
  };
}

export async function createAnnouncement(data: Omit<Announcement, "id" | "created_at" | "updated_at">): Promise<Announcement> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: created, error } = await supabase.from("announcements").insert({
      ...data,
      created_at: now,
      updated_at: now,
    }).select().single();
    if (error) {
      console.error("Supabase createAnnouncement error:", error);
      throw new Error(`Failed to create announcement: ${error.message}`);
    }
    return { ...created, marquee_enabled: Boolean(created.marquee_enabled) };
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO announcements (
      id, title, slug, short_message, content, category,
      cover_image, destination_url, start_time, expiry_time,
      priority, marquee_enabled, status, display_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title,
    data.slug,
    data.short_message,
    data.content || null,
    data.category,
    data.cover_image || null,
    data.destination_url || null,
    data.start_time || now,
    data.expiry_time || null,
    data.priority || "normal",
    data.marquee_enabled ? 1 : 0,
    data.status || "published",
    data.display_order || 0,
    now,
    now
  );

  return {
    id,
    ...data,
    created_at: now,
    updated_at: now,
  };
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
  const cleanData: any = { ...data };
  if (cleanData.expiry_time === "") cleanData.expiry_time = null;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: updated, error } = await supabase.from("announcements").update({
      ...cleanData,
      updated_at: new Date().toISOString(),
    }).eq("id", id).select().single();
    if (error) {
      console.error("Supabase updateAnnouncement error:", error);
      throw new Error(`Failed to update announcement: ${error.message}`);
    }
    return { ...updated, marquee_enabled: Boolean(updated.marquee_enabled) };
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM announcements WHERE id = ?").get(id) as any;
  if (!existing) {
    throw new Error("Announcement not found");
  }

  const updated = {
    ...existing,
    ...data,
    marquee_enabled: data.marquee_enabled !== undefined ? (data.marquee_enabled ? 1 : 0) : existing.marquee_enabled,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE announcements SET
      title = ?, slug = ?, short_message = ?, content = ?, category = ?,
      cover_image = ?, destination_url = ?, start_time = ?, expiry_time = ?,
      priority = ?, marquee_enabled = ?, status = ?, display_order = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updated.title,
    updated.slug,
    updated.short_message,
    updated.content,
    updated.category,
    updated.cover_image,
    updated.destination_url,
    updated.start_time,
    updated.expiry_time,
    updated.priority,
    updated.marquee_enabled,
    updated.status,
    updated.display_order,
    updated.updated_at,
    id
  );

  return {
    ...updated,
    marquee_enabled: Boolean(updated.marquee_enabled),
  };
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteAnnouncement error:", error);
      throw new Error(`Failed to delete announcement: ${error.message}`);
    }
    return true;
  }

  const db = getDb();
  const res = db.prepare("DELETE FROM announcements WHERE id = ?").run(id);
  return res.changes > 0;
}

// ==============================================================================
// 3. EVENTS REPOSITORY
// ==============================================================================

export async function getEvents(options?: { onlyPublished?: boolean; category?: string }): Promise<EventItem[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    let query = supabase.from("events").select("*");
    if (options?.onlyPublished) query = query.in("status", ["published", "past"]);
    if (options?.category && options.category !== "All") query = query.eq("category", options.category);
    query = query.order("start_date", { ascending: true });
    const { data, error } = await query;
    if (error) {
      console.error("Supabase getEvents error:", error);
      throw error;
    }
    return (data || []).map((r) => ({ ...r, featured: Boolean(r.featured) }));
  }

  const db = getDb();
  let query = "SELECT * FROM events";
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.onlyPublished) {
    conditions.push("status IN ('published', 'past')");
  }
  if (options?.category && options.category !== "All") {
    conditions.push("category = ?");
    params.push(options.category);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY start_date ASC";

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => ({
    ...r,
    featured: Boolean(r.featured),
  }));
}

export async function getUpcomingEvents(): Promise<EventItem[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("events").select("*")
      .eq("status", "published")
      .gte("start_date", now)
      .order("start_date", { ascending: true });
    if (error) throw error;
    return (data || []).map((r) => ({ ...r, featured: Boolean(r.featured) }));
  }

  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM events 
    WHERE status = 'published' AND start_date >= datetime('now')
    ORDER BY start_date ASC
  `).all() as any[];
  return rows.map((r) => ({ ...r, featured: Boolean(r.featured) }));
}

export async function getPastEvents(): Promise<EventItem[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const now = new Date().toISOString();
    const { data, error } = await supabase.from("events").select("*")
      .in("status", ["published", "past"])
      .lt("start_date", now)
      .order("start_date", { ascending: false });
    if (error) throw error;
    return (data || []).map((r) => ({ ...r, featured: Boolean(r.featured) }));
  }

  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM events 
    WHERE status IN ('past', 'published') AND start_date < datetime('now')
    ORDER BY start_date DESC
  `).all() as any[];
  return rows.map((r) => ({ ...r, featured: Boolean(r.featured) }));
}

export async function getFeaturedEvent(): Promise<EventItem | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const { data } = await supabase.from("events").select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("start_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data) return { ...data, featured: Boolean(data.featured) };
    const { data: fallback } = await supabase.from("events").select("*")
      .eq("status", "published")
      .order("start_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    return fallback ? { ...fallback, featured: Boolean(fallback.featured) } : null;
  }

  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM events 
    WHERE status = 'published' AND featured = 1
    ORDER BY start_date ASC LIMIT 1
  `).get() as any;
  if (!row) {
    const nextRow = db.prepare(`
      SELECT * FROM events 
      WHERE status = 'published'
      ORDER BY start_date ASC LIMIT 1
    `).get() as any;
    return nextRow ? { ...nextRow, featured: Boolean(nextRow.featured) } : null;
  }
  return { ...row, featured: Boolean(row.featured) };
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase.from("events").select("*").eq("slug", slug).maybeSingle();
    return data ? { ...data, featured: Boolean(data.featured) } : null;
  }

  const db = getDb();
  const row = db.prepare("SELECT * FROM events WHERE slug = ?").get(slug) as any;
  if (!row) return null;
  return { ...row, featured: Boolean(row.featured) };
}

export async function createEvent(data: Omit<EventItem, "id" | "created_at" | "updated_at">): Promise<EventItem> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: created, error } = await supabase.from("events").insert({
      ...data,
      created_at: now,
      updated_at: now,
    }).select().single();
    if (error) {
      console.error("Supabase createEvent error:", error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
    return { ...created, featured: Boolean(created.featured) };
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO events (
      id, slug, title, summary, description, cover_image, poster_image,
      start_date, end_date, venue, category, registration_url,
      registration_deadline, registration_status, featured, status,
      seo_title, seo_description, display_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.slug,
    data.title,
    data.summary,
    data.description,
    data.cover_image,
    data.poster_image || null,
    data.start_date,
    data.end_date || null,
    data.venue,
    data.category,
    data.registration_url || null,
    data.registration_deadline || null,
    data.registration_status || "open",
    data.featured ? 1 : 0,
    data.status || "published",
    data.seo_title || null,
    data.seo_description || null,
    data.display_order || 0,
    now,
    now
  );

  return {
    id,
    ...data,
    created_at: now,
    updated_at: now,
  };
}

export async function updateEvent(id: string, data: Partial<EventItem>): Promise<EventItem> {
  const cleanData: any = { ...data };
  if (cleanData.registration_deadline === "") cleanData.registration_deadline = null;
  if (cleanData.end_date === "") cleanData.end_date = null;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: updated, error } = await supabase.from("events").update({
      ...cleanData,
      updated_at: new Date().toISOString(),
    }).eq("id", id).select().single();
    if (error) {
      console.error("Supabase updateEvent error:", error);
      throw new Error(`Failed to update event: ${error.message}`);
    }
    return { ...updated, featured: Boolean(updated.featured) };
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM events WHERE id = ?").get(id) as any;
  if (!existing) {
    throw new Error("Event not found");
  }

  const updated = {
    ...existing,
    ...data,
    registration_deadline:
      data.registration_deadline !== undefined
        ? (data.registration_deadline ? String(data.registration_deadline).trim() : null)
        : existing.registration_deadline,
    featured: data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE events SET
      slug = ?, title = ?, summary = ?, description = ?, cover_image = ?,
      poster_image = ?, start_date = ?, end_date = ?, venue = ?, category = ?,
      registration_url = ?, registration_deadline = ?, registration_status = ?,
      featured = ?, status = ?, seo_title = ?, seo_description = ?,
      display_order = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updated.slug,
    updated.title,
    updated.summary,
    updated.description,
    updated.cover_image,
    updated.poster_image,
    updated.start_date,
    updated.end_date,
    updated.venue,
    updated.category,
    updated.registration_url,
    updated.registration_deadline,
    updated.registration_status,
    updated.featured,
    updated.status,
    updated.seo_title,
    updated.seo_description,
    updated.display_order,
    updated.updated_at,
    id
  );

  return {
    ...updated,
    featured: Boolean(updated.featured),
  };
}

export async function deleteEvent(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteEvent error:", error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
    return true;
  }

  const db = getDb();
  const res = db.prepare("DELETE FROM events WHERE id = ?").run(id);
  return res.changes > 0;
}

// ==============================================================================
// 4. GALLERY REPOSITORY (Robust Supabase Storage + PostgreSQL & SQLite)
// ==============================================================================

export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const { data, error } = await supabase.from("gallery_categories").select("*").order("display_order", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  const db = getDb();
  return db.prepare("SELECT * FROM gallery_categories ORDER BY display_order ASC").all() as GalleryCategory[];
}

export async function createGalleryCategory(name: string, slug: string, description?: string): Promise<GalleryCategory> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: countData } = await supabase.from("gallery_categories").select("display_order").order("display_order", { ascending: false }).limit(1);
    const nextOrder = (countData?.[0]?.display_order || 0) + 1;
    const { data: created, error } = await supabase.from("gallery_categories").insert({
      name,
      slug,
      description: description || null,
      display_order: nextOrder,
      created_at: now,
    }).select().single();
    if (error) throw error;
    return created;
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO gallery_categories (id, name, slug, description, display_order, created_at)
    VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM gallery_categories), ?)
  `).run(id, name, slug, description || null, now);
  return { id, name, slug, description: description || null, display_order: 1, created_at: now };
}

export async function getGalleryImages(options?: { onlyPublished?: boolean; categorySlug?: string }): Promise<GalleryImage[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    let query = supabase.from("gallery_images").select("*");
    if (options?.onlyPublished) query = query.eq("status", "published");
    if (options?.categorySlug && options.categorySlug !== "all") query = query.eq("category_slug", options.categorySlug);
    query = query.order("display_order", { ascending: true }).order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r) => ({ ...r, featured: Boolean(r.featured) }));
  }

  const db = getDb();
  let query = "SELECT * FROM gallery_images";
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.onlyPublished) {
    conditions.push("status = 'published'");
  }
  if (options?.categorySlug && options.categorySlug !== "all") {
    conditions.push("category_slug = ?");
    params.push(options.categorySlug);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY display_order ASC, created_at DESC";

  const rows = db.prepare(query).all(...params) as any[];
  return rows.map((r) => ({
    ...r,
    featured: Boolean(r.featured),
  }));
}

export async function getFeaturedGalleryImages(): Promise<GalleryImage[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const { data, error } = await supabase.from("gallery_images").select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) throw error;
    return (data || []).map((r) => ({ ...r, featured: Boolean(r.featured) }));
  }

  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM gallery_images
    WHERE status = 'published' AND featured = 1
    ORDER BY display_order ASC, created_at DESC
    LIMIT 6
  `).all() as any[];
  return rows.map((r) => ({ ...r, featured: Boolean(r.featured) }));
}

export async function createGalleryImage(data: Omit<GalleryImage, "id" | "created_at" | "updated_at">): Promise<GalleryImage> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: created, error } = await supabase.from("gallery_images").insert({
      ...data,
      created_at: now,
      updated_at: now,
    }).select().single();
    if (error) {
      console.error("Supabase createGalleryImage error:", error);
      throw new Error(`Failed to add photo: ${error.message}`);
    }
    return { ...created, featured: Boolean(created.featured) };
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO gallery_images (
      id, title, alt_text, category_slug, event_id, image_url,
      photographer_credit, status, featured, display_order,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.title,
    data.alt_text,
    data.category_slug,
    data.event_id || null,
    data.image_url,
    data.photographer_credit || null,
    data.status || "published",
    data.featured ? 1 : 0,
    data.display_order || 0,
    now,
    now
  );

  return {
    id,
    ...data,
    created_at: now,
    updated_at: now,
  };
}

export async function updateGalleryImage(id: string, data: Partial<GalleryImage>): Promise<GalleryImage> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: updated, error } = await supabase.from("gallery_images").update({
      ...data,
      updated_at: new Date().toISOString(),
    }).eq("id", id).select().single();
    if (error) {
      console.error("Supabase updateGalleryImage error:", error);
      throw new Error(`Failed to update photo: ${error.message}`);
    }
    return { ...updated, featured: Boolean(updated.featured) };
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM gallery_images WHERE id = ?").get(id) as any;
  if (!existing) {
    throw new Error("Gallery image not found");
  }

  const updated = {
    ...existing,
    ...data,
    featured: data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE gallery_images SET
      title = ?, alt_text = ?, category_slug = ?, event_id = ?,
      image_url = ?, photographer_credit = ?, status = ?,
      featured = ?, display_order = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updated.title,
    updated.alt_text,
    updated.category_slug,
    updated.event_id,
    updated.image_url,
    updated.photographer_credit,
    updated.status,
    updated.featured,
    updated.display_order,
    updated.updated_at,
    id
  );

  return {
    ...updated,
    featured: Boolean(updated.featured),
  };
}

export async function deleteGalleryImage(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    // 1. Fetch record first
    const { data: existing } = await supabase
      .from("gallery_images")
      .select("id, image_url, title")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return false;
    }

    // 2. Identify associated storage object and delete if applicable
    if (existing.image_url) {
      const storagePath = extractStoragePath(existing.image_url, "community-media");
      if (storagePath) {
        try {
          const { error: storageErr } = await supabase.storage
            .from("community-media")
            .remove([storagePath]);
          if (storageErr) {
            console.warn("Storage object removal warning:", storageErr.message);
          }
        } catch (err) {
          console.warn("Storage removal exception:", err);
        }
      } else if (existing.image_url.startsWith("/uploads/")) {
        const localPath = path.join(process.cwd(), "public", existing.image_url);
        if (fs.existsSync(localPath)) {
          try { fs.unlinkSync(localPath); } catch (e) { console.warn("Local file unlink error:", e); }
        }
      }
    }

    // 3. Delete from database
    const { error: delErr } = await supabase.from("gallery_images").delete().eq("id", id);
    if (delErr) {
      console.error("Supabase gallery deletion error:", delErr);
      throw new Error(`Database error: ${delErr.message}`);
    }

    return true;
  }

  // SQLite fallback:
  const db = getDb();
  const existing = db.prepare("SELECT image_url FROM gallery_images WHERE id = ?").get(id) as any;
  if (!existing) {
    return false;
  }
  const res = db.prepare("DELETE FROM gallery_images WHERE id = ?").run(id);

  if (existing?.image_url && existing.image_url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", existing.image_url);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete local uploaded file:", err);
      }
    }
  }

  return res.changes > 0;
}

// ==============================================================================
// 5. COMMUNITY PROFILES REPOSITORY
// ==============================================================================

export async function getCommunityProfiles(options?: { onlyPublished?: boolean }): Promise<CommunityProfile[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    let query = supabase.from("community_profiles").select("*");
    if (options?.onlyPublished) query = query.eq("is_published", true);
    query = query.order("display_order", { ascending: true }).order("created_at", { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r) => ({ ...r, is_published: Boolean(r.is_published) }));
  }

  const db = getDb();
  let query = "SELECT * FROM community_profiles";
  if (options?.onlyPublished) {
    query += " WHERE is_published = 1";
  }
  query += " ORDER BY display_order ASC, created_at ASC";
  const rows = db.prepare(query).all() as any[];
  return rows.map((r) => ({
    ...r,
    is_published: Boolean(r.is_published),
  }));
}

export async function createCommunityProfile(data: Omit<CommunityProfile, "id" | "created_at" | "updated_at">): Promise<CommunityProfile> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: created, error } = await supabase.from("community_profiles").insert({
      ...data,
      created_at: now,
      updated_at: now,
    }).select().single();
    if (error) {
      console.error("Supabase createCommunityProfile error:", error);
      throw new Error(`Failed to create community profile: ${error.message}`);
    }
    return { ...created, is_published: Boolean(created.is_published) };
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO community_profiles (
      id, name, role, bio, image_url, display_order, is_published, social_link, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.name,
    data.role,
    data.bio,
    data.image_url || null,
    data.display_order || 0,
    data.is_published ? 1 : 0,
    data.social_link || null,
    now,
    now
  );

  return {
    id,
    ...data,
    created_at: now,
    updated_at: now,
  };
}

export async function updateCommunityProfile(id: string, data: Partial<CommunityProfile>): Promise<CommunityProfile> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: updated, error } = await supabase.from("community_profiles").update({
      ...data,
      updated_at: new Date().toISOString(),
    }).eq("id", id).select().single();
    if (error) {
      console.error("Supabase updateCommunityProfile error:", error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
    return { ...updated, is_published: Boolean(updated.is_published) };
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM community_profiles WHERE id = ?").get(id) as any;
  if (!existing) {
    throw new Error("Profile not found");
  }

  const updated = {
    ...existing,
    ...data,
    is_published: data.is_published !== undefined ? (data.is_published ? 1 : 0) : existing.is_published,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE community_profiles SET
      name = ?, role = ?, bio = ?, image_url = ?,
      display_order = ?, is_published = ?, social_link = ?, updated_at = ?
    WHERE id = ?
  `).run(
    updated.name,
    updated.role,
    updated.bio,
    updated.image_url,
    updated.display_order,
    updated.is_published,
    updated.social_link,
    updated.updated_at,
    id
  );

  return {
    ...updated,
    is_published: Boolean(updated.is_published),
  };
}

export async function deleteCommunityProfile(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("community_profiles").delete().eq("id", id);
    if (error) {
      console.error("Supabase deleteCommunityProfile error:", error);
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
    return true;
  }

  const db = getDb();
  const res = db.prepare("DELETE FROM community_profiles WHERE id = ?").run(id);
  return res.changes > 0;
}

// ==============================================================================
// 6. PAGE CONTENT REPOSITORY
// ==============================================================================

export async function getPageContent(key: string): Promise<PageContent | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const { data } = await supabase.from("page_content").select("*").eq("key", key).maybeSingle();
    if (!data) return null;
    return {
      ...data,
      metadata_json: typeof data.metadata_json === "string" ? JSON.parse(data.metadata_json) : data.metadata_json,
    };
  }

  const db = getDb();
  const row = db.prepare("SELECT * FROM page_content WHERE key = ?").get(key) as any;
  if (!row) return null;
  return {
    ...row,
    metadata_json: row.metadata_json ? JSON.parse(row.metadata_json) : null,
  };
}

export async function getAllPageContents(): Promise<PageContent[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const { data, error } = await supabase.from("page_content").select("*").order("key", { ascending: true });
    if (error) throw error;
    return (data || []).map((r) => ({
      ...r,
      metadata_json: typeof r.metadata_json === "string" ? JSON.parse(r.metadata_json) : r.metadata_json,
    }));
  }

  const db = getDb();
  const rows = db.prepare("SELECT * FROM page_content ORDER BY key ASC").all() as any[];
  return rows.map((r) => ({
    ...r,
    metadata_json: r.metadata_json ? JSON.parse(r.metadata_json) : null,
  }));
}

export async function updatePageContent(key: string, data: { title: string; subtitle?: string | null; content: string }): Promise<PageContent> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: upserted, error } = await supabase.from("page_content").upsert({
      key,
      title: data.title,
      subtitle: data.subtitle || null,
      content: data.content,
      updated_at: now,
    }, { onConflict: "key" }).select().single();
    if (error) {
      console.error("Supabase updatePageContent error:", error);
      throw new Error(`Failed to update page content: ${error.message}`);
    }
    return {
      ...upserted,
      metadata_json: typeof upserted.metadata_json === "string" ? JSON.parse(upserted.metadata_json) : upserted.metadata_json,
    };
  }

  const db = getDb();
  db.prepare(`
    INSERT INTO page_content (key, title, subtitle, content, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      title = excluded.title,
      subtitle = excluded.subtitle,
      content = excluded.content,
      updated_at = excluded.updated_at
  `).run(key, data.title, data.subtitle || null, data.content, now);

  return {
    key,
    title: data.title,
    subtitle: data.subtitle || null,
    content: data.content,
    updated_at: now,
  };
}

// ==============================================================================
// 7. CONTACT MESSAGES (Private)
// ==============================================================================

export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const db = getDb();
  return db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all() as ContactMessage[];
}

export async function createContactMessage(data: { name: string; email: string; subject: string; message: string }): Promise<ContactMessage> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: created, error } = await supabase.from("contact_messages").insert({
      ...data,
      status: "new",
      created_at: now,
      updated_at: now,
    }).select().single();
    if (error) {
      console.error("Supabase createContactMessage error:", error);
      throw new Error(`Failed to save contact message: ${error.message}`);
    }
    return created;
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO contact_messages (id, name, email, subject, message, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'new', ?, ?)
  `).run(id, data.name, data.email, data.subject, data.message, now, now);

  return {
    id,
    ...data,
    status: "new",
    created_at: now,
    updated_at: now,
  };
}

export async function updateContactMessage(id: string, data: { status?: string; private_notes?: string }): Promise<ContactMessage> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: updated, error } = await supabase.from("contact_messages").update({
      ...data,
      updated_at: now,
    }).eq("id", id).select().single();
    if (error) {
      console.error("Supabase updateContactMessage error:", error);
      throw new Error(`Failed to update message: ${error.message}`);
    }
    return updated;
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM contact_messages WHERE id = ?").get(id) as any;
  if (!existing) throw new Error("Message not found");

  const updatedStatus = data.status || existing.status;
  const updatedNotes = data.private_notes !== undefined ? data.private_notes : existing.private_notes;

  db.prepare(`
    UPDATE contact_messages SET status = ?, private_notes = ?, updated_at = ? WHERE id = ?
  `).run(updatedStatus, updatedNotes, now, id);

  return {
    ...existing,
    status: updatedStatus,
    private_notes: updatedNotes,
    updated_at: now,
  };
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  const db = getDb();
  const res = db.prepare("DELETE FROM contact_messages WHERE id = ?").run(id);
  return res.changes > 0;
}

// ==============================================================================
// 8. JOIN REQUESTS (Private)
// ==============================================================================

export async function getJoinRequests(): Promise<JoinRequest[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("join_requests").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const db = getDb();
  return db.prepare("SELECT * FROM join_requests ORDER BY created_at DESC").all() as JoinRequest[];
}

export async function createJoinRequest(data: {
  full_name: string;
  email: string;
  course?: string;
  year_of_study?: string;
  interests?: string;
  why_connect?: string;
}): Promise<JoinRequest> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: created, error } = await supabase.from("join_requests").insert({
      ...data,
      status: "new",
      created_at: now,
      updated_at: now,
    }).select().single();
    if (error) {
      console.error("Supabase createJoinRequest error:", error);
      throw new Error(`Failed to submit join request: ${error.message}`);
    }
    return created;
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO join_requests (
      id, full_name, email, course, year_of_study, interests, why_connect, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)
  `).run(
    id,
    data.full_name,
    data.email,
    data.course || null,
    data.year_of_study || null,
    data.interests || null,
    data.why_connect || null,
    now,
    now
  );

  return {
    id,
    ...data,
    status: "new",
    created_at: now,
    updated_at: now,
  };
}

export async function updateJoinRequest(id: string, data: { status?: string; private_notes?: string }): Promise<JoinRequest> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: updated, error } = await supabase.from("join_requests").update({
      ...data,
      updated_at: now,
    }).eq("id", id).select().single();
    if (error) {
      console.error("Supabase updateJoinRequest error:", error);
      throw new Error(`Failed to update join request: ${error.message}`);
    }
    return updated;
  }

  const db = getDb();
  const existing = db.prepare("SELECT * FROM join_requests WHERE id = ?").get(id) as any;
  if (!existing) throw new Error("Join request not found");

  const updatedStatus = data.status || existing.status;
  const updatedNotes = data.private_notes !== undefined ? data.private_notes : existing.private_notes;

  db.prepare(`
    UPDATE join_requests SET status = ?, private_notes = ?, updated_at = ? WHERE id = ?
  `).run(updatedStatus, updatedNotes, now, id);

  return {
    ...existing,
    status: updatedStatus,
    private_notes: updatedNotes,
    updated_at: now,
  };
}

export async function deleteJoinRequest(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("join_requests").delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  const db = getDb();
  const res = db.prepare("DELETE FROM join_requests WHERE id = ?").run(id);
  return res.changes > 0;
}

// ==============================================================================
// 9. ADMIN ACTIVITY LOGS & METRICS
// ==============================================================================

export async function logAdminActivity(
  adminEmail: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string,
  ipAddress?: string
): Promise<void> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      await supabase.from("admin_activity_logs").insert({
        admin_email: adminEmail,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        details: details || null,
        ip_address: ipAddress || null,
        created_at: now,
      });
      return;
    } catch (err) {
      console.warn("Supabase logAdminActivity non-blocking warning:", err);
    }
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO admin_activity_logs (id, admin_email, action, entity_type, entity_id, details, ip_address, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, adminEmail, action, entityType, entityId || null, details || null, ipAddress || null, now);
}

export async function getAdminActivityLogs(limit = 50): Promise<AdminActivityLog[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase.from("admin_activity_logs").select("*").order("created_at", { ascending: false }).limit(limit);
    return data || [];
  }

  const db = getDb();
  return db.prepare("SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT ?").all(limit) as AdminActivityLog[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const now = new Date().toISOString();
    const [
      { count: totalEvents },
      { count: publishedEvents },
      { count: upcomingEvents },
      { count: totalGalleryImages },
      { count: publishedGalleryImages },
      { count: activeAnnouncements },
      { count: unreadMessages },
      { count: pendingJoinRequests },
    ] = await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }).in("status", ["published", "past"]),
      supabase.from("events").select("*", { count: "exact", head: true }).eq("status", "published").gte("start_date", now),
      supabase.from("gallery_images").select("*", { count: "exact", head: true }),
      supabase.from("gallery_images").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("announcements").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("join_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);

    return {
      totalEvents: totalEvents || 0,
      publishedEvents: publishedEvents || 0,
      upcomingEvents: upcomingEvents || 0,
      totalGalleryImages: totalGalleryImages || 0,
      publishedGalleryImages: publishedGalleryImages || 0,
      activeAnnouncements: activeAnnouncements || 0,
      unreadMessages: unreadMessages || 0,
      pendingJoinRequests: pendingJoinRequests || 0,
    };
  }

  const db = getDb();
  const totalEvents = (db.prepare("SELECT COUNT(*) as c FROM events").get() as any).c;
  const publishedEvents = (db.prepare("SELECT COUNT(*) as c FROM events WHERE status IN ('published', 'past')").get() as any).c;
  const upcomingEvents = (db.prepare("SELECT COUNT(*) as c FROM events WHERE status = 'published' AND start_date >= datetime('now')").get() as any).c;
  const totalGallery = (db.prepare("SELECT COUNT(*) as c FROM gallery_images").get() as any).c;
  const publishedGallery = (db.prepare("SELECT COUNT(*) as c FROM gallery_images WHERE status = 'published'").get() as any).c;
  const activeAnnouncements = (db.prepare("SELECT COUNT(*) as c FROM announcements WHERE status = 'published'").get() as any).c;
  const unreadMessages = (db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status = 'new'").get() as any).c;
  const pendingJoinRequests = (db.prepare("SELECT COUNT(*) as c FROM join_requests WHERE status = 'new'").get() as any).c;

  return {
    totalEvents,
    publishedEvents,
    upcomingEvents,
    totalGalleryImages: totalGallery,
    publishedGalleryImages: publishedGallery,
    activeAnnouncements,
    unreadMessages,
    pendingJoinRequests,
  };
}

// ==============================================================================
// 10. AUTHENTICATION & SECURITY
// ==============================================================================

const SECRET = process.env.ADMIN_SESSION_SECRET || "nik_secret_community_token_key_2026_kiit_bhubaneswar_session_salt";

export function signToken(payload: { userId: string; email: string; role: string; exp: number }): string {
  const data = JSON.stringify(payload);
  const encoded = Buffer.from(data).toString("base64url");
  const hmac = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
  return `${encoded}.${hmac}`;
}

export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;
    const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }
    const json = Buffer.from(encoded, "base64url").toString("utf-8");
    const payload = JSON.parse(json);
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function authenticateAdmin(email: string, passwordPlain: string): Promise<AdminUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await ensureSupabaseSeeded(supabase);
    const { data: user } = await supabase.from("admin_users").select("*").eq("email", cleanEmail).eq("is_active", true).maybeSingle();
    if (!user) return null;

    const valid = bcrypt.compareSync(passwordPlain, user.password_hash);
    if (!valid) return null;

    await supabase.from("admin_users").update({ last_login_at: now }).eq("id", user.id);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: Boolean(user.is_active),
      last_login_at: now,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  const db = getDb();
  const row = db.prepare("SELECT * FROM admin_users WHERE email = ? AND is_active = 1").get(cleanEmail) as any;
  if (!row) return null;

  const valid = bcrypt.compareSync(passwordPlain, row.password_hash);
  if (!valid) return null;

  db.prepare("UPDATE admin_users SET last_login_at = ? WHERE id = ?").run(now, row.id);

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    is_active: Boolean(row.is_active),
    last_login_at: now,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    let { data: user } = await supabase.from("admin_users").select("*").eq("id", id).eq("is_active", true).maybeSingle();
    if (!user) {
      const { data: fallback } = await supabase.from("admin_users").select("*").eq("email", "admin@nepaliinkiit.org").eq("is_active", true).maybeSingle();
      user = fallback;
    }
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: Boolean(user.is_active),
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  const db = getDb();
  let row = db.prepare("SELECT * FROM admin_users WHERE id = ? AND is_active = 1").get(id) as any;
  if (!row) {
    row = db.prepare("SELECT * FROM admin_users WHERE email = 'admin@nepaliinkiit.org' AND is_active = 1").get() as any;
  }
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    is_active: Boolean(row.is_active),
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getAdminUserByEmail(email: string): Promise<AdminUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: user } = await supabase.from("admin_users").select("*").eq("email", cleanEmail).eq("is_active", true).maybeSingle();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: Boolean(user.is_active),
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  const db = getDb();
  const row = db.prepare("SELECT * FROM admin_users WHERE email = ? AND is_active = 1").get(cleanEmail) as any;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    is_active: Boolean(row.is_active),
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase.from("admin_users").select("id, email, name, role, is_active, last_login_at, created_at, updated_at");
    return (data || []).map((u) => ({ ...u, is_active: Boolean(u.is_active) }));
  }

  const db = getDb();
  const rows = db.prepare("SELECT id, email, name, role, is_active, last_login_at, created_at, updated_at FROM admin_users").all() as any[];
  return rows.map((r) => ({
    ...r,
    is_active: Boolean(r.is_active),
  }));
}
