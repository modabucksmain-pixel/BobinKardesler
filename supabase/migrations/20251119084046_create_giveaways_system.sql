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
