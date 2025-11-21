-- Ensure forum category and forum tables exist with required fields
CREATE TABLE IF NOT EXISTS forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT forum_forums_category_slug_unique UNIQUE (category_id, slug)
);

ALTER TABLE forum_forums
  ADD CONSTRAINT IF NOT EXISTS forum_forums_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;

-- Maintain indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);
CREATE INDEX IF NOT EXISTS idx_forum_categories_created_at ON forum_categories(created_at);
CREATE INDEX IF NOT EXISTS idx_forum_forums_slug ON forum_forums(slug);
CREATE INDEX IF NOT EXISTS idx_forum_forums_category_slug ON forum_forums(category_id, slug);
CREATE INDEX IF NOT EXISTS idx_forum_forums_created_at ON forum_forums(created_at);

-- Add missing forum references to threads
ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS forum_id uuid;
ALTER TABLE forum_threads ADD COLUMN IF NOT EXISTS slug text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_threads' AND column_name = 'forum_id'
  ) THEN
    ALTER TABLE forum_threads
      DROP CONSTRAINT IF EXISTS forum_threads_forum_id_fkey,
      ADD CONSTRAINT forum_threads_forum_id_fkey FOREIGN KEY (forum_id) REFERENCES forum_forums(id) ON DELETE CASCADE;
    ALTER TABLE forum_threads ALTER COLUMN forum_id SET NOT NULL;
  END IF;
END;
$$;

-- Slug should remain optional but indexed for filtering
CREATE INDEX IF NOT EXISTS idx_forum_threads_forum_id ON forum_threads(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);

-- RLS for newly created tables (idempotent)
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_forums ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Forum categories are public" ON forum_categories;
CREATE POLICY "Forum categories are public"
  ON forum_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins manage categories" ON forum_categories;
CREATE POLICY "Only admins manage categories"
  ON forum_categories FOR ALL
  USING (app_has_forum_admin_role())
  WITH CHECK (app_has_forum_admin_role());

DROP POLICY IF EXISTS "Forum forums are public" ON forum_forums;
CREATE POLICY "Forum forums are public"
  ON forum_forums FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins manage forums" ON forum_forums;
CREATE POLICY "Only admins manage forums"
  ON forum_forums FOR ALL
  USING (app_has_forum_admin_role())
  WITH CHECK (app_has_forum_admin_role());
