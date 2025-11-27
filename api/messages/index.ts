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
    if (req.method === 'POST') {
      const { toUserId, content } = req.body;

      if (!toUserId || !content) {
        return res.status(400).json({ error: 'toUserId and content required' });
      }

      const [message] = await db
        .insert(schema.messages)
        .values({
          fromUserId: payload.userId,
          toUserId,
          content,
        })
        .returning();

      return res.status(201).json(message);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ error: 'Failed to process message request' });
  }
}

