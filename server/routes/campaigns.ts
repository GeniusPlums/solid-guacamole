import { Router } from 'express';
import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const campaignsRouter = Router();

// Get all campaigns for current brand
campaignsRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // First get brand profile
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    if (!brandProfile) {
      return res.json([]);
    }

    const campaigns = await db.query.campaigns.findMany({
      where: eq(schema.campaigns.brandId, brandProfile.id),
      orderBy: [desc(schema.campaigns.createdAt)],
      with: {
        brand: {
          with: {
            profile: true,
          },
        },
      },
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Get single campaign
campaignsRouter.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const campaign = await db.query.campaigns.findFirst({
      where: eq(schema.campaigns.id, req.params.id),
      with: {
        brand: {
          with: {
            profile: true,
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to get campaign' });
  }
});

// Create campaign
campaignsRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    if (!brandProfile) {
      return res.status(400).json({ error: 'Brand profile required' });
    }

    const [campaign] = await db.insert(schema.campaigns)
      .values({
        brandId: brandProfile.id,
        ...req.body,
      })
      .returning();

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Update campaign
campaignsRouter.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id, ...updates } = req.body;

    const [updated] = await db.update(schema.campaigns)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(schema.campaigns.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Delete campaign
campaignsRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await db.delete(schema.campaigns)
      .where(eq(schema.campaigns.id, req.params.id));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

