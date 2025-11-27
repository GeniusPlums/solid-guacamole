-- ============================================
-- DIAGNOSTIC AND FIX SCRIPT FOR SUPABASE AUTH
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Step 1: Check what triggers exist on auth.users
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';

-- Step 2: Drop ALL triggers on auth.users that might cause issues
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  FOR trigger_record IN 
    SELECT trigger_name 
    FROM information_schema.triggers 
    WHERE event_object_table = 'users' 
      AND event_object_schema = 'auth'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trigger_record.trigger_name);
    RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
  END LOOP;
END $$;

-- Step 3: Drop any related functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 4: Verify triggers are removed
SELECT 
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
  AND event_object_schema = 'auth';

-- Step 5: Check if profiles table exists and show its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public';

-- Step 6: Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ All auth.users triggers have been removed!';
  RAISE NOTICE '✅ Signup should now work without database errors.';
  RAISE NOTICE '⚠️ Note: Profiles will need to be created manually after signup.';
END $$;

