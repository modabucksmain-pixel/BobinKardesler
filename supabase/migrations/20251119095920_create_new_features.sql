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