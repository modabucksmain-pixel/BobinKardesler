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