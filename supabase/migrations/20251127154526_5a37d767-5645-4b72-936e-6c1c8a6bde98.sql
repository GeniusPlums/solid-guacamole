-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('brand', 'influencer');

-- Create enum for collaboration status
CREATE TYPE public.collaboration_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

-- Create enum for campaign status
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');

-- Create profiles table for all users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_role NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create influencer_profiles table
CREATE TABLE public.influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  niche TEXT[] DEFAULT '{}',
  instagram_handle TEXT,
  instagram_followers INTEGER,
  youtube_handle TEXT,
  youtube_subscribers INTEGER,
  twitter_handle TEXT,
  twitter_followers INTEGER,
  tiktok_handle TEXT,
  tiktok_followers INTEGER,
  engagement_rate DECIMAL(5,2),
  rating DECIMAL(3,2) DEFAULT 0,
  total_collaborations INTEGER DEFAULT 0,
  portfolio_images TEXT[] DEFAULT '{}',
  content_samples TEXT[] DEFAULT '{}',
  location TEXT,
  languages TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create brand_profiles table
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  target_niche TEXT[] DEFAULT '{}',
  target_platforms TEXT[] DEFAULT '{}',
  min_followers INTEGER,
  max_followers INTEGER,
  target_engagement_rate DECIMAL(5,2),
  status campaign_status DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create collaborations table
CREATE TABLE public.collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  status collaboration_status DEFAULT 'pending',
  offered_amount DECIMAL(10,2),
  deliverables TEXT,
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaboration_id UUID NOT NULL REFERENCES public.collaborations(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collaboration_id, from_user_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  collaboration_id UUID REFERENCES public.collaborations(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
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

-- RLS Policies for influencer_profiles
CREATE POLICY "Anyone can view influencer profiles"
  ON public.influencer_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Influencers can update own profile"
  ON public.influencer_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Influencers can insert own profile"
  ON public.influencer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for brand_profiles
CREATE POLICY "Anyone can view brand profiles"
  ON public.brand_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Brands can update own profile"
  ON public.brand_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Brands can insert own profile"
  ON public.brand_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Brands can create campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brand_profiles
      WHERE id = brand_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can update own campaigns"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_profiles
      WHERE id = brand_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for collaborations
CREATE POLICY "Users can view own collaborations"
  ON public.collaborations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_profiles
      WHERE id = brand_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.influencer_profiles
      WHERE id = influencer_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Brands can create collaborations"
  ON public.collaborations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.brand_profiles
      WHERE id = brand_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own collaborations"
  ON public.collaborations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.brand_profiles
      WHERE id = brand_id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.influencer_profiles
      WHERE id = influencer_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for ratings
CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ratings"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can update own received messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (to_user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON public.influencer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_collaborations_updated_at
  BEFORE UPDATE ON public.collaborations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, full_name, email)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'user_type')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('portfolios', 'portfolios', true),
  ('content-samples', 'content-samples', true);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for portfolios
CREATE POLICY "Anyone can view portfolios"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolios');

CREATE POLICY "Influencers can upload portfolio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolios' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Influencers can update portfolio"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolios' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Influencers can delete portfolio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolios' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for content-samples
CREATE POLICY "Anyone can view content samples"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-samples');

CREATE POLICY "Influencers can upload content samples"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'content-samples' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Influencers can update content samples"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'content-samples' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Influencers can delete content samples"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'content-samples' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );