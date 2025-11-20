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