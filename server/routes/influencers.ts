import { Router } from 'express';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import { optionalAuthMiddleware } from '../middleware/auth';

export const influencersRouter = Router();

// Get all influencers with filters
influencersRouter.get('/', optionalAuthMiddleware, async (req, res) => {
  try {
    const { 
      search, 
      niche, 
      platform, 
      minFollowers, 
      minEngagement,
      sortBy = 'followers',
      sortOrder = 'desc' 
    } = req.query;

    let influencers = await db.query.influencerProfiles.findMany({
      with: {
        profile: true,
      },
    });

    // Apply filters in memory (for flexibility)
    let filtered = influencers;

    // Niche filter
    if (niche && niche !== 'all') {
      filtered = filtered.filter(inf => 
        inf.niche?.some(n => n.toLowerCase() === (niche as string).toLowerCase())
      );
    }

    // Platform filter
    if (platform && platform !== 'all') {
      filtered = filtered.filter(inf => {
        switch (platform) {
          case 'instagram': return !!inf.instagramHandle;
          case 'youtube': return !!inf.youtubeHandle;
          case 'twitter': return !!inf.twitterHandle;
          case 'tiktok': return !!inf.tiktokHandle;
          default: return true;
        }
      });
    }

    // Min followers filter
    if (minFollowers) {
      const min = parseInt(minFollowers as string);
      filtered = filtered.filter(inf => 
        (inf.instagramFollowers || 0) >= min ||
        (inf.youtubeSubscribers || 0) >= min ||
        (inf.twitterFollowers || 0) >= min ||
        (inf.tiktokFollowers || 0) >= min
      );
    }

    // Min engagement filter
    if (minEngagement) {
      const min = parseFloat(minEngagement as string);
      filtered = filtered.filter(inf => 
        (parseFloat(inf.engagementRate?.toString() || '0')) >= min
      );
    }

    // Search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filtered = filtered.filter(inf =>
        inf.profile?.fullName?.toLowerCase().includes(searchLower) ||
        inf.bio?.toLowerCase().includes(searchLower) ||
        inf.niche?.some(n => n.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    const order = sortOrder === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return ((parseFloat(b.rating?.toString() || '0')) - (parseFloat(a.rating?.toString() || '0'))) * order;
        case 'engagement':
          return ((parseFloat(b.engagementRate?.toString() || '0')) - (parseFloat(a.engagementRate?.toString() || '0'))) * order;
        default: // followers
          const aFollowers = Math.max(
            a.instagramFollowers || 0,
            a.youtubeSubscribers || 0,
            a.twitterFollowers || 0,
            a.tiktokFollowers || 0
          );
          const bFollowers = Math.max(
            b.instagramFollowers || 0,
            b.youtubeSubscribers || 0,
            b.twitterFollowers || 0,
            b.tiktokFollowers || 0
          );
          return (bFollowers - aFollowers) * order;
      }
    });

    // Transform to match expected format
    const result = filtered.map(inf => ({
      ...inf,
      profiles: inf.profile, // Match Supabase format
    }));

    res.json(result);
  } catch (error) {
    console.error('Get influencers error:', error);
    res.status(500).json({ error: 'Failed to get influencers' });
  }
});

// Get single influencer
influencersRouter.get('/:id', optionalAuthMiddleware, async (req, res) => {
  try {
    const influencer = await db.query.influencerProfiles.findFirst({
      where: eq(schema.influencerProfiles.id, req.params.id),
      with: {
        profile: true,
      },
    });

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // Transform to match expected format
    res.json({
      ...influencer,
      profiles: influencer.profile,
    });
  } catch (error) {
    console.error('Get influencer error:', error);
    res.status(500).json({ error: 'Failed to get influencer' });
  }
});

