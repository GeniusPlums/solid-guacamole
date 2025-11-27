import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq, desc } from 'drizzle-orm';

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
      return res.status(403).json({ error: 'Brand profile required' });
    }

    if (req.method === 'GET') {
      const campaigns = await db.query.campaigns.findMany({
        where: eq(schema.campaigns.brandId, brandProfile.id),
        orderBy: [desc(schema.campaigns.createdAt)],
      });
      return res.json(campaigns);
    }

    if (req.method === 'POST') {
      const { title, description, budget, niches, platforms, requirements, startDate, endDate } = req.body;

      const [campaign] = await db
        .insert(schema.campaigns)
        .values({
          brandId: brandProfile.id,
          title,
          description,
          budget,
          niches,
          platforms,
          requirements,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          status: 'active',
        })
        .returning();

      return res.status(201).json(campaign);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Campaigns error:', error);
    res.status(500).json({ error: 'Failed to process campaign request' });
  }
}

