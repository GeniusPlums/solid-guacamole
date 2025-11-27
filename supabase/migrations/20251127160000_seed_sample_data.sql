-- Seed sample influencer profiles for demonstration
-- This migration modifies the schema to allow demo profiles and seeds sample data

-- Step 1: Make user_id nullable in influencer_profiles for demo data
ALTER TABLE public.influencer_profiles
  ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Drop the foreign key constraint temporarily for demo profiles
ALTER TABLE public.influencer_profiles
  DROP CONSTRAINT IF EXISTS influencer_profiles_user_id_fkey;

-- Step 3: Re-add the constraint but allow NULL values (demo profiles won't have user_id)
ALTER TABLE public.influencer_profiles
  ADD CONSTRAINT influencer_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 4: Update RLS to allow public read access to influencer profiles (for marketplace)
DROP POLICY IF EXISTS "Anyone can view influencer profiles" ON public.influencer_profiles;
CREATE POLICY "Public can view influencer profiles"
  ON public.influencer_profiles FOR SELECT
  USING (true);

-- Step 5: Insert sample influencer profiles (without user_id - these are demo profiles)
INSERT INTO public.influencer_profiles (
    id, user_id, bio, niche, instagram_handle, instagram_followers,
    youtube_handle, youtube_subscribers, twitter_handle, twitter_followers,
    engagement_rate, rating, total_collaborations, location, languages
) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    NULL,
    'Fashion and lifestyle content creator. Sharing daily outfit inspiration and beauty tips. Collaborating with luxury and sustainable brands.',
    ARRAY['Fashion', 'Beauty', 'Lifestyle'],
    'sarahjohnson_style', 156000,
    'SarahJohnsonStyle', 85000,
    'sarah_style', 45000,
    4.8, 4.9, 28,
    'Los Angeles, CA',
    ARRAY['English', 'Spanish']
),
(
    'a0000000-0000-0000-0000-000000000002',
    NULL,
    'Tech reviewer and gadget enthusiast. Making technology accessible for everyone. Focus on honest, in-depth reviews.',
    ARRAY['Tech', 'Gaming', 'Education'],
    'mikechentech', 320000,
    'MikeChenTech', 450000,
    'mikechen_tech', 120000,
    5.2, 4.8, 42,
    'San Francisco, CA',
    ARRAY['English', 'Mandarin']
),
(
    'a0000000-0000-0000-0000-000000000003',
    NULL,
    'Lifestyle and travel content creator. Documenting adventures around the world. Partnership inquiries welcome!',
    ARRAY['Travel', 'Lifestyle', 'Food'],
    'emmawilliams_travel', 580000,
    'EmmaWilliamsAdventures', 320000,
    'emma_travels', 180000,
    6.1, 5.0, 56,
    'New York, NY',
    ARRAY['English', 'French']
),
(
    'a0000000-0000-0000-0000-000000000004',
    NULL,
    'Fitness coach and nutrition expert. Helping people achieve their health goals. Certified personal trainer.',
    ARRAY['Fitness', 'Health', 'Lifestyle'],
    'alexrivera_fit', 245000,
    'AlexRiveraFitness', 180000,
    'alex_fitness', 75000,
    5.5, 4.7, 35,
    'Miami, FL',
    ARRAY['English', 'Portuguese']
),
(
    'a0000000-0000-0000-0000-000000000005',
    NULL,
    'Beauty and skincare expert. Sharing honest reviews and tutorials. Focus on inclusive beauty for all skin types.',
    ARRAY['Beauty', 'Fashion', 'Lifestyle'],
    'priyasharma_beauty', 420000,
    'PriyaSharmBeauty', 280000,
    'priya_beauty', 95000,
    5.8, 4.9, 48,
    'Chicago, IL',
    ARRAY['English', 'Hindi']
),
(
    'a0000000-0000-0000-0000-000000000006',
    NULL,
    'Gaming content creator and esports enthusiast. Streaming daily. Reviews, tutorials, and entertainment.',
    ARRAY['Gaming', 'Tech', 'Entertainment'],
    'jameswilson_gaming', 180000,
    'JamesWilsonGaming', 520000,
    'james_plays', 130000,
    4.5, 4.6, 22,
    'Seattle, WA',
    ARRAY['English']
)
ON CONFLICT (id) DO NOTHING;

