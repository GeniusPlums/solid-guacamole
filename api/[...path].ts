import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, or, desc, asc } from 'drizzle-orm';
import * as schema from './_schema';

// Database setup
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Create Express app
const app = express();

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowed = ['http://localhost:8080', 'http://localhost:5173', 'https://icy-connect-phi.vercel.app'];
    if (!origin || allowed.includes(origin) || origin?.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now
    }
  },
  credentials: true,
}));
app.use(express.json());

// Auth middleware
interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = authHeader.substring(7);
    req.user = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName, userType } = req.body;
    if (!email || !password || !fullName || !userType) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const existing = await db.query.profiles.findFirst({ where: eq(schema.profiles.email, email) });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const [profile] = await db.insert(schema.profiles).values({ email, passwordHash, fullName, userType }).returning();
    
    if (userType === 'brand') {
      await db.insert(schema.brandProfiles).values({ userId: profile.id });
    } else {
      await db.insert(schema.influencerProfiles).values({ userId: profile.id });
    }
    
    const token = jwt.sign({ userId: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, session: { user: { id: profile.id, email: profile.email }, token, expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString() }});
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const profile = await db.query.profiles.findFirst({ where: eq(schema.profiles.email, email) });
    if (!profile?.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, profile.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // Fetch brand and influencer profiles in parallel for faster response
    const [brandProfile, influencerProfile] = await Promise.all([
      db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, profile.id) }),
      db.query.influencerProfiles.findFirst({ where: eq(schema.influencerProfiles.userId, profile.id) })
    ]);

    const token = jwt.sign({ userId: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      session: {
        user: {
          id: profile.id,
          email: profile.email,
          profile: {
            id: profile.id,
            email: profile.email,
            fullName: profile.fullName,
            userType: profile.userType,
            avatarUrl: profile.avatarUrl
          }
        },
        token,
        expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString()
      },
      brandProfile,
      influencerProfile
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

app.get('/api/auth/session', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const profile = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, req.user!.userId) });
    if (!profile) return res.status(401).json({ error: 'User not found' });
    res.json({ user: { id: profile.id, email: profile.email } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Profiles routes
app.get('/api/profiles/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const profile = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, req.user!.userId) });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    const influencerProfile = await db.query.influencerProfiles.findFirst({ where: eq(schema.influencerProfiles.userId, req.user!.userId) });
    
    res.json({
      profile: { id: profile.id, email: profile.email, fullName: profile.fullName, userType: profile.userType, avatarUrl: profile.avatarUrl },
      brandProfile,
      influencerProfile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

app.patch('/api/profiles/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { fullName, avatarUrl } = req.body;
    await db.update(schema.profiles).set({ fullName, avatarUrl, updatedAt: new Date() }).where(eq(schema.profiles.id, req.user!.userId));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/profiles/brand', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const existing = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    if (existing) {
      await db.update(schema.brandProfiles).set(data).where(eq(schema.brandProfiles.userId, req.user!.userId));
    } else {
      await db.insert(schema.brandProfiles).values({ userId: req.user!.userId, ...data });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save brand profile' });
  }
});

app.post('/api/profiles/influencer', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const existing = await db.query.influencerProfiles.findFirst({ where: eq(schema.influencerProfiles.userId, req.user!.userId) });
    if (existing) {
      await db.update(schema.influencerProfiles).set(data).where(eq(schema.influencerProfiles.userId, req.user!.userId));
    } else {
      await db.insert(schema.influencerProfiles).values({ userId: req.user!.userId, ...data });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save influencer profile' });
  }
});

// Helper function to calculate profile completion percentage
function calculateInfluencerProfileCompletion(influencer: any): number {
  let completed = 0;
  const total = 6; // Total checkpoints for profile completion

  if (influencer.bio) completed++;
  if (influencer.niche && influencer.niche.length > 0) completed++;
  if (influencer.location) completed++;
  // At least one social platform with followers
  const hasAnySocial = (influencer.instagramFollowers || 0) > 0 ||
                       (influencer.youtubeSubscribers || 0) > 0 ||
                       (influencer.twitterFollowers || 0) > 0 ||
                       (influencer.tiktokFollowers || 0) > 0;
  if (hasAnySocial) completed++;
  // Has engagement rate
  if (influencer.engagementRate) completed++;
  // Has at least one handle
  const hasHandle = influencer.instagramHandle || influencer.youtubeHandle ||
                    influencer.twitterHandle || influencer.tiktokHandle;
  if (hasHandle) completed++;

  return Math.round((completed / total) * 100);
}

// Influencers
app.get('/api/influencers', async (req, res) => {
  try {
    let influencers = await db.query.influencerProfiles.findMany({ with: { profile: true } });
    const { search, niche, platform, minProfileCompletion } = req.query;

    // Apply profile completion filter (default: 50% minimum)
    const minCompletion = minProfileCompletion ? parseInt(String(minProfileCompletion)) : 50;
    influencers = influencers.filter(i => calculateInfluencerProfileCompletion(i) >= minCompletion);

    if (search) {
      const s = String(search).toLowerCase();
      influencers = influencers.filter(i => i.profile?.fullName?.toLowerCase().includes(s) || i.bio?.toLowerCase().includes(s));
    }
    if (niche) {
      influencers = influencers.filter(i => i.niche?.some(n => n.toLowerCase().includes(String(niche).toLowerCase())));
    }
    if (platform) {
      const p = String(platform).toLowerCase();
      influencers = influencers.filter(i => {
        if (p === 'instagram') return (i.instagramFollowers || 0) > 0;
        if (p === 'youtube') return (i.youtubeSubscribers || 0) > 0;
        return true;
      });
    }

    res.json(influencers.map(i => ({
      id: i.id, bio: i.bio, niche: i.niche, instagramHandle: i.instagramHandle, instagramFollowers: i.instagramFollowers,
      youtubeHandle: i.youtubeHandle, youtubeSubscribers: i.youtubeSubscribers, twitterHandle: i.twitterHandle, twitterFollowers: i.twitterFollowers,
      engagementRate: i.engagementRate ? parseFloat(i.engagementRate.toString()) : null,
      rating: i.rating ? parseFloat(i.rating.toString()) : null, location: i.location,
      profileCompletion: calculateInfluencerProfileCompletion(i),
      profile: i.profile ? { fullName: i.profile.fullName, avatarUrl: i.profile.avatarUrl } : null,
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get influencers' });
  }
});

app.get('/api/influencers/:id', async (req, res) => {
  try {
    const influencer = await db.query.influencerProfiles.findFirst({ where: eq(schema.influencerProfiles.id, req.params.id), with: { profile: true } });
    if (!influencer) return res.status(404).json({ error: 'Not found' });
    res.json({
      ...influencer,
      engagementRate: influencer.engagementRate ? parseFloat(influencer.engagementRate.toString()) : null,
      rating: influencer.rating ? parseFloat(influencer.rating.toString()) : null,
      contentSamples: influencer.contentSamples || [],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get influencer' });
  }
});

// Campaigns
app.get('/api/campaigns', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    if (!brandProfile) return res.status(403).json({ error: 'Brand profile required' });
    const campaigns = await db.query.campaigns.findMany({ where: eq(schema.campaigns.brandId, brandProfile.id), orderBy: [desc(schema.campaigns.createdAt)] });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Public campaigns endpoint for influencers to discover available campaigns
app.get('/api/campaigns/discover', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { search, niche, minBudget, maxBudget } = req.query;

    // Get all active campaigns with brand info
    let campaigns = await db.query.campaigns.findMany({
      where: eq(schema.campaigns.status, 'active'),
      orderBy: [desc(schema.campaigns.createdAt)],
      with: { brand: { with: { profile: true } } },
    });

    // Apply filters
    if (search) {
      const s = String(search).toLowerCase();
      campaigns = campaigns.filter(c =>
        c.title?.toLowerCase().includes(s) ||
        c.description?.toLowerCase().includes(s)
      );
    }

    if (niche) {
      campaigns = campaigns.filter(c =>
        c.targetNiche?.some(n => n.toLowerCase().includes(String(niche).toLowerCase()))
      );
    }

    if (minBudget) {
      campaigns = campaigns.filter(c =>
        parseFloat(c.budget?.toString() || '0') >= parseFloat(String(minBudget))
      );
    }

    if (maxBudget) {
      campaigns = campaigns.filter(c =>
        parseFloat(c.budget?.toString() || '0') <= parseFloat(String(maxBudget))
      );
    }

    res.json(campaigns.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      budget: c.budget ? parseFloat(c.budget.toString()) : null,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      targetPlatforms: c.targetPlatforms,
      targetNiche: c.targetNiche,
      minFollowers: c.minFollowers,
      maxFollowers: c.maxFollowers,
      targetEngagementRate: c.targetEngagementRate ? parseFloat(c.targetEngagementRate.toString()) : null,
      createdAt: c.createdAt,
      brand: c.brand ? {
        id: c.brand.id,
        companyName: c.brand.companyName,
        industry: c.brand.industry,
        logoUrl: c.brand.logoUrl,
        profile: c.brand.profile ? {
          fullName: c.brand.profile.fullName,
          avatarUrl: c.brand.profile.avatarUrl,
        } : null,
      } : null,
    })));
  } catch (error) {
    console.error('Campaign discovery error:', error);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

app.post('/api/campaigns', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    if (!brandProfile) return res.status(403).json({ error: 'Brand profile required' });
    const [campaign] = await db.insert(schema.campaigns).values({ brandId: brandProfile.id, ...req.body, status: 'active' }).returning();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

app.get('/api/campaigns/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const campaign = await db.query.campaigns.findFirst({ where: eq(schema.campaigns.id, req.params.id) });
    if (!campaign) return res.status(404).json({ error: 'Not found' });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get campaign' });
  }
});

app.patch('/api/campaigns/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await db.update(schema.campaigns).set({ ...req.body, updatedAt: new Date() }).where(eq(schema.campaigns.id, req.params.id));
    const campaign = await db.query.campaigns.findFirst({ where: eq(schema.campaigns.id, req.params.id) });
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// Collaborations
app.get('/api/collaborations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    const influencerProfile = await db.query.influencerProfiles.findFirst({ where: eq(schema.influencerProfiles.userId, req.user!.userId) });

    let collaborations;
    if (brandProfile) {
      collaborations = await db.query.collaborations.findMany({ where: eq(schema.collaborations.brandId, brandProfile.id), orderBy: [desc(schema.collaborations.createdAt)], with: { influencer: { with: { profile: true } }, campaign: true } });
    } else if (influencerProfile) {
      collaborations = await db.query.collaborations.findMany({ where: eq(schema.collaborations.influencerId, influencerProfile.id), orderBy: [desc(schema.collaborations.createdAt)], with: { brand: { with: { profile: true } }, campaign: true } });
    } else {
      return res.json([]);
    }
    res.json(collaborations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get collaborations' });
  }
});

app.post('/api/collaborations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.userId),
      with: { profile: true },
    });
    if (!brandProfile) return res.status(403).json({ error: 'Brand profile required' });

    // Validate required fields
    const { campaignId, influencerId, offeredAmount, deliverables, deadline, notes } = req.body;
    if (!campaignId) return res.status(400).json({ error: 'Campaign ID is required' });
    if (!influencerId) return res.status(400).json({ error: 'Influencer ID is required' });

    // Get campaign details for the notification message
    const campaign = await db.query.campaigns.findFirst({ where: eq(schema.campaigns.id, campaignId) });
    if (!campaign) return res.status(400).json({ error: 'Campaign not found' });

    // Get influencer profile to find their user ID for messaging
    const influencerProfile = await db.query.influencerProfiles.findFirst({ where: eq(schema.influencerProfiles.id, influencerId) });
    if (!influencerProfile) return res.status(400).json({ error: 'Influencer not found' });

    // Create collaboration with validated fields
    const [collab] = await db.insert(schema.collaborations).values({
      brandId: brandProfile.id,
      campaignId,
      influencerId,
      offeredAmount: offeredAmount || null,
      deliverables: deliverables || null,
      deadline: deadline ? new Date(deadline) : null,
      notes: notes || null,
      status: 'pending',
    }).returning();

    // Automatically create a notification message to the influencer
    const brandName = brandProfile.companyName || brandProfile.profile?.fullName || 'A brand';
    const campaignTitle = campaign.title || 'a campaign';
    const budgetInfo = offeredAmount ? ` with an offered amount of $${offeredAmount}` : '';
    const deliverablesInfo = deliverables ? `\n\nDeliverables: ${deliverables}` : '';
    const deadlineInfo = deadline ? `\nDeadline: ${new Date(deadline).toLocaleDateString()}` : '';
    const notesInfo = notes ? `\n\nMessage from brand: ${notes}` : '';

    const messageContent = `🎉 New Collaboration Request!\n\n${brandName} has invited you to collaborate on "${campaignTitle}"${budgetInfo}.${deliverablesInfo}${deadlineInfo}${notesInfo}\n\nPlease review and respond to this request in your Collaborations page.`;

    await db.insert(schema.messages).values({
      fromUserId: brandProfile.userId,
      toUserId: influencerProfile.userId,
      collaborationId: collab.id,
      content: messageContent,
      read: false,
    });

    res.status(201).json(collab);
  } catch (error: any) {
    console.error('Collaboration creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create collaboration' });
  }
});

app.patch('/api/collaborations/:id/status', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    // Get the current collaboration with related data before updating
    const existingCollab = await db.query.collaborations.findFirst({
      where: eq(schema.collaborations.id, req.params.id),
      with: {
        campaign: true,
        influencer: { with: { profile: true } },
        brand: { with: { profile: true } },
      },
    });

    if (!existingCollab) return res.status(404).json({ error: 'Collaboration not found' });

    const [updated] = await db.update(schema.collaborations)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.collaborations.id, req.params.id))
      .returning();

    // Determine who is updating the status and who should receive the notification
    const currentUserId = req.user!.userId;
    const isInfluencer = existingCollab.influencer?.userId === currentUserId;
    const isBrand = existingCollab.brand?.userId === currentUserId;

    // Create notification message for status changes
    if (status && existingCollab.campaign) {
      const campaignTitle = existingCollab.campaign.title || 'the campaign';
      let messageContent = '';
      let fromUserId = '';
      let toUserId = '';

      if (isInfluencer && existingCollab.brand && existingCollab.influencer) {
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
        fromUserId = existingCollab.brand.userId;
        toUserId = existingCollab.influencer.userId;
        const brandName = existingCollab.brand.companyName || existingCollab.brand.profile?.fullName || 'The brand';

        if (status === 'cancelled') {
          messageContent = `⚠️ ${brandName} has cancelled the collaboration for "${campaignTitle}".\n\nIf you have any questions, please reach out to them directly.`;
        } else if (status === 'completed') {
          messageContent = `🎉 ${brandName} has marked your collaboration for "${campaignTitle}" as completed.\n\nThank you for your work! Consider leaving a rating for the brand.`;
        }
      }

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

app.patch('/api/collaborations/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await db.update(schema.collaborations).set({ ...req.body, updatedAt: new Date() }).where(eq(schema.collaborations.id, req.params.id));
    const collab = await db.query.collaborations.findFirst({ where: eq(schema.collaborations.id, req.params.id) });
    res.json(collab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update collaboration' });
  }
});

// Messages
app.get('/api/messages/conversations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const messages = await db.query.messages.findMany({ where: or(eq(schema.messages.fromUserId, req.user!.userId), eq(schema.messages.toUserId, req.user!.userId)), orderBy: [desc(schema.messages.createdAt)] });
    const conversationMap = new Map();
    for (const msg of messages) {
      const partnerId = msg.fromUserId === req.user!.userId ? msg.toUserId : msg.fromUserId;
      if (!conversationMap.has(partnerId)) {
        const partner = await db.query.profiles.findFirst({ where: eq(schema.profiles.id, partnerId) });
        const unread = messages.filter(m => m.fromUserId === partnerId && m.toUserId === req.user!.userId && !m.read).length;
        conversationMap.set(partnerId, { id: partnerId, recipientId: partnerId, recipientName: partner?.fullName || 'Unknown', recipientAvatar: partner?.avatarUrl, lastMessage: msg.content, lastMessageAt: msg.createdAt, unreadCount: unread });
      }
    }
    res.json(Array.from(conversationMap.values()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

app.get('/api/messages/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const messages = await db.query.messages.findMany({ where: or(and(eq(schema.messages.fromUserId, req.user!.userId), eq(schema.messages.toUserId, req.params.userId)), and(eq(schema.messages.fromUserId, req.params.userId), eq(schema.messages.toUserId, req.user!.userId))), orderBy: [asc(schema.messages.createdAt)] });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

app.post('/api/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { toUserId, content } = req.body;
    const [message] = await db.insert(schema.messages).values({ fromUserId: req.user!.userId, toUserId, content }).returning();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.patch('/api/messages/read/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await db.update(schema.messages).set({ read: true }).where(and(eq(schema.messages.fromUserId, req.params.userId), eq(schema.messages.toUserId, req.user!.userId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Analytics
app.get('/api/analytics/brand', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    if (!brandProfile) return res.json({ summary: { totalCampaigns: 0, activeCampaigns: 0, totalSpend: 0, activeCollabs: 0, pendingCollabs: 0, completedCollabs: 0, totalCollabs: 0 }, monthlyData: [], nicheDistribution: [], campaignPerformance: [] });

    const campaigns = await db.query.campaigns.findMany({ where: eq(schema.campaigns.brandId, brandProfile.id) });
    const collaborations = await db.query.collaborations.findMany({ where: eq(schema.collaborations.brandId, brandProfile.id), with: { influencer: true } });

    const totalSpend = collaborations.filter(c => c.status === 'completed').reduce((sum, c) => sum + parseFloat(c.offeredAmount?.toString() || '0'), 0);
    res.json({
      summary: { totalCampaigns: campaigns.length, activeCampaigns: campaigns.filter(c => c.status === 'active').length, totalSpend, activeCollabs: collaborations.filter(c => c.status === 'accepted').length, pendingCollabs: collaborations.filter(c => c.status === 'pending').length, completedCollabs: collaborations.filter(c => c.status === 'completed').length, totalCollabs: collaborations.length },
      monthlyData: [], nicheDistribution: [], campaignPerformance: campaigns.slice(0, 5).map(c => ({ name: c.title?.substring(0, 12) || 'Untitled', spend: parseFloat(c.budget?.toString() || '0') }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

app.get('/api/analytics/influencer', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const influencerProfile = await db.query.influencerProfiles.findFirst({ where: eq(schema.influencerProfiles.userId, req.user!.userId) });
    if (!influencerProfile) return res.json({ summary: { totalFollowers: 0, engagementRate: 0, totalEarnings: 0, completedCollabs: 0, activeCollabs: 0, pendingCollabs: 0, rating: 0 }, monthlyData: [], platformDistribution: [] });

    const collaborations = await db.query.collaborations.findMany({ where: eq(schema.collaborations.influencerId, influencerProfile.id) });
    const totalFollowers = (influencerProfile.instagramFollowers || 0) + (influencerProfile.youtubeSubscribers || 0) + (influencerProfile.twitterFollowers || 0);
    const totalEarnings = collaborations.filter(c => c.status === 'completed').reduce((sum, c) => sum + parseFloat(c.offeredAmount?.toString() || '0'), 0);

    res.json({
      summary: { totalFollowers, engagementRate: parseFloat(influencerProfile.engagementRate?.toString() || '0'), totalEarnings, completedCollabs: collaborations.filter(c => c.status === 'completed').length, activeCollabs: collaborations.filter(c => c.status === 'accepted').length, pendingCollabs: collaborations.filter(c => c.status === 'pending').length, rating: parseFloat(influencerProfile.rating?.toString() || '0') },
      monthlyData: [], platformDistribution: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Shortlists
app.get('/api/shortlists', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    if (!brandProfile) return res.json([]);
    const shortlists = await db.query.shortlists.findMany({ where: eq(schema.shortlists.brandId, brandProfile.id), with: { influencer: { with: { profile: true } } }, orderBy: [desc(schema.shortlists.createdAt)] });
    res.json(shortlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get shortlists' });
  }
});

app.post('/api/shortlists', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    if (!brandProfile) return res.status(403).json({ error: 'Brand profile required' });
    const { influencerId, notes } = req.body;
    const existing = await db.query.shortlists.findFirst({ where: and(eq(schema.shortlists.brandId, brandProfile.id), eq(schema.shortlists.influencerId, influencerId)) });
    if (existing) return res.status(400).json({ error: 'Already shortlisted' });
    const [shortlist] = await db.insert(schema.shortlists).values({ brandId: brandProfile.id, influencerId, notes }).returning();
    res.status(201).json(shortlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to shortlist' });
  }
});

app.delete('/api/shortlists/:influencerId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    if (!brandProfile) return res.status(403).json({ error: 'Brand profile required' });
    await db.delete(schema.shortlists).where(and(eq(schema.shortlists.brandId, brandProfile.id), eq(schema.shortlists.influencerId, req.params.influencerId)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from shortlist' });
  }
});

app.get('/api/shortlists/check/:influencerId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    if (!brandProfile) return res.json({ isShortlisted: false });
    const shortlist = await db.query.shortlists.findFirst({ where: and(eq(schema.shortlists.brandId, brandProfile.id), eq(schema.shortlists.influencerId, req.params.influencerId)) });
    res.json({ isShortlisted: !!shortlist });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check shortlist' });
  }
});

// Export handler
export default (req: VercelRequest, res: VercelResponse) => {
  // @ts-ignore
  return app(req, res);
};

