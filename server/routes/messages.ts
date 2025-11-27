import { Router } from 'express';
import { db, schema } from '../db';
import { eq, desc, or, and, sql } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const messagesRouter = Router();

// Get conversations for current user
messagesRouter.get('/conversations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get all unique conversations (users the current user has messaged with)
    const conversations = await db
      .select({
        id: schema.messages.id,
        fromUserId: schema.messages.fromUserId,
        toUserId: schema.messages.toUserId,
        content: schema.messages.content,
        read: schema.messages.read,
        createdAt: schema.messages.createdAt,
        collaborationId: schema.messages.collaborationId,
      })
      .from(schema.messages)
      .where(
        or(
          eq(schema.messages.fromUserId, userId),
          eq(schema.messages.toUserId, userId)
        )
      )
      .orderBy(desc(schema.messages.createdAt));

    // Group by conversation partner and get latest message
    const conversationMap = new Map<string, typeof conversations[0]>();
    conversations.forEach((msg) => {
      const partnerId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, msg);
      }
    });

    // Get partner profiles
    const conversationList = await Promise.all(
      Array.from(conversationMap.entries()).map(async ([partnerId, lastMsg]) => {
        const profile = await db.query.profiles.findFirst({
          where: eq(schema.profiles.id, partnerId),
        });

        // Get unread count
        const unreadResult = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(schema.messages)
          .where(
            and(
              eq(schema.messages.fromUserId, partnerId),
              eq(schema.messages.toUserId, userId),
              eq(schema.messages.read, false)
            )
          );

        return {
          id: partnerId,
          name: profile?.fullName || 'Unknown User',
          avatar: profile?.avatarUrl || '',
          userType: profile?.userType || 'unknown',
          lastMessage: lastMsg.content,
          timestamp: lastMsg.createdAt,
          unread: unreadResult[0]?.count || 0,
        };
      })
    );

    res.json(conversationList);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages between current user and another user
messagesRouter.get('/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user!.id;
    const otherUserId = req.params.userId;

    const messages = await db
      .select()
      .from(schema.messages)
      .where(
        or(
          and(
            eq(schema.messages.fromUserId, currentUserId),
            eq(schema.messages.toUserId, otherUserId)
          ),
          and(
            eq(schema.messages.fromUserId, otherUserId),
            eq(schema.messages.toUserId, currentUserId)
          )
        )
      )
      .orderBy(schema.messages.createdAt);

    // Mark messages as read
    await db
      .update(schema.messages)
      .set({ read: true })
      .where(
        and(
          eq(schema.messages.fromUserId, otherUserId),
          eq(schema.messages.toUserId, currentUserId)
        )
      );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send a message
messagesRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { toUserId, content, collaborationId } = req.body;

    if (!toUserId || !content) {
      return res.status(400).json({ error: 'Recipient and content required' });
    }

    const [message] = await db
      .insert(schema.messages)
      .values({
        fromUserId: req.user!.id,
        toUserId,
        content,
        collaborationId: collaborationId || null,
        read: false,
      })
      .returning();

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
messagesRouter.patch('/read/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await db
      .update(schema.messages)
      .set({ read: true })
      .where(
        and(
          eq(schema.messages.fromUserId, req.params.userId),
          eq(schema.messages.toUserId, req.user!.id)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

