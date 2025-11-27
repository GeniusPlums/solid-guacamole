import { Router } from 'express';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const profilesRouter = Router();

// Get current user's profile with brand/influencer details
profilesRouter.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(schema.profiles.id, req.user!.id),
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    let brandProfile = null;
    let influencerProfile = null;

    if (profile.userType === 'brand') {
      brandProfile = await db.query.brandProfiles.findFirst({
        where: eq(schema.brandProfiles.userId, profile.id),
      });
    } else if (profile.userType === 'influencer') {
      influencerProfile = await db.query.influencerProfiles.findFirst({
        where: eq(schema.influencerProfiles.userId, profile.id),
      });
    }

    res.json({
      profile,
      brandProfile,
      influencerProfile,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update profile
profilesRouter.patch('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { fullName, avatarUrl } = req.body;
    
    const [updatedProfile] = await db.update(schema.profiles)
      .set({
        fullName: fullName || undefined,
        avatarUrl: avatarUrl || undefined,
        updatedAt: new Date(),
      })
      .where(eq(schema.profiles.id, req.user!.id))
      .returning();

    res.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Create or update brand profile
profilesRouter.post('/brand', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { companyName, description, industry, website, logoUrl } = req.body;

    // Check if brand profile exists
    const existing = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    if (existing) {
      // Update
      const [updated] = await db.update(schema.brandProfiles)
        .set({
          companyName: companyName || existing.companyName,
          description: description !== undefined ? description : existing.description,
          industry: industry !== undefined ? industry : existing.industry,
          website: website !== undefined ? website : existing.website,
          logoUrl: logoUrl !== undefined ? logoUrl : existing.logoUrl,
          updatedAt: new Date(),
        })
        .where(eq(schema.brandProfiles.id, existing.id))
        .returning();
      return res.json(updated);
    }

    // Create new
    const [newProfile] = await db.insert(schema.brandProfiles)
      .values({
        userId: req.user!.id,
        companyName,
        description,
        industry,
        website,
        logoUrl,
      })
      .returning();

    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Brand profile error:', error);
    res.status(500).json({ error: 'Failed to save brand profile' });
  }
});

// Create or update influencer profile
profilesRouter.post('/influencer', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = req.body;

    // Check if influencer profile exists
    const existing = await db.query.influencerProfiles.findFirst({
      where: eq(schema.influencerProfiles.userId, req.user!.id),
    });

    if (existing) {
      // Update
      const [updated] = await db.update(schema.influencerProfiles)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(schema.influencerProfiles.id, existing.id))
        .returning();
      return res.json(updated);
    }

    // Create new
    const [newProfile] = await db.insert(schema.influencerProfiles)
      .values({
        userId: req.user!.id,
        ...data,
      })
      .returning();

    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Influencer profile error:', error);
    res.status(500).json({ error: 'Failed to save influencer profile' });
  }
});

