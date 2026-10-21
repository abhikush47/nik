-- ==============================================================================
-- NIK (NEPALI IN KIIT) — Production PostgreSQL & Supabase Database Schema
-- Migration: 20261013000000_nik_schema.sql
-- Description: Core tables, Row Level Security (RLS) policies, indexes, and storage
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTION: auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'superadmin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 4. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  community_name TEXT NOT NULL DEFAULT 'NEPALI IN KIIT',
  short_name TEXT NOT NULL DEFAULT 'NIK',
  tagline TEXT NOT NULL DEFAULT 'Two Nations. One Community.',
  core_message TEXT NOT NULL DEFAULT 'Every Nepali in KIIT belongs here.',
  hero_headline TEXT NOT NULL DEFAULT 'Far from home. Never far from each other.',
  hero_description TEXT NOT NULL DEFAULT 'NEPALI IN KIIT brings Nepali students together through culture, friendship, shared experiences, and an enduring sense of belonging at KIIT University, Bhubaneswar.',
  footer_text TEXT NOT NULL DEFAULT 'NEPALI IN KIIT (NIK) is the independent community space for all Nepali students at KIIT University, Bhubaneswar, Odisha, India.',
  contact_email TEXT NOT NULL DEFAULT 'contact@nepaliinkiit.org',
  contact_phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  contact_location TEXT NOT NULL DEFAULT 'KIIT University Campus, Bhubaneswar, Odisha, India',
  instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/nepaliinkiit/',
  marquee_ticker_enabled BOOLEAN NOT NULL DEFAULT true,
  marquee_ticker_speed INTEGER NOT NULL DEFAULT 35,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT NOT NULL DEFAULT 'NEPALI IN KIIT — Official Student Community',
  meta_description TEXT NOT NULL DEFAULT 'The premier digital home and student community for Nepali students at KIIT University, Bhubaneswar, Odisha.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 5. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_message TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('General', 'Events', 'Important', 'Community Updates')),
  cover_image TEXT,
  destination_url TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expiry_time TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  marquee_enabled BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_marquee ON announcements(marquee_enabled, status);

CREATE TRIGGER trigger_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 6. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  poster_image TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  venue TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Cultural Celebrations' CHECK (category IN ('Cultural Celebrations', 'Student Gathering', 'Sports & Tournaments', 'Academic & Workshops', 'Community Meetup')),
  registration_url TEXT,
  registration_deadline TIMESTAMPTZ,
  registration_status TEXT NOT NULL DEFAULT 'open' CHECK (registration_status IN ('open', 'closed', 'invite_only', 'none')),
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'past', 'cancelled')),
  seo_title TEXT,
  seo_description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);

CREATE TRIGGER trigger_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 7. GALLERY CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS gallery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. GALLERY IMAGES TABLE
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  category_slug TEXT NOT NULL REFERENCES gallery_categories(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  photographer_credit TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category_slug);
CREATE INDEX IF NOT EXISTS idx_gallery_images_status ON gallery_images(status);
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(display_order);

CREATE TRIGGER trigger_gallery_images_updated_at
BEFORE UPDATE ON gallery_images
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 9. COMMUNITY PROFILES TABLE
CREATE TABLE IF NOT EXISTS community_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  social_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_profiles_published ON community_profiles(is_published, display_order);

CREATE TRIGGER trigger_community_profiles_updated_at
BEFORE UPDATE ON community_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 10. PAGE CONTENT TABLE
CREATE TABLE IF NOT EXISTS page_content (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_page_content_updated_at
BEFORE UPDATE ON page_content
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 11. CONTACT MESSAGES TABLE (Private Admin Inbox)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'resolved', 'archived')),
  private_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

CREATE TRIGGER trigger_contact_messages_updated_at
BEFORE UPDATE ON contact_messages
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 12. JOIN REQUESTS TABLE (Private Admin Inbox)
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  course TEXT,
  year_of_study TEXT,
  interests TEXT,
  why_connect TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted', 'resolved', 'archived')),
  private_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);
CREATE INDEX IF NOT EXISTS idx_join_requests_created ON join_requests(created_at DESC);

CREATE TRIGGER trigger_join_requests_updated_at
BEFORE UPDATE ON join_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 13. ADMIN ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_logs(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies (Anonymous & Authenticated)
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Public can view published announcements within valid dates"
  ON announcements FOR SELECT
  USING (
    status = 'published' AND
    start_time <= NOW() AND
    (expiry_time IS NULL OR expiry_time >= NOW())
  );

CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (status IN ('published', 'past'));

CREATE POLICY "Public can view gallery categories"
  ON gallery_categories FOR SELECT
  USING (true);

CREATE POLICY "Public can view published gallery images"
  ON gallery_images FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can view published community profiles"
  ON community_profiles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public can view page content"
  ON page_content FOR SELECT
  USING (true);

-- 2. Anonymous Submission Policies (Controlled insert only, zero public read)
CREATE POLICY "Anonymous users can submit contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anonymous users can submit join requests"
  ON join_requests FOR INSERT
  WITH CHECK (true);

-- Zero public access to private data:
-- contact_messages SELECT/UPDATE/DELETE: NO public policy
-- join_requests SELECT/UPDATE/DELETE: NO public policy
-- admin_activity_logs: NO public policy
-- admin_users: NO public policy

-- 3. Authenticated Admin Policies (Via Supabase Auth or service role)
-- Service role bypasses RLS by default. For authenticated admin users:
CREATE POLICY "Admins have full access to admin_users"
  ON admin_users FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'email' IN (SELECT email FROM admin_users WHERE is_active = true));

CREATE POLICY "Admins have full access to site_settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins have full access to announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins have full access to events"
  ON events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins have full access to gallery_categories"
  ON gallery_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins have full access to gallery_images"
  ON gallery_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins have full access to community_profiles"
  ON community_profiles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins have full access to page_content"
  ON page_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view and manage contact messages"
  ON contact_messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view and manage join requests"
  ON join_requests FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  TO authenticated
  USING (true);

-- ==============================================================================
-- STORAGE CONFIGURATION FOR SUPABASE (SQL Reference)
-- ==============================================================================
-- insert into storage.buckets (id, name, public) values ('community-media', 'community-media', true);
-- create policy "Public Access" on storage.objects for select using (bucket_id = 'community-media');
-- create policy "Admin Upload" on storage.objects for insert to authenticated with check (bucket_id = 'community-media');
-- create policy "Admin Delete" on storage.objects for delete to authenticated using (bucket_id = 'community-media');
