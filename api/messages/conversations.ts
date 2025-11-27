import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq, or, desc, and, ne } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  const payload = verifyToken(req);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all messages involving this user
    const messages = await db.query.messages.findMany({
      where: or(
        eq(schema.messages.fromUserId, payload.userId),
        eq(schema.messages.toUserId, payload.userId)
      ),
      orderBy: [desc(schema.messages.createdAt)],
    });

    // Group by conversation partner
    const conversationMap = new Map<string, any>();
    
    for (const msg of messages) {
      const partnerId = msg.fromUserId === payload.userId ? msg.toUserId : msg.fromUserId;
      
      if (!conversationMap.has(partnerId)) {
        const partner = await db.query.profiles.findFirst({
          where: eq(schema.profiles.id, partnerId),
        });

        const unreadCount = messages.filter(
          m => m.fromUserId === partnerId && m.toUserId === payload.userId && !m.isRead
        ).length;

        conversationMap.set(partnerId, {
          id: partnerId,
          recipientId: partnerId,
          recipientName: partner?.fullName || 'Unknown',
          recipientAvatar: partner?.avatarUrl || null,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    res.json(conversations);
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
}

