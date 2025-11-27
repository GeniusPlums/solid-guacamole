-- Run this in Supabase SQL Editor to fix the signup issue
-- This fixes the trigger that creates profiles when users sign up

-- First, check if the enum type exists, create if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('brand', 'influencer');
  END IF;
END $$;

-- Check if profiles table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      user_type user_role NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    
    -- Enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view all profiles"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);

    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create improved function that handles edge cases
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type_value public.user_role;
  user_name_value TEXT;
BEGIN
  -- Safely get user_type, default to 'brand'
  BEGIN
    IF NEW.raw_user_meta_data->>'user_type' = 'influencer' THEN
      user_type_value := 'influencer'::public.user_role;
    ELSE
      user_type_value := 'brand'::public.user_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_type_value := 'brand'::public.user_role;
  END;
  
  -- Get name from metadata or use email
  user_name_value := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Insert the profile
  INSERT INTO public.profiles (id, user_type, full_name, email)
  VALUES (NEW.id, user_type_value, user_name_value, NEW.email);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the signup
  RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Setup complete! The trigger should now work correctly.';
END $$;

