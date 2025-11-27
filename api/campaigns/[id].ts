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
    const { id } = req.query;

    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, payload.userId),
    });

    if (!brandProfile) {
      return res.status(403).json({ error: 'Brand profile required' });
    }

    if (req.method === 'GET') {
      const campaign = await db.query.campaigns.findFirst({
        where: and(
          eq(schema.campaigns.id, String(id)),
          eq(schema.campaigns.brandId, brandProfile.id)
        ),
      });
      
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      
      return res.json(campaign);
    }

    if (req.method === 'PATCH') {
      const updates = req.body;
      
      await db
        .update(schema.campaigns)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(
          eq(schema.campaigns.id, String(id)),
          eq(schema.campaigns.brandId, brandProfile.id)
        ));
      
      const campaign = await db.query.campaigns.findFirst({
        where: eq(schema.campaigns.id, String(id)),
      });
      
      return res.json(campaign);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Campaign error:', error);
    res.status(500).json({ error: 'Failed to process campaign request' });
  }
}

