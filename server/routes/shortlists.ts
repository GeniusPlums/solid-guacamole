import { Router } from 'express';
import { db, schema } from '../db';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const shortlistsRouter = Router();

// Get all shortlisted influencers for the brand
shortlistsRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    if (!brandProfile) {
      return res.status(403).json({ error: 'Brand profile required' });
    }

    const shortlists = await db.query.shortlists.findMany({
      where: eq(schema.shortlists.brandId, brandProfile.id),
      with: {
        influencer: {
          with: {
            profile: true,
          },
        },
      },
      orderBy: [desc(schema.shortlists.createdAt)],
    });

    res.json(shortlists);
  } catch (error) {
    console.error('Get shortlists error:', error);
    res.status(500).json({ error: 'Failed to get shortlists' });
  }
});

// Add influencer to shortlist
shortlistsRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { influencerId, notes } = req.body;

    if (!influencerId) {
      return res.status(400).json({ error: 'Influencer ID required' });
    }

    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    if (!brandProfile) {
      return res.status(403).json({ error: 'Brand profile required' });
    }

    // Check if already shortlisted
    const existing = await db.query.shortlists.findFirst({
      where: and(
        eq(schema.shortlists.brandId, brandProfile.id),
        eq(schema.shortlists.influencerId, influencerId)
      ),
    });

    if (existing) {
      return res.status(400).json({ error: 'Influencer already shortlisted' });
    }

    const [shortlist] = await db
      .insert(schema.shortlists)
      .values({
        brandId: brandProfile.id,
        influencerId,
        notes: notes || null,
      })
      .returning();

    res.status(201).json(shortlist);
  } catch (error) {
    console.error('Add to shortlist error:', error);
    res.status(500).json({ error: 'Failed to add to shortlist' });
  }
});

// Remove from shortlist
shortlistsRouter.delete('/:influencerId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    if (!brandProfile) {
      return res.status(403).json({ error: 'Brand profile required' });
    }

    await db
      .delete(schema.shortlists)
      .where(
        and(
          eq(schema.shortlists.brandId, brandProfile.id),
          eq(schema.shortlists.influencerId, req.params.influencerId)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error('Remove from shortlist error:', error);
    res.status(500).json({ error: 'Failed to remove from shortlist' });
  }
});

// Check if influencer is shortlisted
shortlistsRouter.get('/check/:influencerId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    if (!brandProfile) {
      return res.json({ isShortlisted: false });
    }

    const shortlist = await db.query.shortlists.findFirst({
      where: and(
        eq(schema.shortlists.brandId, brandProfile.id),
        eq(schema.shortlists.influencerId, req.params.influencerId)
      ),
    });

    res.json({ isShortlisted: !!shortlist });
  } catch (error) {
    console.error('Check shortlist error:', error);
    res.status(500).json({ error: 'Failed to check shortlist' });
  }
});

