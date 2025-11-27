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
    if (req.method === 'GET') {
      const profile = await db.query.profiles.findFirst({
        where: eq(schema.profiles.id, payload.userId),
      });

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const brandProfile = await db.query.brandProfiles.findFirst({
        where: eq(schema.brandProfiles.userId, payload.userId),
      });

      const influencerProfile = await db.query.influencerProfiles.findFirst({
        where: eq(schema.influencerProfiles.userId, payload.userId),
      });

      return res.json({
        profile: {
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          userType: profile.userType,
          avatarUrl: profile.avatarUrl,
        },
        brandProfile,
        influencerProfile,
      });
    }

    if (req.method === 'PATCH') {
      const { fullName, avatarUrl } = req.body;
      
      await db
        .update(schema.profiles)
        .set({ fullName, avatarUrl, updatedAt: new Date() })
        .where(eq(schema.profiles.id, payload.userId));

      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to process profile request' });
  }
}

