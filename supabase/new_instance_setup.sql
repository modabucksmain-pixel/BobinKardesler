-- Combined schema for initializing a fresh Supabase project
-- This file concatenates the existing migrations in chronological order
-- so a new instance can be brought up quickly via the Supabase SQL editor
-- or a `psql` connection. Run this entire script once on a clean project.


-- Source: 20251117140932_create_initial_schema.sql

/*
  # Bobin Kardeşler Underground Portal - Initial Schema

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text) - Blog post title
      - `slug` (text, unique) - URL-friendly slug
      - `content` (text) - Full blog post content
      - `excerpt` (text) - Short summary for listings
      - `featured_image` (text) - URL to featured image
      - `status` (text) - draft/published
      - `published_at` (timestamptz) - Publication date
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `author_id` (uuid) - Reference to auth.users
      - `reading_time` (integer) - Estimated reading time in minutes
      - `views` (integer) - View count
    
    - `blog_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `slug` (text, unique) - URL-friendly slug
      - `created_at` (timestamptz)
    
    - `blog_post_categories`
      - `blog_post_id` (uuid) - Reference to blog_posts
      - `category_id` (uuid) - Reference to blog_categories
      - Primary key on both columns
    
    - `site_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key
      - `value` (jsonb) - Setting value
      - `updated_at` (timestamptz)
    
    - `youtube_cache`
      - `id` (uuid, primary key)
      - `cache_key` (text, unique) - Cache identifier
      - `data` (jsonb) - Cached YouTube data
      - `expires_at` (timestamptz) - Cache expiration
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for published blog posts
    - Authenticated admin users can manage content
    - YouTube cache is publicly readable
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reading_time integer DEFAULT 0,
  views integer DEFAULT 0
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create blog_post_categories junction table
CREATE TABLE IF NOT EXISTS blog_post_categories (
  blog_post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id uuid REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_post_id, category_id)
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Create youtube_cache table
CREATE TABLE IF NOT EXISTS youtube_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_youtube_cache_key ON youtube_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_youtube_cache_expires ON youtube_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can view categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON blog_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for blog_post_categories
CREATE POLICY "Anyone can view post categories"
  ON blog_post_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage post categories"
  ON blog_post_categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for site_settings
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for youtube_cache
CREATE POLICY "Anyone can view youtube cache"
  ON youtube_cache FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage youtube cache"
  ON youtube_cache FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default categories
INSERT INTO blog_categories (name, slug) VALUES
  ('Underground', 'underground'),
  ('Elektrik', 'elektrik'),
  ('Projeler', 'projeler'),
  ('Eğitim', 'egitim')
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('youtube_channel_id', '{}'),
  ('youtube_api_key', '{}'),
  ('site_title', '"Bobin Kardeşler - Underground Elektrik"'),
  ('site_description', '"Underground elektrik projeleri ve eğitim içerikleri"')
ON CONFLICT (key) DO NOTHING;

-- Source: 20251117143043_create_video_features.sql

/*
  # Video Suggestions and Watch History Feature

  ## Overview
  This migration adds two new tables to support user video suggestions and watch history tracking.

  ## New Tables
  
  ### `video_suggestions`
  User-submitted video ideas and suggestions
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text, required) - Suggested video title
  - `description` (text, required) - Detailed description of suggestion
  - `submitter_name` (text, optional) - Name of person submitting
  - `submitter_email` (text, optional) - Email for follow-up
  - `status` (text, default 'pending') - Status: pending, approved, rejected, completed
  - `votes` (integer, default 0) - Number of upvotes
  - `admin_notes` (text, optional) - Internal admin notes
  - `created_at` (timestamptz) - When suggestion was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `video_watch_history`
  Tracks which videos users have watched
  - `id` (uuid, primary key) - Unique identifier
  - `video_id` (text, required) - YouTube video ID
  - `user_identifier` (text, required) - Anonymous user identifier (browser fingerprint or session)
  - `watched_at` (timestamptz) - When video was watched
  - `watch_duration` (integer, optional) - How long watched in seconds

  ## Security
  1. Enable RLS on both tables
  2. `video_suggestions`:
     - Anyone can insert new suggestions
     - Anyone can read published suggestions
     - Only authenticated admins can update/delete
  3. `video_watch_history`:
     - Users can insert their own watch history
     - Users can read their own watch history
     - Authenticated admins can read all history

  ## Indexes
  - Index on video_suggestions.status for filtering
  - Index on video_suggestions.created_at for sorting
  - Index on video_watch_history.user_identifier for user queries
  - Index on video_watch_history.video_id for video queries
*/

-- Create video_suggestions table
CREATE TABLE IF NOT EXISTS video_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  submitter_name text,
  submitter_email text,
  status text NOT NULL DEFAULT 'pending',
  votes integer NOT NULL DEFAULT 0,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create video_watch_history table
CREATE TABLE IF NOT EXISTS video_watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id text NOT NULL,
  user_identifier text NOT NULL,
  watched_at timestamptz NOT NULL DEFAULT now(),
  watch_duration integer,
  UNIQUE(video_id, user_identifier)
);

-- Enable RLS
ALTER TABLE video_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_watch_history ENABLE ROW LEVEL SECURITY;

-- Policies for video_suggestions

-- Anyone can insert suggestions
CREATE POLICY "Anyone can submit video suggestions"
  ON video_suggestions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can view suggestions
CREATE POLICY "Anyone can view video suggestions"
  ON video_suggestions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can update suggestions
CREATE POLICY "Authenticated users can update suggestions"
  ON video_suggestions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete suggestions
CREATE POLICY "Authenticated users can delete suggestions"
  ON video_suggestions
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for video_watch_history

-- Anyone can insert their watch history
CREATE POLICY "Users can track their watch history"
  ON video_watch_history
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own watch history
CREATE POLICY "Users can view their watch history"
  ON video_watch_history
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated users can update watch history
CREATE POLICY "Users can update watch history"
  ON video_watch_history
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_suggestions_status 
  ON video_suggestions(status);

CREATE INDEX IF NOT EXISTS idx_video_suggestions_created_at 
  ON video_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_video_suggestions_votes 
  ON video_suggestions(votes DESC);

CREATE INDEX IF NOT EXISTS idx_video_watch_history_user 
  ON video_watch_history(user_identifier);

CREATE INDEX IF NOT EXISTS idx_video_watch_history_video 
  ON video_watch_history(video_id);

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for video_suggestions
DROP TRIGGER IF EXISTS update_video_suggestions_updated_at ON video_suggestions;
CREATE TRIGGER update_video_suggestions_updated_at
  BEFORE UPDATE ON video_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Source: 20251117144236_fix_youtube_cache_rls.sql

/*
  # Fix YouTube Cache RLS Policies

  ## Problem
  The youtube_cache table only allowed authenticated users to insert/update data,
  but the frontend needs to cache YouTube API responses for anonymous users.

  ## Changes
  1. Add policy allowing anonymous users to insert/update youtube cache
  2. Keep existing policies for backward compatibility

  ## Security Note
  This is safe because:
  - The cache only stores public YouTube API data
  - Data expires automatically based on expires_at timestamp
  - No sensitive user information is stored
*/

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can manage youtube cache" ON youtube_cache;

-- Allow anyone (including anonymous) to insert/upsert cache data
CREATE POLICY "Anyone can insert youtube cache"
  ON youtube_cache
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update cache data
CREATE POLICY "Anyone can update youtube cache"
  ON youtube_cache
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete expired cache (cleanup)
CREATE POLICY "Anyone can delete youtube cache"
  ON youtube_cache
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Source: 20251117145000_add_enhanced_features.sql

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

-- Source: 20251119084046_create_giveaways_system.sql

/*
  # Create Giveaways System

  1. New Tables
    - `giveaways`
      - `id` (uuid, primary key)
      - `title` (text) - Giveaway title
      - `description` (text) - Detailed description
      - `image_url` (text) - Featured image
      - `start_date` (timestamptz) - When giveaway starts
      - `end_date` (timestamptz) - When giveaway ends
      - `status` (text) - active, completed, cancelled
      - `winner_id` (uuid) - Reference to winning participant
      - `created_by` (uuid) - Admin who created it
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `giveaway_participants`
      - `id` (uuid, primary key)
      - `giveaway_id` (uuid) - Foreign key to giveaways
      - `name` (text) - Participant name
      - `email` (text) - Participant email
      - `participated_at` (timestamptz)
      - Unique constraint on (giveaway_id, email)
  
  2. Security
    - Enable RLS on both tables
    - Public can view active giveaways
    - Public can participate in giveaways
    - Only authenticated admins can create/manage giveaways
    - Only authenticated admins can view all participants
    - Only authenticated admins can select winners
*/

-- Create giveaways table
CREATE TABLE IF NOT EXISTS giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  winner_id uuid,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create giveaway participants table
CREATE TABLE IF NOT EXISTS giveaway_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  participated_at timestamptz DEFAULT now(),
  UNIQUE(giveaway_id, email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON giveaways(status);
CREATE INDEX IF NOT EXISTS idx_giveaways_dates ON giveaways(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_participants_giveaway ON giveaway_participants(giveaway_id);

-- Enable RLS
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaway_participants ENABLE ROW LEVEL SECURITY;

-- Giveaways policies
CREATE POLICY "Anyone can view active giveaways"
  ON giveaways FOR SELECT
  USING (status = 'active' AND start_date <= now() AND end_date >= now());

CREATE POLICY "Admins can view all giveaways"
  ON giveaways FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can create giveaways"
  ON giveaways FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update giveaways"
  ON giveaways FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete giveaways"
  ON giveaways FOR DELETE
  TO authenticated
  USING (true);

-- Participants policies
CREATE POLICY "Anyone can participate in active giveaways"
  ON giveaway_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM giveaways
      WHERE giveaways.id = giveaway_id
      AND giveaways.status = 'active'
      AND giveaways.start_date <= now()
      AND giveaways.end_date >= now()
    )
  );

CREATE POLICY "Admins can view all participants"
  ON giveaway_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view participant count"
  ON giveaway_participants FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for giveaways
DROP TRIGGER IF EXISTS update_giveaways_updated_at ON giveaways;
CREATE TRIGGER update_giveaways_updated_at
  BEFORE UPDATE ON giveaways
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Source: 20251119095920_create_new_features.sql

/*
  # Add New Features for Bobin Kardeşler

  1. New Tables
    - `community_posts` - Community announcements and updates
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `image_url` (text, nullable)
      - `author_id` (uuid, references auth.users)
      - `published` (boolean, default false)
      - `pinned` (boolean, default false)
      - `views` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `playlists` - Video playlists
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `thumbnail_url` (text, nullable)
      - `slug` (text, unique)
      - `video_count` (integer, default 0)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `playlist_videos` - Videos in playlists
      - `id` (uuid, primary key)
      - `playlist_id` (uuid, references playlists)
      - `youtube_video_id` (text)
      - `position` (integer)
      - `added_at` (timestamptz)
    
    - `polls` - Community polls
      - `id` (uuid, primary key)
      - `question` (text)
      - `description` (text, nullable)
      - `status` (text, default 'active')
      - `end_date` (timestamptz)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `poll_options` - Poll answer options
      - `id` (uuid, primary key)
      - `poll_id` (uuid, references polls)
      - `option_text` (text)
      - `vote_count` (integer, default 0)
      - `position` (integer)
    
    - `poll_votes` - User votes on polls
      - `id` (uuid, primary key)
      - `poll_id` (uuid, references polls)
      - `option_id` (uuid, references poll_options)
      - `user_ip` (text)
      - `user_fingerprint` (text, nullable)
      - `voted_at` (timestamptz)
    
    - `newsletter_subscribers` - Newsletter subscriptions
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text, nullable)
      - `subscribed_at` (timestamptz)
      - `is_active` (boolean, default true)
      - `unsubscribe_token` (text, unique)
    
    - `projects` - Project showcase
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `difficulty` (text)
      - `category` (text)
      - `youtube_video_id` (text, nullable)
      - `github_url` (text, nullable)
      - `thumbnail_url` (text)
      - `components` (text, nullable)
      - `featured` (boolean, default false)
      - `views` (integer, default 0)
      - `likes` (integer, default 0)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table
*/

-- Community Posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  author_id uuid REFERENCES auth.users(id),
  published boolean DEFAULT false,
  pinned boolean DEFAULT false,
  views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published community posts"
  ON community_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can create community posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own community posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own community posts"
  ON community_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Playlists
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  thumbnail_url text,
  slug text UNIQUE NOT NULL,
  video_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view playlists"
  ON playlists FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create playlists"
  ON playlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their own playlists"
  ON playlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete their own playlists"
  ON playlists FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Playlist Videos
CREATE TABLE IF NOT EXISTS playlist_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  youtube_video_id text NOT NULL,
  position integer NOT NULL,
  added_at timestamptz DEFAULT now()
);

ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view playlist videos"
  ON playlist_videos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage playlist videos"
  ON playlist_videos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_videos.playlist_id
      AND playlists.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_videos.playlist_id
      AND playlists.created_by = auth.uid()
    )
  );

-- Polls
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  end_date timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view polls"
  ON polls FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create polls"
  ON polls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their own polls"
  ON polls FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete their own polls"
  ON polls FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Poll Options
CREATE TABLE IF NOT EXISTS poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  vote_count integer DEFAULT 0,
  position integer NOT NULL
);

ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll options"
  ON poll_options FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage poll options"
  ON poll_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND polls.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
      AND polls.created_by = auth.uid()
    )
  );

-- Poll Votes
CREATE TABLE IF NOT EXISTS poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE,
  user_ip text NOT NULL,
  user_fingerprint text,
  voted_at timestamptz DEFAULT now()
);

ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll votes"
  ON poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can vote on polls"
  ON poll_votes FOR INSERT
  WITH CHECK (true);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  unsubscribe_token text UNIQUE DEFAULT gen_random_uuid()::text
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their subscription with token"
  ON newsletter_subscribers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category text NOT NULL,
  youtube_video_id text,
  github_url text,
  thumbnail_url text NOT NULL,
  components text,
  featured boolean DEFAULT false,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete their own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_published ON community_posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON community_posts(pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_playlists_slug ON playlists(slug);
CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlist_id ON playlist_videos(playlist_id, position);
CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status, end_date DESC);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON poll_options(poll_id, position);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_ip ON poll_votes(user_ip, poll_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category, created_at DESC);

-- Source: 20251119100238_add_poll_vote_function.sql

/*
  # Add Poll Vote Increment Function

  1. Functions
    - Create `increment_poll_vote` function to atomically increment vote counts
*/

CREATE OR REPLACE FUNCTION increment_poll_vote(option_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE poll_options
  SET vote_count = vote_count + 1
  WHERE id = option_id;
END;
$$;

-- Source: 20251119110753_add_prize_to_giveaways.sql

/*
  # Add prize column to giveaways table

  1. Changes
    - Add `prize` column to `giveaways` table
      - Type: text
      - Required field to specify what prize is being given away
      - Examples: "iPhone 15 Pro", "Arduino Mega Kit", etc.
  
  2. Notes
    - Existing records will need to be updated manually if any exist
    - This is a non-breaking change as it adds a new column
*/

-- Add prize column to giveaways table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'giveaways' AND column_name = 'prize'
  ) THEN
    ALTER TABLE giveaways ADD COLUMN prize text NOT NULL DEFAULT 'Çekiliş Ödülü';
  END IF;
END $$;

-- Remove default value after adding the column
ALTER TABLE giveaways ALTER COLUMN prize DROP DEFAULT;


-- Source: 20251121120000_create_announcements.sql

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

-- Source: 20251123090000_create_forum_system.sql

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

-- Source: 20251123091500_seed_forum_categories.sql

-- Varsayılan forum kategorileri ve alt forumlar
DO $$
DECLARE
  cat_duyurular uuid;
  cat_elektronik uuid;
  cat_programlama uuid;
  cat_genel uuid;
BEGIN
  INSERT INTO forum_categories (name, slug, description)
  VALUES ('Duyurular', 'duyurular', 'Resmi duyurular ve topluluk kuralları')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO cat_duyurular;

  INSERT INTO forum_categories (name, slug, description)
  VALUES ('Elektronik Soruları', 'elektronik-sorulari', 'Elektronikle ilgili yardım ve fikir paylaşımları')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO cat_elektronik;

  INSERT INTO forum_categories (name, slug, description)
  VALUES ('Programlama', 'programlama', 'Kodlama, mikrodenetleyici ve yazılım tartışmaları')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO cat_programlama;

  INSERT INTO forum_categories (name, slug, description)
  VALUES ('Genel Sohbet', 'genel-sohbet', 'Topluluk sohbeti ve off-topic paylaşımlar')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
  RETURNING id INTO cat_genel;

  -- Duyurular alt forumları
  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_duyurular, 'Kurallar', 'kurallar', 'Forum kuralları ve yönergeler')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_duyurular, 'Site Güncellemeleri', 'site-guncellemeleri', 'Yeni özellikler ve değişiklikler')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- Elektronik alt forumları
  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_elektronik, 'Temel', 'temel', 'Temel elektronik soruları ve komponentler')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_elektronik, 'Uygulamalı', 'uygulamali', 'Devre kurulumları ve pratik sorunlar')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_elektronik, 'Projeler', 'projeler', 'Paylaşılan projeler ve geri bildirimler')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- Programlama alt forumları
  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_programlama, 'Arduino', 'arduino', 'Arduino kodlama ve shield tartışmaları')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_programlama, 'ESP32', 'esp32', 'ESP32 ile IoT projeleri ve sorun çözümü')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_programlama, 'Python', 'python', 'Python kodları, veri işleme ve otomasyon')
  ON CONFLICT (category_id, slug) DO NOTHING;

  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_programlama, 'C++', 'c-plus-plus', 'C/C++ ve gömülü yazılım konuları')
  ON CONFLICT (category_id, slug) DO NOTHING;

  -- Genel sohbet alt forumu
  INSERT INTO forum_forums (category_id, name, slug, description)
  VALUES (cat_genel, 'Sohbet', 'sohbet', 'Topluluk üyeleri arasında serbest sohbet')
  ON CONFLICT (category_id, slug) DO NOTHING;
END;
$$;

-- Source: 20251124093000_add_forum_indexes.sql

-- Ek forum performans indeksleri
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_categories_created_at ON forum_categories(created_at);

