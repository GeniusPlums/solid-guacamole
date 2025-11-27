import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq, or, and, asc } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { userId } = req.query;
    const otherUserId = String(userId);

    if (req.method === 'GET') {
      const messages = await db.query.messages.findMany({
        where: or(
          and(
            eq(schema.messages.fromUserId, payload.userId),
            eq(schema.messages.toUserId, otherUserId)
          ),
          and(
            eq(schema.messages.fromUserId, otherUserId),
            eq(schema.messages.toUserId, payload.userId)
          )
        ),
        orderBy: [asc(schema.messages.createdAt)],
      });

      return res.json(messages);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
}

