import { Router } from 'express';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const collaborationsRouter = Router();

// Get all collaborations for current user
collaborationsRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Get user's brand or influencer profile
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    const influencerProfile = await db.query.influencerProfiles.findFirst({
      where: eq(schema.influencerProfiles.userId, req.user!.id),
    });

    let collaborations;

    if (brandProfile) {
      collaborations = await db.query.collaborations.findMany({
        where: eq(schema.collaborations.brandId, brandProfile.id),
        orderBy: [desc(schema.collaborations.createdAt)],
        with: {
          campaign: true,
          influencer: {
            with: {
              profile: true,
            },
          },
          brand: {
            with: {
              profile: true,
            },
          },
        },
      });
    } else if (influencerProfile) {
      collaborations = await db.query.collaborations.findMany({
        where: eq(schema.collaborations.influencerId, influencerProfile.id),
        orderBy: [desc(schema.collaborations.createdAt)],
        with: {
          campaign: true,
          influencer: {
            with: {
              profile: true,
            },
          },
          brand: {
            with: {
              profile: true,
            },
          },
        },
      });
    } else {
      return res.json([]);
    }

    res.json(collaborations);
  } catch (error) {
    console.error('Get collaborations error:', error);
    res.status(500).json({ error: 'Failed to get collaborations' });
  }
});

// Create collaboration
collaborationsRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { campaignId, influencerId, offeredAmount, deliverables, deadline, notes } = req.body;

    // Validate required fields
    if (!campaignId) {
      return res.status(400).json({ error: 'Campaign ID is required' });
    }
    if (!influencerId) {
      return res.status(400).json({ error: 'Influencer ID is required' });
    }

    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    if (!brandProfile) {
      return res.status(400).json({ error: 'Brand profile required' });
    }

    // Properly handle the deadline date conversion
    const [collaboration] = await db.insert(schema.collaborations)
      .values({
        campaignId,
        influencerId,
        brandId: brandProfile.id,
        offeredAmount: offeredAmount || null,
        deliverables: deliverables || null,
        deadline: deadline ? new Date(deadline) : null,
        notes: notes || null,
        status: 'pending',
      })
      .returning();

    res.status(201).json(collaboration);
  } catch (error: any) {
    console.error('Create collaboration error:', error);
    res.status(500).json({ error: error.message || 'Failed to create collaboration' });
  }
});

// Update collaboration status
collaborationsRouter.patch('/:id/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    const [updated] = await db.update(schema.collaborations)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(schema.collaborations.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update collaboration status error:', error);
    res.status(500).json({ error: 'Failed to update collaboration' });
  }
});

// Update collaboration
collaborationsRouter.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [updated] = await db.update(schema.collaborations)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(schema.collaborations.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update collaboration error:', error);
    res.status(500).json({ error: 'Failed to update collaboration' });
  }
});

