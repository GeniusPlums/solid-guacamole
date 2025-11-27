import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq, and, desc } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, payload.userId),
    });

    if (!brandProfile) {
      if (req.method === 'GET') return res.json([]);
      return res.status(403).json({ error: 'Brand profile required' });
    }

    if (req.method === 'GET') {
      const shortlists = await db.query.shortlists.findMany({
        where: eq(schema.shortlists.brandId, brandProfile.id),
        with: {
          influencer: {
            with: { profile: true },
          },
        },
        orderBy: [desc(schema.shortlists.createdAt)],
      });
      return res.json(shortlists);
    }

    if (req.method === 'POST') {
      const { influencerId, notes } = req.body;

      if (!influencerId) {
        return res.status(400).json({ error: 'Influencer ID required' });
      }

      // Check if already shortlisted
      const existing = await db.query.shortlists.findFirst({
        where: and(
          eq(schema.shortlists.brandId, brandProfile.id),
          eq(schema.shortlists.influencerId, influencerId)
        ),
      });

      if (existing) {
        return res.status(400).json({ error: 'Already shortlisted' });
      }

      const [shortlist] = await db
        .insert(schema.shortlists)
        .values({
          brandId: brandProfile.id,
          influencerId,
          notes: notes || null,
        })
        .returning();

      return res.status(201).json(shortlist);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Shortlists error:', error);
    res.status(500).json({ error: 'Failed to process shortlist request' });
  }
}

