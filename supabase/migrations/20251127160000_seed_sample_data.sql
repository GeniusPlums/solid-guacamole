-- Seed sample influencer profiles for demonstration
-- Note: These are sample profiles that will be visible in the marketplace

-- First, we'll create some sample profiles using a function that can be called
-- This creates sample data only if no influencer profiles exist yet

DO $$
DECLARE
    sample_user_ids UUID[] := ARRAY[
        '00000000-0000-0000-0000-000000000001'::UUID,
        '00000000-0000-0000-0000-000000000002'::UUID,
        '00000000-0000-0000-0000-000000000003'::UUID,
        '00000000-0000-0000-0000-000000000004'::UUID,
        '00000000-0000-0000-0000-000000000005'::UUID,
        '00000000-0000-0000-0000-000000000006'::UUID
    ];
BEGIN
    -- Only seed if no influencer profiles exist
    IF NOT EXISTS (SELECT 1 FROM public.influencer_profiles LIMIT 1) THEN
        -- Insert sample base profiles
        INSERT INTO public.profiles (id, user_type, full_name, email, avatar_url) VALUES
        (sample_user_ids[1], 'influencer', 'Sarah Johnson', 'sarah@example.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'),
        (sample_user_ids[2], 'influencer', 'Mike Chen', 'mike@example.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'),
        (sample_user_ids[3], 'influencer', 'Emma Williams', 'emma@example.com', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'),
        (sample_user_ids[4], 'influencer', 'Alex Rivera', 'alex@example.com', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'),
        (sample_user_ids[5], 'influencer', 'Priya Sharma', 'priya@example.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop'),
        (sample_user_ids[6], 'influencer', 'James Wilson', 'james@example.com', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop')
        ON CONFLICT (id) DO NOTHING;

        -- Insert sample influencer profiles
        INSERT INTO public.influencer_profiles (
            user_id, bio, niche, instagram_handle, instagram_followers,
            youtube_handle, youtube_subscribers, twitter_handle, twitter_followers,
            engagement_rate, rating, total_collaborations, location, languages
        ) VALUES
        (
            sample_user_ids[1],
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
            sample_user_ids[2],
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
            sample_user_ids[3],
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
            sample_user_ids[4],
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
            sample_user_ids[5],
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
            sample_user_ids[6],
            'Gaming content creator and esports enthusiast. Streaming daily. Reviews, tutorials, and entertainment.',
            ARRAY['Gaming', 'Tech', 'Entertainment'],
            'jameswilson_gaming', 180000,
            'JamesWilsonGaming', 520000,
            'james_plays', 130000,
            4.5, 4.6, 22,
            'Seattle, WA',
            ARRAY['English']
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

