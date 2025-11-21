-- Forum kategori ve konu hiyerarşisi
CREATE TABLE IF NOT EXISTS forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, slug)
);

CREATE TABLE IF NOT EXISTS forum_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid NOT NULL REFERENCES forum_forums(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text,
  body text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_email text,
  google_connected boolean DEFAULT false,
  solution_reply_id uuid,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  view_count integer DEFAULT 0,
  is_locked boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  body text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_email text,
  is_admin_response boolean DEFAULT false,
  is_solution boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE forum_threads
  ADD CONSTRAINT forum_threads_solution_reply_fk FOREIGN KEY (solution_reply_id) REFERENCES forum_replies(id);

-- Forum rolleri için profil tablosuna rol alanı ekle
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));

-- Yardımcı fonksiyonlar
CREATE OR REPLACE FUNCTION app_has_forum_admin_role()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION app_is_forum_moderator()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_forum_thread_defaults()
RETURNS trigger
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-z0-9]+', '-', 'g'));
  END IF;
  NEW.updated_at := now();
  NEW.last_activity_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_forum_reply_metadata()
RETURNS trigger
AS $$
BEGIN
  IF NEW.author_id IS NULL THEN
    NEW.author_id := auth.uid();
  END IF;
  NEW.is_admin_response := app_is_forum_moderator();
  NEW.updated_at := now();
  IF NEW.created_at IS NULL THEN
    NEW.created_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_forum_updated_at()
RETURNS trigger
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION mark_thread_solution(p_thread_id uuid, p_reply_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT app_has_forum_admin_role() THEN
    RAISE EXCEPTION 'Only admins can mark solutions';
  END IF;

  UPDATE forum_threads
    SET status = 'resolved', solution_reply_id = p_reply_id, last_activity_at = now(), is_locked = true
    WHERE id = p_thread_id;

  UPDATE forum_replies
    SET is_solution = (id = p_reply_id)
    WHERE thread_id = p_thread_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_thread_views(p_thread_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE forum_threads
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_thread_id;
END;
$$ LANGUAGE plpgsql;

-- Tetikleyiciler
DROP TRIGGER IF EXISTS trg_forum_thread_defaults ON forum_threads;
CREATE TRIGGER trg_forum_thread_defaults
  BEFORE INSERT ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION set_forum_thread_defaults();

DROP TRIGGER IF EXISTS trg_forum_thread_updated_at ON forum_threads;
CREATE TRIGGER trg_forum_thread_updated_at
  BEFORE UPDATE ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION update_forum_updated_at();

DROP TRIGGER IF EXISTS trg_forum_reply_metadata ON forum_replies;
CREATE TRIGGER trg_forum_reply_metadata
  BEFORE INSERT ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION set_forum_reply_metadata();

DROP TRIGGER IF EXISTS trg_forum_reply_updated_at ON forum_replies;
CREATE TRIGGER trg_forum_reply_updated_at
  BEFORE UPDATE ON forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_forum_updated_at();

-- RLS politikaları
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Kategoriler
DROP POLICY IF EXISTS "Forum categories are public" ON forum_categories;
CREATE POLICY "Forum categories are public"
  ON forum_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins manage categories" ON forum_categories;
CREATE POLICY "Only admins manage categories"
  ON forum_categories FOR ALL
  USING (app_has_forum_admin_role())
  WITH CHECK (app_has_forum_admin_role());

-- Alt forumlar
DROP POLICY IF EXISTS "Forum forums are public" ON forum_forums;
CREATE POLICY "Forum forums are public"
  ON forum_forums FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins manage forums" ON forum_forums;
CREATE POLICY "Only admins manage forums"
  ON forum_forums FOR ALL
  USING (app_has_forum_admin_role())
  WITH CHECK (app_has_forum_admin_role());

-- Başlıklar
DROP POLICY IF EXISTS "Forum threads readable" ON forum_threads;
CREATE POLICY "Forum threads readable"
  ON forum_threads FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Forum threads insert requires login" ON forum_threads;
CREATE POLICY "Forum threads insert requires login"
  ON forum_threads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Forum threads update by owner or admin" ON forum_threads;
CREATE POLICY "Forum threads update by owner or admin"
  ON forum_threads FOR UPDATE
  USING (auth.uid() = created_by OR app_has_forum_admin_role())
  WITH CHECK (auth.uid() = created_by OR app_has_forum_admin_role());

DROP POLICY IF EXISTS "Forum threads delete admin only" ON forum_threads;
CREATE POLICY "Forum threads delete admin only"
  ON forum_threads FOR DELETE
  USING (app_has_forum_admin_role());

-- Yanıtlar
DROP POLICY IF EXISTS "Forum replies readable" ON forum_replies;
CREATE POLICY "Forum replies readable"
  ON forum_replies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Forum replies insert requires login" ON forum_replies;
CREATE POLICY "Forum replies insert requires login"
  ON forum_replies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Forum replies update by owner or admin" ON forum_replies;
CREATE POLICY "Forum replies update by owner or admin"
  ON forum_replies FOR UPDATE
  USING (auth.uid() = author_id OR app_is_forum_moderator())
  WITH CHECK (auth.uid() = author_id OR app_is_forum_moderator());

DROP POLICY IF EXISTS "Forum replies delete by owner or admin" ON forum_replies;
CREATE POLICY "Forum replies delete by owner or admin"
  ON forum_replies FOR DELETE
  USING (auth.uid() = author_id OR app_is_forum_moderator());

-- Performans indeksleri
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);
CREATE INDEX IF NOT EXISTS idx_forum_forums_slug ON forum_forums(slug);
CREATE INDEX IF NOT EXISTS idx_forum_threads_forum_id ON forum_threads(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);
CREATE INDEX IF NOT EXISTS idx_forum_threads_last_activity_at ON forum_threads(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at);
