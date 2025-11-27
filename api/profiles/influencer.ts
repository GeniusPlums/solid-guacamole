import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'POST' || req.method === 'PATCH') {
      const data = req.body;

      const existing = await db.query.influencerProfiles.findFirst({
        where: eq(schema.influencerProfiles.userId, payload.userId),
      });

      const profileData = {
        bio: data.bio,
        niche: data.niche,
        instagramHandle: data.instagramHandle,
        instagramFollowers: data.instagramFollowers,
        youtubeHandle: data.youtubeHandle,
        youtubeSubscribers: data.youtubeSubscribers,
        twitterHandle: data.twitterHandle,
        twitterFollowers: data.twitterFollowers,
        tiktokHandle: data.tiktokHandle,
        tiktokFollowers: data.tiktokFollowers,
        engagementRate: data.engagementRate,
        location: data.location,
        languages: data.languages,
        portfolioImages: data.portfolioImages,
        contentSamples: data.contentSamples,
      };

      if (existing) {
        await db
          .update(schema.influencerProfiles)
          .set(profileData)
          .where(eq(schema.influencerProfiles.userId, payload.userId));
      } else {
        await db.insert(schema.influencerProfiles).values({
          userId: payload.userId,
          ...profileData,
        });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Influencer profile error:', error);
    res.status(500).json({ error: 'Failed to save influencer profile' });
  }
}

