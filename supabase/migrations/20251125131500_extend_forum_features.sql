/*
  # Forum etkileşimlerini genişlet
  - Beğeni, bildirim ve raporlama tabloları
  - SEO dostu slug indeksleri
  - Basit rate limit için helper view
*/

CREATE TABLE IF NOT EXISTS forum_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reply_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, reply_id)
);

CREATE TABLE IF NOT EXISTS forum_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reply_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  reason text,
  status text DEFAULT 'open' CHECK (status IN ('open','reviewing','closed')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Performans indeksleri
CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);
CREATE INDEX IF NOT EXISTS idx_forum_forums_slug ON forum_forums(slug);

-- Rate limit için son gönderim zamanını hesaplayan view
CREATE OR REPLACE VIEW forum_user_last_post AS
SELECT author_id AS user_id, max(created_at) AS last_post_at
FROM forum_replies
GROUP BY author_id;
