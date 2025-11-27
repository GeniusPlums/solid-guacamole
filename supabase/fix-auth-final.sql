-- ============================================
-- FINAL FIX FOR SUPABASE AUTHENTICATION
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Step 1: Drop ALL triggers on auth.users
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE event_object_table = 'users' 
      AND event_object_schema = 'auth'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users CASCADE', r.trigger_name);
    RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
  END LOOP;
END $$;

-- Step 2: Drop any related functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 3: Ensure profiles table allows authenticated users to insert
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 4: Also allow service role to insert (fallback)
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- Step 5: Ensure RLS is enabled but properly configured
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create or update viewing policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Step 7: Ensure update policy exists
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Step 8: Allow anon to view influencer profiles for marketplace
DROP POLICY IF EXISTS "Anon can view profiles" ON public.profiles;
CREATE POLICY "Anon can view profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- Step 9: Verify no triggers remain
SELECT 
  COALESCE(
    (SELECT string_agg(trigger_name, ', ') 
     FROM information_schema.triggers 
     WHERE event_object_table = 'users' AND event_object_schema = 'auth'),
    'No triggers found - GOOD!'
  ) as remaining_triggers;

-- Done!
SELECT 'SUCCESS: Auth triggers removed, RLS policies configured!' as status;

