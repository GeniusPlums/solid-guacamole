import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, schema } from '../_lib/db';
import { setCorsHeaders } from '../_lib/cors';
import { desc, ilike, sql } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCorsHeaders(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { search, niche, platform, minFollowers, minEngagement, sortBy } = req.query;

    let influencers = await db.query.influencerProfiles.findMany({
      with: {
        profile: true,
      },
    });

    // Apply filters
    if (search) {
      const searchLower = String(search).toLowerCase();
      influencers = influencers.filter(i => 
        i.profile?.fullName?.toLowerCase().includes(searchLower) ||
        i.bio?.toLowerCase().includes(searchLower) ||
        i.instagramHandle?.toLowerCase().includes(searchLower)
      );
    }

    if (niche) {
      influencers = influencers.filter(i => 
        i.niche?.some(n => n.toLowerCase().includes(String(niche).toLowerCase()))
      );
    }

    if (platform) {
      const p = String(platform).toLowerCase();
      influencers = influencers.filter(i => {
        if (p === 'instagram') return i.instagramFollowers && i.instagramFollowers > 0;
        if (p === 'youtube') return i.youtubeSubscribers && i.youtubeSubscribers > 0;
        if (p === 'twitter') return i.twitterFollowers && i.twitterFollowers > 0;
        if (p === 'tiktok') return i.tiktokFollowers && i.tiktokFollowers > 0;
        return true;
      });
    }

    if (minFollowers) {
      const min = parseInt(String(minFollowers));
      influencers = influencers.filter(i => {
        const total = (i.instagramFollowers || 0) + (i.youtubeSubscribers || 0) + 
                      (i.twitterFollowers || 0) + (i.tiktokFollowers || 0);
        return total >= min;
      });
    }

    if (minEngagement) {
      const min = parseFloat(String(minEngagement));
      influencers = influencers.filter(i => 
        i.engagementRate && parseFloat(i.engagementRate.toString()) >= min
      );
    }

    // Sort
    if (sortBy === 'followers') {
      influencers.sort((a, b) => {
        const aTotal = (a.instagramFollowers || 0) + (a.youtubeSubscribers || 0);
        const bTotal = (b.instagramFollowers || 0) + (b.youtubeSubscribers || 0);
        return bTotal - aTotal;
      });
    } else if (sortBy === 'engagement') {
      influencers.sort((a, b) => 
        (parseFloat(b.engagementRate?.toString() || '0')) - 
        (parseFloat(a.engagementRate?.toString() || '0'))
      );
    } else {
      influencers.sort((a, b) => 
        (parseFloat(b.rating?.toString() || '0')) - 
        (parseFloat(a.rating?.toString() || '0'))
      );
    }

    // Transform to API format
    const result = influencers.map(i => ({
      id: i.id,
      bio: i.bio,
      niche: i.niche,
      instagramHandle: i.instagramHandle,
      instagramFollowers: i.instagramFollowers,
      youtubeHandle: i.youtubeHandle,
      youtubeSubscribers: i.youtubeSubscribers,
      twitterHandle: i.twitterHandle,
      twitterFollowers: i.twitterFollowers,
      tiktokHandle: i.tiktokHandle,
      tiktokFollowers: i.tiktokFollowers,
      engagementRate: i.engagementRate ? parseFloat(i.engagementRate.toString()) : null,
      rating: i.rating ? parseFloat(i.rating.toString()) : null,
      location: i.location,
      profile: i.profile ? {
        fullName: i.profile.fullName,
        avatarUrl: i.profile.avatarUrl,
      } : null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Influencers error:', error);
    res.status(500).json({ error: 'Failed to get influencers' });
  }
}

