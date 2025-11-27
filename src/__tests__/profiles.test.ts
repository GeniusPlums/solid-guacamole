import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profilesApi, influencersApi } from '../lib/api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('auth_token', 'test-token');
});

describe('Profiles API', () => {
  describe('getMe', () => {
    it('should fetch current user profile with brand profile', async () => {
      const mockResponse = {
        profile: { id: '1', userType: 'brand', fullName: 'Test Brand' },
        brandProfile: { id: 'b1', companyName: 'Test Corp', industry: 'Tech' },
        influencerProfile: null
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await profilesApi.getMe();
      expect(result.profile.userType).toBe('brand');
      expect(result.brandProfile).not.toBeNull();
      expect(result.influencerProfile).toBeNull();
    });

    it('should fetch current user profile with influencer profile', async () => {
      const mockResponse = {
        profile: { id: '2', userType: 'influencer', fullName: 'Test Influencer' },
        brandProfile: null,
        influencerProfile: {
          id: 'i1',
          niche: ['Fashion', 'Lifestyle'],
          instagramFollowers: 50000,
          engagementRate: 4.5
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await profilesApi.getMe();
      expect(result.profile.userType).toBe('influencer');
      expect(result.influencerProfile).not.toBeNull();
      expect(result.influencerProfile?.niche).toContain('Fashion');
    });
  });

  describe('updateProfile', () => {
    it('should update profile name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await profilesApi.updateProfile({ fullName: 'New Name' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/profiles/me'),
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('New Name')
        })
      );
    });
  });

  describe('saveBrandProfile', () => {
    it('should save brand profile data', async () => {
      const brandData = {
        companyName: 'Test Corp',
        industry: 'Technology',
        description: 'A tech company',
        website: 'https://testcorp.com'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'b1', ...brandData })
      });

      await profilesApi.saveBrandProfile(brandData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/profiles/brand'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Corp')
        })
      );
    });
  });

  describe('saveInfluencerProfile', () => {
    it('should save influencer profile data', async () => {
      const influencerData = {
        bio: 'Fashion blogger',
        niche: ['Fashion', 'Lifestyle'],
        instagramHandle: 'fashionista',
        instagramFollowers: 50000,
        engagementRate: 4.5
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'i1', ...influencerData })
      });

      await profilesApi.saveInfluencerProfile(influencerData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/profiles/influencer'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});

describe('Influencers API', () => {
  describe('getAll', () => {
    it('should fetch all influencers', async () => {
      const mockInfluencers = [
        { id: '1', instagram_followers: 50000, niche: ['Fashion'] },
        { id: '2', instagram_followers: 100000, niche: ['Tech'] }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInfluencers)
      });

      const result = await influencersApi.getAll();
      expect(result).toHaveLength(2);
    });

    it('should filter influencers by niche', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: '1', niche: ['Fashion'] }])
      });

      await influencersApi.getAll({ niche: 'Fashion' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('niche=Fashion'),
        expect.any(Object)
      );
    });

    it('should filter influencers by platform', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await influencersApi.getAll({ platform: 'instagram' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('platform=instagram'),
        expect.any(Object)
      );
    });
  });
});

