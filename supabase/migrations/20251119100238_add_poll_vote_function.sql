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