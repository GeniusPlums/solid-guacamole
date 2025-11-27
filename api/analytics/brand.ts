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
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(schema.brandProfiles.userId, payload.userId),
    });

    if (!brandProfile) {
      return res.json({
        summary: { totalCampaigns: 0, activeCampaigns: 0, totalSpend: 0, activeCollabs: 0, pendingCollabs: 0, completedCollabs: 0, totalCollabs: 0 },
        monthlyData: [],
        nicheDistribution: [],
        campaignPerformance: [],
      });
    }

    const campaigns = await db.query.campaigns.findMany({
      where: eq(schema.campaigns.brandId, brandProfile.id),
    });

    const collaborations = await db.query.collaborations.findMany({
      where: eq(schema.collaborations.brandId, brandProfile.id),
      with: { influencer: true, campaign: true },
    });

    // Monthly data
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

      const spend = monthCollabs.reduce((sum, c) => sum + parseFloat(c.offeredAmount?.toString() || '0'), 0);
      monthlyData.push({
        month: monthName,
        spend,
        collaborations: monthCollabs.length,
        completed: monthCollabs.filter(c => c.status === 'completed').length,
      });
    }

    // Niche distribution
    const nicheCount: Record<string, number> = {};
    collaborations.forEach(c => {
      c.influencer?.niche?.forEach(n => {
        nicheCount[n] = (nicheCount[n] || 0) + 1;
      });
    });
    const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
    const nicheDistribution = Object.entries(nicheCount)
      .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
      .slice(0, 5);

    // Campaign performance
    const campaignPerformance = campaigns.slice(0, 5).map(c => ({
      name: c.title?.substring(0, 12) || 'Untitled',
      spend: parseFloat(c.budget?.toString() || '0'),
    }));

    const totalSpend = collaborations.filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + parseFloat(c.offeredAmount?.toString() || '0'), 0);

    res.json({
      summary: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalSpend,
        activeCollabs: collaborations.filter(c => c.status === 'accepted').length,
        pendingCollabs: collaborations.filter(c => c.status === 'pending').length,
        completedCollabs: collaborations.filter(c => c.status === 'completed').length,
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
}

