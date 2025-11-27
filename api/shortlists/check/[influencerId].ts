import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../../_lib/db';
import { verifyToken } from '../../_lib/auth';
import { setCorsHeaders } from '../../_lib/cors';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  const payload = verifyToken(req);
  if (!payload) {
    return res.json({ isShortlisted: false });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { influencerId } = req.query;

    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, payload.userId),
    });

    if (!brandProfile) {
      return res.json({ isShortlisted: false });
    }

    const shortlist = await db.query.shortlists.findFirst({
      where: and(
        eq(schema.shortlists.brandId, brandProfile.id),
        eq(schema.shortlists.influencerId, String(influencerId))
      ),
    });

    res.json({ isShortlisted: !!shortlist });
  } catch (error) {
    console.error('Check shortlist error:', error);
    res.status(500).json({ error: 'Failed to check shortlist' });
  }
}

