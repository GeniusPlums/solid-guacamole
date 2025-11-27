import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { setCorsHeaders } from '../_lib/cors';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const influencer = await db.query.influencerProfiles.findFirst({
      where: eq(schema.influencerProfiles.id, String(id)),
      with: {
        profile: true,
      },
    });

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    res.json({
      id: influencer.id,
      bio: influencer.bio,
      niche: influencer.niche,
      instagramHandle: influencer.instagramHandle,
      instagramFollowers: influencer.instagramFollowers,
      youtubeHandle: influencer.youtubeHandle,
      youtubeSubscribers: influencer.youtubeSubscribers,
      twitterHandle: influencer.twitterHandle,
      twitterFollowers: influencer.twitterFollowers,
      tiktokHandle: influencer.tiktokHandle,
      tiktokFollowers: influencer.tiktokFollowers,
      engagementRate: influencer.engagementRate ? parseFloat(influencer.engagementRate.toString()) : null,
      rating: influencer.rating ? parseFloat(influencer.rating.toString()) : null,
      totalCollaborations: influencer.totalCollaborations,
      location: influencer.location,
      languages: influencer.languages,
      portfolioImages: influencer.portfolioImages,
      contentSamples: influencer.contentSamples,
      profile: influencer.profile ? {
        fullName: influencer.profile.fullName,
        avatarUrl: influencer.profile.avatarUrl,
      } : null,
    });
  } catch (error) {
    console.error('Get influencer error:', error);
    res.status(500).json({ error: 'Failed to get influencer' });
  }
}

