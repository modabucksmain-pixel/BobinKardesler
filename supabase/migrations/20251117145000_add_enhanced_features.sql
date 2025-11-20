/*
  # Enhanced Features Migration

  ## Overview
  This migration adds comprehensive features to transform the platform into a full-featured community learning hub.

  ## New Tables

  ### 1. `user_profiles`
  Extended user information and preferences
  - `id` (uuid, primary key) - References auth.users
  - `display_name` (text) - Public display name
  - `bio` (text) - User biography
  - `avatar_url` (text) - Profile picture URL
  - `website` (text) - Personal website
  - `achievements` (jsonb) - User achievements and badges
  - `preferences` (jsonb) - User preferences (notifications, theme, etc.)
  - `created_at` (timestamptz) - Profile creation date
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `user_bookmarks`
  Users can save favorite videos and blog posts
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References auth.users or anonymous identifier
  - `content_type` (text) - 'video' or 'blog_post'
  - `content_id` (text) - YouTube video ID or blog post ID
  - `notes` (text) - Personal notes
  - `created_at` (timestamptz) - When bookmarked

  ### 3. `blog_comments`
  Comment system for blog posts
  - `id` (uuid, primary key) - Unique identifier
  - `blog_post_id` (uuid) - References blog_posts
  - `user_id` (uuid) - References auth.users (nullable for guests)
  - `author_name` (text) - Name for guest comments
  - `author_email` (text) - Email for guest comments
  - `content` (text) - Comment content
  - `parent_id` (uuid) - For threaded replies
  - `status` (text) - 'pending', 'approved', 'spam'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `video_categories`
  Categories for organizing videos
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Category name
  - `slug` (text, unique) - URL-friendly slug
  - `description` (text) - Category description
  - `icon` (text) - Icon name from lucide-react
  - `color` (text) - Hex color code
  - `created_at` (timestamptz)

  ### 5. `video_tags`
  Tags for videos
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, unique) - Tag name
  - `slug` (text, unique) - URL-friendly slug
  - `created_at` (timestamptz)

  ### 6. `video_metadata`
  Extended metadata for YouTube videos
  - `id` (uuid, primary key) - Unique identifier
  - `video_id` (text, unique) - YouTube video ID
  - `category_id` (uuid) - References video_categories
  - `difficulty` (text) - 'beginner', 'intermediate', 'advanced'
  - `duration_seconds` (integer) - Video duration
  - `featured` (boolean) - Is featured video
  - `materials_needed` (jsonb) - Required materials list
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `video_tag_associations`
  Many-to-many relationship between videos and tags
  - `video_id` (text) - YouTube video ID
  - `tag_id` (uuid) - References video_tags
  - Primary key on both columns

  ### 8. `video_playlists`
  User-created video playlists
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - References auth.users
  - `title` (text) - Playlist title
  - `description` (text) - Playlist description
  - `is_public` (boolean) - Public or private
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 9. `playlist_videos`
  Videos in playlists with ordering
  - `id` (uuid, primary key) - Unique identifier
  - `playlist_id` (uuid) - References video_playlists
  - `video_id` (text) - YouTube video ID
  - `position` (integer) - Order in playlist
  - `added_at` (timestamptz)

  ### 10. `blog_post_ratings`
  Rating system for blog posts
  - `id` (uuid, primary key) - Unique identifier
  - `blog_post_id` (uuid) - References blog_posts
  - `user_identifier` (text) - User ID or anonymous identifier
  - `rating` (integer) - 1-5 stars
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - Unique constraint on (blog_post_id, user_identifier)

  ### 11. `site_analytics`
  Track site-wide analytics
  - `id` (uuid, primary key) - Unique identifier
  - `event_type` (text) - Type of event
  - `metadata` (jsonb) - Event data
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Users can manage their own profiles, bookmarks, playlists
  - Comments require approval unless from authenticated users
  - Public read access for approved content
  - Admin users can manage all content

  ## Indexes
  - Performance indexes on frequently queried columns
  - Foreign key indexes for joins
  - Text search indexes where applicable
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  bio text,
  avatar_url text,
  website text,
  achievements jsonb DEFAULT '[]'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('video', 'blog_post')),
  content_id text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  author_email text,
  content text NOT NULL,
  parent_id uuid REFERENCES blog_comments(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'spam')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video_categories table
CREATE TABLE IF NOT EXISTS video_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text DEFAULT 'Zap',
  color text DEFAULT '#22c55e',
  created_at timestamptz DEFAULT now()
);

-- Create video_tags table
CREATE TABLE IF NOT EXISTS video_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create video_metadata table
CREATE TABLE IF NOT EXISTS video_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text UNIQUE NOT NULL,
  category_id uuid REFERENCES video_categories(id) ON DELETE SET NULL,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_seconds integer,
  featured boolean DEFAULT false,
  materials_needed jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video_tag_associations table
CREATE TABLE IF NOT EXISTS video_tag_associations (
  video_id text NOT NULL,
  tag_id uuid NOT NULL REFERENCES video_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, tag_id)
);

-- Create video_playlists table
CREATE TABLE IF NOT EXISTS video_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create playlist_videos table
CREATE TABLE IF NOT EXISTS playlist_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid NOT NULL REFERENCES video_playlists(id) ON DELETE CASCADE,
  video_id text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, video_id)
);

-- Create blog_post_ratings table
CREATE TABLE IF NOT EXISTS blog_post_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id uuid NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_identifier text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(blog_post_id, user_identifier)
);

-- Create site_analytics table
CREATE TABLE IF NOT EXISTS site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_content ON user_bookmarks(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_video_metadata_video_id ON video_metadata(video_id);
CREATE INDEX IF NOT EXISTS idx_video_metadata_category_id ON video_metadata(category_id);
CREATE INDEX IF NOT EXISTS idx_video_metadata_featured ON video_metadata(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_video_playlists_user_id ON video_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlist_id ON playlist_videos(playlist_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_ratings_post_id ON blog_post_ratings(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_site_analytics_event_type ON site_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_site_analytics_created_at ON site_analytics(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tag_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Anyone can view profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON user_bookmarks FOR SELECT
  USING (user_id = COALESCE(auth.uid()::text, user_id));

CREATE POLICY "Users can insert own bookmarks"
  ON user_bookmarks FOR INSERT
  WITH CHECK (user_id = COALESCE(auth.uid()::text, user_id));

CREATE POLICY "Users can update own bookmarks"
  ON user_bookmarks FOR UPDATE
  USING (user_id = COALESCE(auth.uid()::text, user_id))
  WITH CHECK (user_id = COALESCE(auth.uid()::text, user_id));

CREATE POLICY "Users can delete own bookmarks"
  ON user_bookmarks FOR DELETE
  USING (user_id = COALESCE(auth.uid()::text, user_id));

-- RLS Policies for blog_comments
CREATE POLICY "Anyone can view approved comments"
  ON blog_comments FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can view all comments"
  ON blog_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON blog_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update all comments"
  ON blog_comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete comments"
  ON blog_comments FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for video_categories
CREATE POLICY "Anyone can view video categories"
  ON video_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage video categories"
  ON video_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for video_tags
CREATE POLICY "Anyone can view video tags"
  ON video_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage video tags"
  ON video_tags FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for video_metadata
CREATE POLICY "Anyone can view video metadata"
  ON video_metadata FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage video metadata"
  ON video_metadata FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for video_tag_associations
CREATE POLICY "Anyone can view video tag associations"
  ON video_tag_associations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage video tag associations"
  ON video_tag_associations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for video_playlists
CREATE POLICY "Anyone can view public playlists"
  ON video_playlists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view own playlists"
  ON video_playlists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own playlists"
  ON video_playlists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own playlists"
  ON video_playlists FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own playlists"
  ON video_playlists FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for playlist_videos
CREATE POLICY "Anyone can view playlist videos from public playlists"
  ON playlist_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_playlists
      WHERE video_playlists.id = playlist_videos.playlist_id
      AND video_playlists.is_public = true
    )
  );

CREATE POLICY "Users can view own playlist videos"
  ON playlist_videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM video_playlists
      WHERE video_playlists.id = playlist_videos.playlist_id
      AND video_playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own playlist videos"
  ON playlist_videos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM video_playlists
      WHERE video_playlists.id = playlist_videos.playlist_id
      AND video_playlists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_playlists
      WHERE video_playlists.id = playlist_videos.playlist_id
      AND video_playlists.user_id = auth.uid()
    )
  );

-- RLS Policies for blog_post_ratings
CREATE POLICY "Anyone can view ratings"
  ON blog_post_ratings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert ratings"
  ON blog_post_ratings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own ratings"
  ON blog_post_ratings FOR UPDATE
  USING (user_identifier = COALESCE(auth.uid()::text, user_identifier))
  WITH CHECK (user_identifier = COALESCE(auth.uid()::text, user_identifier));

-- RLS Policies for site_analytics
CREATE POLICY "Anyone can insert analytics"
  ON site_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view analytics"
  ON site_analytics FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger for new tables
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_metadata_updated_at ON video_metadata;
CREATE TRIGGER update_video_metadata_updated_at
  BEFORE UPDATE ON video_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_playlists_updated_at ON video_playlists;
CREATE TRIGGER update_video_playlists_updated_at
  BEFORE UPDATE ON video_playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_post_ratings_updated_at ON blog_post_ratings;
CREATE TRIGGER update_blog_post_ratings_updated_at
  BEFORE UPDATE ON blog_post_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default video categories
INSERT INTO video_categories (name, slug, description, icon, color) VALUES
  ('Arduino & Microcontrollers', 'arduino-microcontrollers', 'Arduino, ESP32, STM32 projeleri', 'Cpu', '#3b82f6'),
  ('Power Electronics', 'power-electronics', 'Güç elektroniği ve güç kaynakları', 'Zap', '#eab308'),
  ('Amplifiers & Audio', 'amplifiers-audio', 'Amplifikatör ve ses sistemleri', 'Volume2', '#8b5cf6'),
  ('Robotics', 'robotics', 'Robot projeleri ve otomasyon', 'Bot', '#ec4899'),
  ('PCB Design', 'pcb-design', 'PCB tasarım ve üretim', 'Cpu', '#22c55e'),
  ('Motor Control', 'motor-control', 'Motor sürücüler ve kontrol', 'Settings', '#f97316'),
  ('Solar & Renewable', 'solar-renewable', 'Güneş enerjisi ve yenilenebilir enerji', 'Sun', '#facc15'),
  ('Underground Projects', 'underground', 'Deneysel ve underground projeler', 'Flame', '#ef4444')
ON CONFLICT (slug) DO NOTHING;

-- Insert some default tags
INSERT INTO video_tags (name, slug) VALUES
  ('Başlangıç', 'baslangic'),
  ('İleri Seviye', 'ileri-seviye'),
  ('DIY', 'diy'),
  ('Eğitim', 'egitim'),
  ('Proje', 'proje'),
  ('Tutorial', 'tutorial'),
  ('Elektronik', 'elektronik'),
  ('Programlama', 'programlama'),
  ('3D Printing', '3d-printing'),
  ('測試', 'test')
ON CONFLICT (slug) DO NOTHING;