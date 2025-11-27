import { InfluencerWithProfile } from "@/hooks/useInfluencers";

export interface CampaignRequirements {
  niche: string[];
  platforms: string[];
  minFollowers: number;
  maxFollowers: number;
  targetEngagement: number;
  budget: number;
  contentType: string;
  targetAudience: string;
  campaignGoal: string;
}

export interface InfluencerScore {
  influencer: InfluencerWithProfile;
  overallScore: number;
  nicheScore: number;
  engagementScore: number;
  reachScore: number;
  consistencyScore: number;
  matchReasons: string[];
}

// Calculate niche alignment score (0-100)
function calculateNicheScore(influencer: InfluencerWithProfile, targetNiches: string[]): number {
  if (!influencer.niche || influencer.niche.length === 0) return 0;
  const matchingNiches = influencer.niche.filter((n) =>
    targetNiches.some((tn) => n.toLowerCase().includes(tn.toLowerCase()) || tn.toLowerCase().includes(n.toLowerCase()))
  );
  return (matchingNiches.length / targetNiches.length) * 100;
}

// Calculate engagement score (0-100)
function calculateEngagementScore(influencer: InfluencerWithProfile, targetEngagement: number): number {
  const engagement = influencer.engagement_rate || 0;
  if (engagement >= targetEngagement * 1.5) return 100;
  if (engagement >= targetEngagement) return 80;
  if (engagement >= targetEngagement * 0.7) return 60;
  if (engagement >= targetEngagement * 0.5) return 40;
  return 20;
}

// Calculate reach/followers score (0-100)
function calculateReachScore(influencer: InfluencerWithProfile, minFollowers: number, maxFollowers: number): number {
  const totalFollowers =
    (influencer.instagram_followers || 0) +
    (influencer.youtube_subscribers || 0) +
    (influencer.twitter_followers || 0) +
    (influencer.tiktok_followers || 0);

  if (totalFollowers >= minFollowers && totalFollowers <= maxFollowers) return 100;
  if (totalFollowers >= minFollowers * 0.5 && totalFollowers <= maxFollowers * 1.5) return 70;
  if (totalFollowers >= minFollowers * 0.25) return 40;
  return 20;
}

// Calculate consistency score based on profile completeness and activity
function calculateConsistencyScore(influencer: InfluencerWithProfile): number {
  let score = 0;
  if (influencer.bio) score += 20;
  if (influencer.niche && influencer.niche.length > 0) score += 20;
  if (influencer.instagram_handle) score += 15;
  if (influencer.youtube_handle) score += 15;
  if (influencer.portfolio_images && influencer.portfolio_images.length > 0) score += 15;
  if (influencer.content_samples && influencer.content_samples.length > 0) score += 15;
  return score;
}

// Generate match reasons
function generateMatchReasons(
  influencer: InfluencerWithProfile,
  nicheScore: number,
  engagementScore: number,
  reachScore: number,
  requirements: CampaignRequirements
): string[] {
  const reasons: string[] = [];

  if (nicheScore >= 80) {
    reasons.push(`Strong niche alignment with ${influencer.niche?.join(", ")}`);
  } else if (nicheScore >= 50) {
    reasons.push(`Partial niche match in ${influencer.niche?.join(", ")}`);
  }

  if (engagementScore >= 80) {
    reasons.push(`Excellent engagement rate of ${influencer.engagement_rate}%`);
  } else if (engagementScore >= 60) {
    reasons.push(`Good engagement metrics`);
  }

  const totalFollowers =
    (influencer.instagram_followers || 0) +
    (influencer.youtube_subscribers || 0) +
    (influencer.twitter_followers || 0);

  if (reachScore >= 80) {
    reasons.push(`Ideal audience size of ${formatNumber(totalFollowers)} followers`);
  }

  if (influencer.rating && influencer.rating >= 4.5) {
    reasons.push(`Highly rated (${influencer.rating}/5) by previous brands`);
  }

  if (influencer.total_collaborations && influencer.total_collaborations >= 5) {
    reasons.push(`Experienced with ${influencer.total_collaborations} successful collaborations`);
  }

  return reasons.length > 0 ? reasons : ["Profile matches basic requirements"];
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function scoreInfluencers(
  influencers: InfluencerWithProfile[],
  requirements: CampaignRequirements
): InfluencerScore[] {
  return influencers.map((influencer) => {
    const nicheScore = calculateNicheScore(influencer, requirements.niche);
    const engagementScore = calculateEngagementScore(influencer, requirements.targetEngagement);
    const reachScore = calculateReachScore(influencer, requirements.minFollowers, requirements.maxFollowers);
    const consistencyScore = calculateConsistencyScore(influencer);

    // Weighted overall score
    const overallScore =
      nicheScore * 0.35 +
      engagementScore * 0.30 +
      reachScore * 0.20 +
      consistencyScore * 0.15;

    const matchReasons = generateMatchReasons(influencer, nicheScore, engagementScore, reachScore, requirements);

    return {
      influencer,
      overallScore: Math.round(overallScore),
      nicheScore: Math.round(nicheScore),
      engagementScore: Math.round(engagementScore),
      reachScore: Math.round(reachScore),
      consistencyScore: Math.round(consistencyScore),
      matchReasons,
    };
  }).sort((a, b) => b.overallScore - a.overallScore);
}

