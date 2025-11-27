import { describe, it, expect, vi, beforeEach } from 'vitest';
import { messagesApi, analyticsApi, shortlistsApi, collaborationsApi, authApi } from '../lib/api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('auth_token', 'test-token');
});

describe('Messages API', () => {
  it('should fetch conversations', async () => {
    const mockConversations = [
      { id: '1', name: 'Test User', lastMessage: 'Hello', unread: 2 }
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockConversations)
    });

    const result = await messagesApi.getConversations();
    expect(result).toEqual(mockConversations);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/messages/conversations'),
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it('should fetch messages for a user', async () => {
    const mockMessages = [
      { id: '1', content: 'Hello', fromUserId: 'user1', toUserId: 'user2' }
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMessages)
    });

    const result = await messagesApi.getMessages('user2');
    expect(result).toEqual(mockMessages);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/messages/user2'),
      expect.any(Object)
    );
  });

  it('should send a message', async () => {
    const newMessage = { id: '1', content: 'Hello', toUserId: 'user2' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newMessage)
    });

    const result = await messagesApi.sendMessage({ toUserId: 'user2', content: 'Hello' });
    expect(result).toEqual(newMessage);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/messages'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ toUserId: 'user2', content: 'Hello' })
      })
    );
  });

  it('should mark messages as read', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    await messagesApi.markAsRead('user2');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/messages/read/user2'),
      expect.objectContaining({ method: 'PATCH' })
    );
  });
});

describe('Analytics API', () => {
  it('should fetch brand analytics', async () => {
    const mockAnalytics = {
      summary: { totalCampaigns: 5, totalSpend: 10000 },
      monthlyData: [{ month: 'Jan', spend: 2000 }]
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAnalytics)
    });

    const result = await analyticsApi.getBrandAnalytics();
    expect(result).toEqual(mockAnalytics);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/analytics/brand'),
      expect.any(Object)
    );
  });

  it('should fetch influencer analytics', async () => {
    const mockAnalytics = {
      summary: { totalFollowers: 50000, totalEarnings: 5000 },
      monthlyData: [{ month: 'Jan', earnings: 1000 }]
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockAnalytics)
    });

    const result = await analyticsApi.getInfluencerAnalytics();
    expect(result).toEqual(mockAnalytics);
  });
});

describe('Shortlists API', () => {
  it('should fetch shortlisted influencers', async () => {
    const mockShortlists = [{ id: '1', influencerId: 'inf1' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockShortlists)
    });

    const result = await shortlistsApi.getAll();
    expect(result).toEqual(mockShortlists);
  });

  it('should add influencer to shortlist', async () => {
    const mockResult = { id: '1', influencerId: 'inf1' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResult)
    });

    const result = await shortlistsApi.add('inf1');
    expect(result).toEqual(mockResult);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/shortlists'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('should remove influencer from shortlist', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    await shortlistsApi.remove('inf1');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/shortlists/inf1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('should check if influencer is shortlisted', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ isShortlisted: true })
    });

    const result = await shortlistsApi.check('inf1');
    expect(result.isShortlisted).toBe(true);
  });
});

