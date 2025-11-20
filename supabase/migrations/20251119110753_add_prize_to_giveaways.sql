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
