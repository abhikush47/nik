-- Migration: 20261021000000_resources_schema.sql
-- NIK Google Drive Resources Hub Schema

-- 1. RESOURCE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initial default categories
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

-- 2. RESOURCES TABLE
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
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_featured ON resources(featured);
CREATE INDEX IF NOT EXISTS idx_resources_display_order ON resources(display_order);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

-- 4. UPDATED_AT TRIGGER
DROP TRIGGER IF EXISTS trigger_resources_updated_at ON resources;
CREATE TRIGGER trigger_resources_updated_at
BEFORE UPDATE ON resources
FOR EACH ROW EXECUTE FUNCTION set_updated_at_column();

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Public can view resource categories
DROP POLICY IF EXISTS "Public can view resource categories" ON resource_categories;
CREATE POLICY "Public can view resource categories"
  ON resource_categories FOR SELECT
  USING (true);

-- Public can only view published resources
DROP POLICY IF EXISTS "Public can view published resources" ON resources;
CREATE POLICY "Public can view published resources"
  ON resources FOR SELECT
  USING (status = 'published');

-- Admins full access
DROP POLICY IF EXISTS "Admins have full access to resource_categories" ON resource_categories;
CREATE POLICY "Admins have full access to resource_categories"
  ON resource_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins have full access to resources" ON resources;
CREATE POLICY "Admins have full access to resources"
  ON resources FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
