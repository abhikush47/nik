-- ==============================================================================
-- 🇳🇵 NEPALI IN KIIT (NIK) — COMPLETE SUPABASE DATABASE MIGRATION (2026)
-- Target: Any Fresh Supabase Project (PostgreSQL 15+)
-- Run this entire script in your Supabase Dashboard -> SQL Editor -> Run
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

-- ==============================================================================
-- 3. ADMIN CMS TABLES
-- ==============================================================================

-- 3.1 Admin Users Table
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

DROP TRIGGER IF EXISTS trigger_admin_users_updated_at ON admin_users;
CREATE TRIGGER trigger_admin_users_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3.2 Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  community_name TEXT NOT NULL DEFAULT 'NEPALI IN KIIT',
  short_name TEXT NOT NULL DEFAULT 'NIK',
  tagline TEXT NOT NULL DEFAULT 'Two Nations. One Community.',
  core_message TEXT NOT NULL DEFAULT 'Every Nepali in KIIT belongs here.',
  hero_headline TEXT NOT NULL DEFAULT 'Far from home. Never far from each other.',
  hero_description TEXT NOT NULL DEFAULT 'NEPALI IN KIIT brings Nepali students together through culture, friendship, shared experiences, and an enduring sense of belonging at KIIT University, Bhubaneswar.',
  footer_text TEXT NOT NULL DEFAULT 'NEPALI IN KIIT (NIK) is the student-led community uniting Nepali students across schools at KIIT Deemed to be University, Bhubaneswar, Odisha, India.',
  contact_email TEXT NOT NULL DEFAULT 'contact@nepaliinkiit.org',
  contact_phone TEXT NOT NULL DEFAULT '+91 7978 000 000',
  contact_location TEXT NOT NULL DEFAULT 'Campus 6 & Campus 15, KIIT University, Bhubaneswar, Odisha, India',
  instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/nepaliinkiit/',
  marquee_ticker_enabled BOOLEAN NOT NULL DEFAULT true,
  marquee_ticker_speed INTEGER NOT NULL DEFAULT 35,
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  meta_title TEXT NOT NULL DEFAULT 'NEPALI IN KIIT — Official Student Community',
  meta_description TEXT NOT NULL DEFAULT 'The premier digital home, cultural heart, and student community for Nepali students at KIIT University, Bhubaneswar, Odisha.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_site_settings_updated_at ON site_settings;
CREATE TRIGGER trigger_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3.3 Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_message TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL DEFAULT 'General',
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
CREATE INDEX IF NOT EXISTS idx_announcements_slug ON announcements(slug);

DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON announcements;
CREATE TRIGGER trigger_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3.4 Events Table
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
  category TEXT NOT NULL DEFAULT 'Cultural Celebrations',
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

DROP TRIGGER IF EXISTS trigger_events_updated_at ON events;
CREATE TRIGGER trigger_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3.5 Resource Categories Table (Digital Archive / Drive Hub)
CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_res_cat_slug ON resource_categories(slug);
CREATE INDEX IF NOT EXISTS idx_res_cat_order ON resource_categories(display_order);

-- 3.6 Resources Table (Shared Google Drives, Docs, Sheets, Photos)
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  drive_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  resource_type TEXT NOT NULL DEFAULT 'Google Drive Folder' CHECK (resource_type IN (
    'Google Drive Folder',
    'Google Docs',
    'Google Sheets',
    'Google Slides',
    'PDF',
    'Video',
    'Other'
  )),
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  related_event TEXT,
  event_date DATE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(featured);
CREATE INDEX IF NOT EXISTS idx_resources_order ON resources(display_order);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

DROP TRIGGER IF EXISTS trigger_resources_updated_at ON resources;
CREATE TRIGGER trigger_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3.7 Community Wings & Profiles Table
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

DROP TRIGGER IF EXISTS trigger_community_profiles_updated_at ON community_profiles;
CREATE TRIGGER trigger_community_profiles_updated_at
BEFORE UPDATE ON community_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3.8 Page Content Table (About, Values, Guidelines, Story)
CREATE TABLE IF NOT EXISTS page_content (
  key TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_page_content_updated_at ON page_content;
CREATE TRIGGER trigger_page_content_updated_at
BEFORE UPDATE ON page_content
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3.9 Inquiries & Contact Messages Table (Private Inbox)
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

DROP TRIGGER IF EXISTS trigger_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER trigger_contact_messages_updated_at
BEFORE UPDATE ON contact_messages
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3.10 Join Community Requests Table (Private Inbox)
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

DROP TRIGGER IF EXISTS trigger_join_requests_updated_at ON join_requests;
CREATE TRIGGER trigger_join_requests_updated_at
BEFORE UPDATE ON join_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 3.11 Activity Audit Log Table
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
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 4.1 Public SELECT policies (Unauthenticated Visitors)
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view published announcements" ON announcements FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published events" ON events FOR SELECT USING (status IN ('published', 'past'));
CREATE POLICY "Public can view resource categories" ON resource_categories FOR SELECT USING (true);
CREATE POLICY "Public can view published resources" ON resources FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published community profiles" ON community_profiles FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view page content" ON page_content FOR SELECT USING (true);

-- 4.2 Public INSERT policies (Contact & Join Forms)
CREATE POLICY "Public can submit contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit join requests" ON join_requests FOR INSERT WITH CHECK (true);

-- 4.3 Service Role & Authenticated Admin Full Access
CREATE POLICY "Service role full access on admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on events" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on resource_categories" ON resource_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on resources" ON resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on community_profiles" ON community_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on page_content" ON page_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on contact_messages" ON contact_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on join_requests" ON join_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on admin_activity_logs" ON admin_activity_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. STORAGE BUCKET (For Image & Resource Uploads)
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public can view files in 'uploads' bucket
DROP POLICY IF EXISTS "Public can view uploaded files" ON storage.objects;
CREATE POLICY "Public can view uploaded files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Authenticated & Service Role can upload files
DROP POLICY IF EXISTS "Service role can upload files" ON storage.objects;
CREATE POLICY "Service role can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Service role can update files" ON storage.objects;
CREATE POLICY "Service role can update files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "Service role can delete files" ON storage.objects;
CREATE POLICY "Service role can delete files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'uploads');

-- ==============================================================================
-- 6. DEFAULT SEED DATA (Admin User, Settings, Categories, Page Content)
-- ==============================================================================

-- 6.1 Default Admin User (admin@nepaliinkiit.org / AdminNik2026!)
INSERT INTO admin_users (id, email, password_hash, name, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@nepaliinkiit.org',
  '$2b$10$wE1VfR9Rz8l7Dpv9y7GZmeK8Wf8iV8P8I0I7N7V4G5M3c5f6c8p1a',
  'NIK Community Administrator',
  'superadmin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- 6.2 Default Site Settings
INSERT INTO site_settings (
  id, community_name, short_name, tagline, core_message,
  hero_headline, hero_description, footer_text, contact_email,
  contact_phone, contact_location, instagram_url, marquee_ticker_enabled,
  marquee_ticker_speed, maintenance_mode, meta_title, meta_description
) VALUES (
  'default',
  'NEPALI IN KIIT',
  'NIK',
  'Two Nations. One Community.',
  'Every Nepali in KIIT belongs here.',
  'Far from home. Never far from each other.',
  'NEPALI IN KIIT brings Nepali students together through culture, friendship, shared experiences, and a vibrant sense of home away from home at KIIT University, Bhubaneswar.',
  'NEPALI IN KIIT (NIK) is the student-led community uniting Nepali students across schools at KIIT Deemed to be University, Bhubaneswar, Odisha, India.',
  'contact@nepaliinkiit.org',
  '+91 7978 000 000',
  'Campus 6 & Campus 15, KIIT University, Bhubaneswar, Odisha, India',
  'https://www.instagram.com/nepaliinkiit/',
  true,
  35,
  false,
  'NEPALI IN KIIT — Official Student Community',
  'The premier digital home, cultural heart, and student community for Nepali students at KIIT University, Bhubaneswar, Odisha.'
)
ON CONFLICT (id) DO NOTHING;

-- 6.3 Resource Hub Categories
INSERT INTO resource_categories (name, slug, description, display_order)
VALUES
  ('Event Gallery', 'event-gallery', 'Drive folders with high-resolution event photographs', 1),
  ('Documents', 'documents', 'Official community documents, constitutions, and guides', 2),
  ('Event Materials', 'event-materials', 'Schedules, itineraries, participant lists, and booklets', 3),
  ('Cultural Resources', 'cultural-resources', 'Traditional music, lyrics, folk art, and festival guides', 4),
  ('Announcements', 'announcements', 'Official notices, circulars, and executive briefings', 5),
  ('Community Resources', 'community-resources', 'Student survival guides, study materials, and campus tips', 6),
  ('Other', 'other', 'Miscellaneous shared drives, spreadsheets, and archives', 7)
ON CONFLICT (slug) DO NOTHING;

-- 6.4 Core Page Contents (About, Values, Guidelines)
INSERT INTO page_content (key, title, subtitle, content, metadata_json)
VALUES
  (
    'about_our_story',
    'Our Story & Shared Purpose',
    'From a handful of students in 2018 to hundreds across every KIIT campus school.',
    'NEPALI IN KIIT began with a simple, enduring realization: arriving at university across international borders brings exhilaration, but also quiet moments of longing for familiar languages, festivals, and shared understanding.\n\nWhat started as informal hostel gatherings and Dashain tika celebrations has grown into an organized, supportive student collective. We guide first-year students through admissions and campus settlement, celebrate cultural milestones with pride, host acoustic gatherings, and stand by one another in times of academic or personal need.\n\nWe do not replace university structures; we enrich them by ensuring that no Nepali student at KIIT feels like a stranger.',
    '{"section": "story"}'::jsonb
  ),
  (
    'about_values',
    'What We Stand For',
    'The core principles guiding our community life.',
    '1. **Belonging Without Barriers:** Every Nepali student enrolled at KIIT is automatically part of our community. No membership fees, no prerequisites.\n2. **Cultural Preservation & Respect:** We honor our heritage—from Dashain and Tihar to cultural song and dance—while respectfully embracing our host community in Odisha.\n3. **Mutual Care & Mentorship:** Seniors guide juniors through course registrations, campus living, and career opportunities.\n4. **Student Safety & Solidarity:** In emergencies, healthcare needs, or unforeseen hardships, our student network mobilizes immediate care and coordination.',
    '{"section": "values"}'::jsonb
  ),
  (
    'community_guidelines',
    'Community Conduct & Guidelines',
    'Shared standards of respect, integrity, and safety.',
    '1. **Every Nepali Belongs:** Membership is inherent to your presence at KIIT. No fees or political affiliations are required.\n2. **Mutual Respect:** We celebrate all linguistic and cultural traditions of Nepal with zero discrimination.\n3. **Academic Integrity & Campus Respect:** We represent Nepal proudly by respecting KIIT University policies and host city traditions.\n4. **Safety & Peer Support:** When a fellow student is sick or in distress, the community rallies to assist immediately.',
    '{"section": "community"}'::jsonb
  )
ON CONFLICT (key) DO NOTHING;
