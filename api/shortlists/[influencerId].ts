import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { influencerId } = req.query;

    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, payload.userId),
    });

    if (!brandProfile) {
      return res.status(403).json({ error: 'Brand profile required' });
    }

    if (req.method === 'DELETE') {
      await db
        .delete(schema.shortlists)
        .where(
          and(
            eq(schema.shortlists.brandId, brandProfile.id),
            eq(schema.shortlists.influencerId, String(influencerId))
          )
        );
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Shortlist delete error:', error);
    res.status(500).json({ error: 'Failed to remove from shortlist' });
  }
}

