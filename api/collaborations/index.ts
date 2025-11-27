import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq, or, desc } from 'drizzle-orm';

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

    const influencerProfile = await db.query.influencerProfiles.findFirst({
      where: eq(schema.influencerProfiles.userId, payload.userId),
    });

    if (req.method === 'GET') {
      let collaborations;
      
      if (brandProfile) {
        collaborations = await db.query.collaborations.findMany({
          where: eq(schema.collaborations.brandId, brandProfile.id),
          orderBy: [desc(schema.collaborations.createdAt)],
          with: { influencer: { with: { profile: true } }, campaign: true },
        });
      } else if (influencerProfile) {
        collaborations = await db.query.collaborations.findMany({
          where: eq(schema.collaborations.influencerId, influencerProfile.id),
          orderBy: [desc(schema.collaborations.createdAt)],
          with: { brand: { with: { profile: true } }, campaign: true },
        });
      } else {
        return res.json([]);
      }

      return res.json(collaborations);
    }

    if (req.method === 'POST') {
      if (!brandProfile) {
        return res.status(403).json({ error: 'Brand profile required' });
      }

      const { campaignId, influencerId, offeredAmount, deliverables, deadline, notes } = req.body;

      const [collaboration] = await db
        .insert(schema.collaborations)
        .values({
          campaignId,
          influencerId,
          brandId: brandProfile.id,
          offeredAmount,
          deliverables,
          deadline: deadline ? new Date(deadline) : null,
          notes,
          status: 'pending',
        })
        .returning();

      return res.status(201).json(collaboration);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Collaborations error:', error);
    res.status(500).json({ error: 'Failed to process collaboration request' });
  }
}

