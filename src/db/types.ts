// Type definitions for the database schema (frontend-compatible)

export type UserRole = 'brand' | 'influencer';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type CollaborationStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  userType: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface BrandProfile {
  id: string;
  userId: string;
  companyName: string;
  description: string | null;
  industry: string | null;
  website: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InfluencerProfile {
  id: string;
  userId: string;
  bio: string | null;
  location: string | null;
  niche: string[] | null;
  languages: string[] | null;
  instagramHandle: string | null;
  instagramFollowers: number | null;
  youtubeHandle: string | null;
  youtubeSubscribers: number | null;
  twitterHandle: string | null;
  twitterFollowers: number | null;
  tiktokHandle: string | null;
  tiktokFollowers: number | null;
  engagementRate: number | null;
  rating: number | null;
  totalCollaborations: number | null;
  portfolioImages: string[] | null;
  contentSamples: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string | null;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  status: CampaignStatus | null;
  targetPlatforms: string[] | null;
  targetNiche: string[] | null;
  minFollowers: number | null;
  maxFollowers: number | null;
  targetEngagementRate: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Collaboration {
  id: string;
  campaignId: string;
  influencerId: string;
  brandId: string;
  status: CollaborationStatus | null;
  offeredAmount: number | null;
  deliverables: string | null;
  deadline: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  collaborationId: string | null;
  content: string;
  read: boolean | null;
  createdAt: string;
}

export interface Rating {
  id: string;
  collaborationId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  review: string | null;
  createdAt: string;
}

// Types with relations (for API responses)
export interface ProfileWithDetails extends Profile {
  brandProfile?: BrandProfile | null;
  influencerProfile?: InfluencerProfile | null;
}

export interface InfluencerWithProfile extends InfluencerProfile {
  profile: Profile | null;
}

export interface BrandWithProfile extends BrandProfile {
  profile: Profile | null;
}

export interface CampaignWithDetails extends Campaign {
  brandProfile?: BrandWithProfile | null;
}

export interface CollaborationWithDetails extends Collaboration {
  campaign?: Campaign | null;
  influencerProfile?: InfluencerWithProfile | null;
  brandProfile?: BrandWithProfile | null;
}

// Auth types
export interface AuthUser extends User {
  profile?: Profile | null;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  session?: AuthSession;
  user?: AuthUser;
}

