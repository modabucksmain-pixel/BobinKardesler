/*
  # Add announcements table for site-wide updates

  This migration introduces a dedicated announcements table to power the
  public "Duyurular" feed and admin management tools.
*/

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  content text NOT NULL,
  publish_at timestamptz DEFAULT now(),
  published boolean DEFAULT false,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Published announcements are visible to everyone once their publish time is reached
CREATE POLICY "Anyone can view published announcements"
  ON announcements FOR SELECT
  USING (published = true AND publish_at <= now());

-- Authenticated admins can create announcements
CREATE POLICY "Authenticated users can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated admins can update announcements
CREATE POLICY "Authenticated users can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated admins can delete announcements
CREATE POLICY "Authenticated users can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');
