-- Add role column to user_profiles and enforce admin-controlled elevation
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin'));

-- Helper function for admin checks
CREATE OR REPLACE FUNCTION app_is_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql;

-- Refresh user profile policies to prevent unauthorized role escalation
DROP POLICY IF EXISTS "Admins can manage profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON user_profiles;

CREATE POLICY "Anyone can view profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id AND (role = 'user' OR app_is_admin()))
  WITH CHECK (auth.uid() = id AND (role = 'user' OR app_is_admin()));

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND (role = 'user' OR app_is_admin()));

CREATE POLICY "Admins can manage profiles"
  ON user_profiles FOR ALL
  TO authenticated
  USING (app_is_admin())
  WITH CHECK (app_is_admin());

-- Seed admin user for bam@gmail.com
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  INSERT INTO auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role, encrypted_password,
                          email_confirmed_at, last_sign_in_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'bam@gmail.com',
    '{}'::jsonb,
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    'authenticated',
    'authenticated',
    crypt('ChangeMeNow123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
    SET email = EXCLUDED.email
  RETURNING id INTO v_user_id;

  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'bam@gmail.com';
  END IF;

  INSERT INTO auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_user_id,
    'email',
    'bam@gmail.com',
    jsonb_build_object('sub', v_user_id::text, 'email', 'bam@gmail.com'),
    now(),
    now(),
    now()
  )
  ON CONFLICT (provider, provider_id) DO UPDATE
    SET last_sign_in_at = EXCLUDED.last_sign_in_at,
        identity_data   = EXCLUDED.identity_data,
        updated_at      = now();

  INSERT INTO public.user_profiles (id, display_name, role, created_at, updated_at)
  VALUES (v_user_id, 'Bam', 'admin', now(), now())
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin',
        display_name = EXCLUDED.display_name,
        updated_at = now();
END;
$$;
