import { VercelRequest, VercelResponse } from '@vercel/node';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, or, desc, asc } from 'drizzle-orm';
import * as schema from '../src/db/schema';

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
    
    const token = jwt.sign({ userId: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, session: { user: { id: profile.id, email: profile.email }, token, expiresAt: new Date(Date.now() + 7*24*60*60*1000).toISOString() }});
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

// Influencers
app.get('/api/influencers', async (req, res) => {
  try {
    let influencers = await db.query.influencerProfiles.findMany({ with: { profile: true } });
    const { search, niche, platform } = req.query;

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
    res.json({ ...influencer, engagementRate: influencer.engagementRate ? parseFloat(influencer.engagementRate.toString()) : null });
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
    const brandProfile = await db.query.brandProfiles.findFirst({ where: eq(schema.brandProfiles.userId, req.user!.userId) });
    if (!brandProfile) return res.status(403).json({ error: 'Brand profile required' });
    const [collab] = await db.insert(schema.collaborations).values({ brandId: brandProfile.id, ...req.body, status: 'pending' }).returning();
    res.status(201).json(collab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create collaboration' });
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
        const unread = messages.filter(m => m.fromUserId === partnerId && m.toUserId === req.user!.userId && !m.isRead).length;
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
    await db.update(schema.messages).set({ isRead: true }).where(and(eq(schema.messages.fromUserId, req.params.userId), eq(schema.messages.toUserId, req.user!.userId)));
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

