import { Router } from 'express';
import { db, schema } from '../db';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const analyticsRouter = Router();

// Get brand analytics
analyticsRouter.get('/brand', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, req.user!.id),
    });

    if (!brandProfile) {
      return res.json({ campaigns: [], collaborations: [], monthlyData: [], nicheDistribution: [] });
    }

    // Get all campaigns
    const campaigns = await db.query.campaigns.findMany({
      where: eq(schema.campaigns.brandId, brandProfile.id),
      orderBy: [desc(schema.campaigns.createdAt)],
    });

    // Get all collaborations with influencer data
    const collaborations = await db.query.collaborations.findMany({
      where: eq(schema.collaborations.brandId, brandProfile.id),
      orderBy: [desc(schema.collaborations.createdAt)],
      with: {
        influencer: true,
        campaign: true,
      },
    });

    // Calculate monthly spend from collaborations
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthCollabs = collaborations.filter(c => {
        const created = new Date(c.createdAt);
        return created >= monthStart && created <= monthEnd;
      });

      const spend = monthCollabs.reduce((sum, c) => sum + (parseFloat(c.offeredAmount?.toString() || '0')), 0);
      const completed = monthCollabs.filter(c => c.status === 'completed').length;

      monthlyData.push({
        month: monthName,
        spend,
        collaborations: monthCollabs.length,
        completed,
      });
    }

    // Calculate niche distribution from collaborations
    const nicheCount: Record<string, number> = {};
    collaborations.forEach(c => {
      if (c.influencer?.niche) {
        c.influencer.niche.forEach(n => {
          nicheCount[n] = (nicheCount[n] || 0) + 1;
        });
      }
    });

    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
    const nicheDistribution = Object.entries(nicheCount)
      .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Campaign performance
    const campaignPerformance = campaigns.slice(0, 6).map(c => {
      const campaignCollabs = collaborations.filter(col => col.campaignId === c.id);
      const spend = parseFloat(c.budget?.toString() || '0');
      const completed = campaignCollabs.filter(col => col.status === 'completed').length;
      return {
        name: c.title?.substring(0, 15) || 'Untitled',
        spend,
        collaborations: campaignCollabs.length,
        completed,
      };
    });

    // Summary stats
    const totalSpend = collaborations
      .filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + parseFloat(c.offeredAmount?.toString() || '0'), 0);

    const activeCollabs = collaborations.filter(c => c.status === 'accepted').length;
    const pendingCollabs = collaborations.filter(c => c.status === 'pending').length;
    const completedCollabs = collaborations.filter(c => c.status === 'completed').length;

    res.json({
      summary: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalSpend,
        activeCollabs,
        pendingCollabs,
        completedCollabs,
        totalCollabs: collaborations.length,
      },
      monthlyData,
      nicheDistribution,
      campaignPerformance,
    });
  } catch (error) {
    console.error('Brand analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get influencer analytics
analyticsRouter.get('/influencer', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const influencerProfile = await db.query.influencerProfiles.findFirst({
      where: eq(schema.influencerProfiles.userId, req.user!.id),
    });

    if (!influencerProfile) {
      return res.json({ collaborations: [], monthlyData: [], platformDistribution: [] });
    }

    const collaborations = await db.query.collaborations.findMany({
      where: eq(schema.collaborations.influencerId, influencerProfile.id),
      orderBy: [desc(schema.collaborations.createdAt)],
      with: { brand: true, campaign: true },
    });

    // Monthly earnings
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthCollabs = collaborations.filter(c => {
        const created = new Date(c.createdAt);
        return created >= monthStart && created <= monthEnd && c.status === 'completed';
      });

      const earnings = monthCollabs.reduce((sum, c) => sum + parseFloat(c.offeredAmount?.toString() || '0'), 0);
      monthlyData.push({ month: monthName, earnings, collaborations: monthCollabs.length });
    }

    // Platform distribution from profile
    const platformData = [];
    if (influencerProfile.instagramFollowers) platformData.push({ name: 'Instagram', value: influencerProfile.instagramFollowers, color: '#E1306C' });
    if (influencerProfile.youtubeSubscribers) platformData.push({ name: 'YouTube', value: influencerProfile.youtubeSubscribers, color: '#FF0000' });
    if (influencerProfile.tiktokFollowers) platformData.push({ name: 'TikTok', value: influencerProfile.tiktokFollowers, color: '#000000' });
    if (influencerProfile.twitterFollowers) platformData.push({ name: 'Twitter', value: influencerProfile.twitterFollowers, color: '#1DA1F2' });

    const totalEarnings = collaborations.filter(c => c.status === 'completed').reduce((sum, c) => sum + parseFloat(c.offeredAmount?.toString() || '0'), 0);
    const totalFollowers = (influencerProfile.instagramFollowers || 0) + (influencerProfile.youtubeSubscribers || 0) + (influencerProfile.twitterFollowers || 0) + (influencerProfile.tiktokFollowers || 0);

    res.json({
      summary: {
        totalFollowers,
        engagementRate: parseFloat(influencerProfile.engagementRate?.toString() || '0'),
        totalEarnings,
        completedCollabs: collaborations.filter(c => c.status === 'completed').length,
        activeCollabs: collaborations.filter(c => c.status === 'accepted').length,
        pendingCollabs: collaborations.filter(c => c.status === 'pending').length,
        rating: parseFloat(influencerProfile.rating?.toString() || '0'),
      },
      monthlyData,
      platformDistribution: platformData,
    });
  } catch (error) {
    console.error('Influencer analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

