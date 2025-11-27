import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = verifyToken(req);
    if (!payload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(schema.profiles.id, payload.userId),
    });

    if (!profile) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user: { id: profile.id, email: profile.email } });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
}

