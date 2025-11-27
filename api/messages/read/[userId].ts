import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../../_lib/db';
import { verifyToken } from '../../_lib/auth';
import { setCorsHeaders } from '../../_lib/cors';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    await db
      .update(schema.messages)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.messages.fromUserId, String(userId)),
          eq(schema.messages.toUserId, payload.userId)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
}

