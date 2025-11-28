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

    // Get brand profile for current user
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
      with: {
        profile: true,
      },
    });

    if (!brandProfile) {
      return res.status(400).json({ error: 'Brand profile required' });
    }

    // Get campaign details for the notification message
    const campaign = await db.query.campaigns.findFirst({
      where: eq(schema.campaigns.id, campaignId),
    });

    if (!campaign) {
      return res.status(400).json({ error: 'Campaign not found' });
    }

    // Get influencer profile to find their user ID for messaging
    const influencerProfile = await db.query.influencerProfiles.findFirst({
      where: eq(schema.influencerProfiles.id, influencerId),
    });

    if (!influencerProfile) {
      return res.status(400).json({ error: 'Influencer not found' });
    }

    // Create the collaboration record
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

    // Automatically create a notification message to the influencer
    const brandName = brandProfile.companyName || brandProfile.profile?.fullName || 'A brand';
    const campaignTitle = campaign.title || 'a campaign';
    const budgetInfo = offeredAmount ? ` with an offered amount of $${offeredAmount}` : '';
    const deliverablesInfo = deliverables ? `\n\nDeliverables: ${deliverables}` : '';
    const deadlineInfo = deadline ? `\nDeadline: ${new Date(deadline).toLocaleDateString()}` : '';
    const notesInfo = notes ? `\n\nMessage from brand: ${notes}` : '';

    const messageContent = `🎉 New Collaboration Request!\n\n${brandName} has invited you to collaborate on "${campaignTitle}"${budgetInfo}.${deliverablesInfo}${deadlineInfo}${notesInfo}\n\nPlease review and respond to this request in your Collaborations page.`;

    await db.insert(schema.messages).values({
      fromUserId: brandProfile.userId, // Brand's profile/user ID
      toUserId: influencerProfile.userId, // Influencer's profile/user ID
      collaborationId: collaboration.id,
      content: messageContent,
      read: false,
    });

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

    // Get the current collaboration with related data before updating
    const existingCollab = await db.query.collaborations.findFirst({
      where: eq(schema.collaborations.id, req.params.id),
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

    if (!existingCollab) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    const [updated] = await db.update(schema.collaborations)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(schema.collaborations.id, req.params.id))
      .returning();

    // Determine who is updating the status and who should receive the notification
    const currentUserId = req.user!.id;
    const isInfluencer = existingCollab.influencer?.userId === currentUserId;
    const isBrand = existingCollab.brand?.userId === currentUserId;

    // Create notification message for status changes
    if (status && existingCollab.campaign) {
      const campaignTitle = existingCollab.campaign.title || 'the campaign';
      let messageContent = '';
      let fromUserId = '';
      let toUserId = '';

      if (isInfluencer && existingCollab.brand && existingCollab.influencer) {
        // Influencer is responding to the brand
        fromUserId = existingCollab.influencer.userId;
        toUserId = existingCollab.brand.userId;
        const influencerName = existingCollab.influencer.profile?.fullName || 'The influencer';

        if (status === 'accepted') {
          messageContent = `✅ Great news! ${influencerName} has accepted your collaboration request for "${campaignTitle}".\n\nYou can now start coordinating the campaign details.`;
        } else if (status === 'rejected') {
          messageContent = `❌ ${influencerName} has declined your collaboration request for "${campaignTitle}".\n\nYou may want to reach out to other influencers for this campaign.`;
        } else if (status === 'completed') {
          messageContent = `🎉 ${influencerName} has marked the collaboration for "${campaignTitle}" as completed.\n\nPlease review the deliverables and consider leaving a rating.`;
        }
      } else if (isBrand && existingCollab.brand && existingCollab.influencer) {
        // Brand is updating status (e.g., cancelling, completing)
        fromUserId = existingCollab.brand.userId;
        toUserId = existingCollab.influencer.userId;
        const brandName = existingCollab.brand.companyName || existingCollab.brand.profile?.fullName || 'The brand';

        if (status === 'cancelled') {
          messageContent = `⚠️ ${brandName} has cancelled the collaboration for "${campaignTitle}".\n\nIf you have any questions, please reach out to them directly.`;
        } else if (status === 'completed') {
          messageContent = `🎉 ${brandName} has marked your collaboration for "${campaignTitle}" as completed.\n\nThank you for your work! Consider leaving a rating for the brand.`;
        }
      }

      // Only send message if we have valid content and user IDs
      if (messageContent && fromUserId && toUserId) {
        await db.insert(schema.messages).values({
          fromUserId,
          toUserId,
          collaborationId: updated.id,
          content: messageContent,
          read: false,
        });
      }
    }

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

