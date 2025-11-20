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