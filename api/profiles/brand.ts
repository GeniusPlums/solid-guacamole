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
      const { companyName, industry, description, website, campaignGoals, targetAudience, logoUrl } = req.body;

      const existing = await db.query.brandProfiles.findFirst({
        where: eq(schema.brandProfiles.userId, payload.userId),
      });

      if (existing) {
        await db
          .update(schema.brandProfiles)
          .set({ companyName, industry, description, website, campaignGoals, targetAudience, logoUrl })
          .where(eq(schema.brandProfiles.userId, payload.userId));
      } else {
        await db.insert(schema.brandProfiles).values({
          userId: payload.userId,
          companyName,
          industry,
          description,
          website,
          campaignGoals,
          targetAudience,
          logoUrl,
        });
      }

      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Brand profile error:', error);
    res.status(500).json({ error: 'Failed to save brand profile' });
  }
}

