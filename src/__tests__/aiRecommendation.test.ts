import { describe, it, expect } from 'vitest';
import { scoreInfluencers, CampaignRequirements } from '../lib/aiRecommendation';
import { InfluencerWithProfile } from '../hooks/useInfluencers';

describe('AI Recommendation System', () => {
  const mockInfluencers: InfluencerWithProfile[] = [
    {
      id: '1',
      user_id: 'u1',
      bio: 'Fashion and lifestyle blogger',
      niche: ['Fashion', 'Lifestyle'],
      instagram_handle: 'fashionista',
      instagram_followers: 100000,
      youtube_handle: null,
      youtube_subscribers: 0,
      twitter_handle: null,
      twitter_followers: 0,
      tiktok_handle: null,
      tiktok_followers: 0,
      engagement_rate: 4.5,
      rating: 4.8,
      total_collaborations: 15,
      portfolio_images: ['img1.jpg'],
      content_samples: ['video1.mp4'],
      location: 'New York',
      languages: ['English'],
    },
    {
      id: '2',
      user_id: 'u2',
      bio: 'Tech reviewer',
      niche: ['Tech', 'Gaming'],
      instagram_handle: 'techguru',
      instagram_followers: 50000,
      youtube_handle: 'techguru',
      youtube_subscribers: 200000,
      twitter_handle: 'techguru',
      twitter_followers: 30000,
      tiktok_handle: null,
      tiktok_followers: 0,
      engagement_rate: 3.2,
      rating: 4.5,
      total_collaborations: 8,
      portfolio_images: [],
      content_samples: [],
      location: 'San Francisco',
      languages: ['English'],
    },
    {
      id: '3',
      user_id: 'u3',
      bio: 'Fitness coach',
      niche: ['Fitness', 'Health'],
      instagram_handle: 'fitcoach',
      instagram_followers: 75000,
      youtube_handle: null,
      youtube_subscribers: 0,
      twitter_handle: null,
      twitter_followers: 0,
      tiktok_handle: 'fitcoach',
      tiktok_followers: 150000,
      engagement_rate: 5.8,
      rating: 4.2,
      total_collaborations: 20,
      portfolio_images: [],
      content_samples: [],
      location: 'Los Angeles',
      languages: ['English', 'Spanish'],
    },
  ];

  const baseRequirements: CampaignRequirements = {
    niche: ['Fashion'],
    platforms: ['instagram'],
    minFollowers: 50000,
    maxFollowers: 500000,
    targetEngagement: 3,
    budget: 10000,
    contentType: 'mixed',
    targetAudience: 'general',
    campaignGoal: 'awareness',
  };

  it('should score influencers and return sorted results', () => {
    const results = scoreInfluencers(mockInfluencers, baseRequirements);
    
    expect(results).toHaveLength(3);
    // Results should be sorted by score descending
    expect(results[0].overallScore).toBeGreaterThanOrEqual(results[1].overallScore);
    expect(results[1].overallScore).toBeGreaterThanOrEqual(results[2].overallScore);
  });

  it('should give higher niche score for matching niches', () => {
    const results = scoreInfluencers(mockInfluencers, baseRequirements);
    
    // Fashion influencer should have highest niche score
    const fashionInfluencer = results.find(r => r.influencer.id === '1');
    const techInfluencer = results.find(r => r.influencer.id === '2');
    
    expect(fashionInfluencer!.nicheScore).toBeGreaterThan(techInfluencer!.nicheScore);
  });

  it('should calculate engagement score based on target', () => {
    const results = scoreInfluencers(mockInfluencers, {
      ...baseRequirements,
      targetEngagement: 4,
    });
    
    // Fitness influencer has 5.8% engagement, should score well
    const fitnessInfluencer = results.find(r => r.influencer.id === '3');
    expect(fitnessInfluencer!.engagementScore).toBeGreaterThanOrEqual(80);
  });

  it('should calculate reach score based on follower range', () => {
    const results = scoreInfluencers(mockInfluencers, {
      ...baseRequirements,
      minFollowers: 80000,
      maxFollowers: 120000,
    });
    
    // Fashion influencer has 100k followers, should score highest
    const fashionInfluencer = results.find(r => r.influencer.id === '1');
    expect(fashionInfluencer!.reachScore).toBe(100);
  });

  it('should generate match reasons', () => {
    const results = scoreInfluencers(mockInfluencers, baseRequirements);
    
    results.forEach(result => {
      expect(result.matchReasons).toBeDefined();
      expect(result.matchReasons.length).toBeGreaterThan(0);
    });
  });

  it('should handle empty influencer array', () => {
    const results = scoreInfluencers([], baseRequirements);
    expect(results).toHaveLength(0);
  });

  it('should handle influencers with missing data', () => {
    const incompleteInfluencer: InfluencerWithProfile = {
      id: '4',
      user_id: 'u4',
      bio: null,
      niche: null,
      instagram_handle: null,
      instagram_followers: 0,
      youtube_handle: null,
      youtube_subscribers: 0,
      twitter_handle: null,
      twitter_followers: 0,
      tiktok_handle: null,
      tiktok_followers: 0,
      engagement_rate: null,
      rating: null,
      total_collaborations: 0,
      portfolio_images: null,
      content_samples: null,
      location: null,
      languages: null,
    };

    const results = scoreInfluencers([incompleteInfluencer], baseRequirements);
    expect(results).toHaveLength(1);
    expect(results[0].nicheScore).toBe(0);
  });
});

