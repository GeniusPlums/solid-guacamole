import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { verifyToken } from '../_lib/auth';
import { setCorsHeaders } from '../_lib/cors';
import { eq, desc } from 'drizzle-orm';

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
    const influencerProfile = await db.query.influencerProfiles.findFirst({
      where: eq(schema.influencerProfiles.userId, payload.userId),
    });

    if (!influencerProfile) {
      return res.json({
        summary: { totalFollowers: 0, engagementRate: 0, totalEarnings: 0, completedCollabs: 0, activeCollabs: 0, pendingCollabs: 0, rating: 0 },
        monthlyData: [],
        platformDistribution: [],
      });
    }

    const collaborations = await db.query.collaborations.findMany({
      where: eq(schema.collaborations.influencerId, influencerProfile.id),
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

    // Platform distribution
    const platformDistribution = [];
    if (influencerProfile.instagramFollowers) {
      platformDistribution.push({ name: 'Instagram', value: influencerProfile.instagramFollowers, color: '#E1306C' });
    }
    if (influencerProfile.youtubeSubscribers) {
      platformDistribution.push({ name: 'YouTube', value: influencerProfile.youtubeSubscribers, color: '#FF0000' });
    }
    if (influencerProfile.tiktokFollowers) {
      platformDistribution.push({ name: 'TikTok', value: influencerProfile.tiktokFollowers, color: '#000000' });
    }
    if (influencerProfile.twitterFollowers) {
      platformDistribution.push({ name: 'Twitter', value: influencerProfile.twitterFollowers, color: '#1DA1F2' });
    }

    const totalEarnings = collaborations.filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + parseFloat(c.offeredAmount?.toString() || '0'), 0);
    const totalFollowers = (influencerProfile.instagramFollowers || 0) + (influencerProfile.youtubeSubscribers || 0) +
      (influencerProfile.twitterFollowers || 0) + (influencerProfile.tiktokFollowers || 0);

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
      platformDistribution,
    });
  } catch (error) {
    console.error('Influencer analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
}

