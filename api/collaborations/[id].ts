import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq, or } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.query;

    if (req.method === 'PATCH') {
      const updates = req.body;
      
      await db
        .update(schema.collaborations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.collaborations.id, String(id)));
      
      const collaboration = await db.query.collaborations.findFirst({
        where: eq(schema.collaborations.id, String(id)),
      });
      
      return res.json(collaboration);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Collaboration error:', error);
    res.status(500).json({ error: 'Failed to process collaboration request' });
  }
}

