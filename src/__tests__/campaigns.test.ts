import { describe, it, expect, vi, beforeEach } from 'vitest';
import { campaignsApi } from '../lib/api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('auth_token', 'test-token');
});

describe('Campaigns API', () => {
  describe('getAll', () => {
    it('should fetch all campaigns for the brand', async () => {
      const mockCampaigns = [
        {
          id: '1',
          title: 'Summer Campaign',
          description: 'Summer product launch',
          budget: 10000,
          status: 'active',
          niches: ['Fashion', 'Lifestyle']
        },
        {
          id: '2',
          title: 'Holiday Campaign',
          description: 'Holiday promotions',
          budget: 15000,
          status: 'completed',
          niches: ['Beauty']
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaigns)
      });

      const result = await campaignsApi.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Summer Campaign');
    });

    it('should handle empty campaigns list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const result = await campaignsApi.getAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create a new campaign', async () => {
      const newCampaign = {
        title: 'New Campaign',
        description: 'A new marketing campaign',
        budget: 5000,
        niches: ['Tech', 'Gaming'],
        platforms: ['instagram', 'youtube']
      };

      const mockResponse = { id: '3', ...newCampaign, status: 'active' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await campaignsApi.create(newCampaign);
      expect(result.id).toBe('3');
      expect(result.status).toBe('active');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/campaigns'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New Campaign')
        })
      );
    });
  });

  describe('getById', () => {
    it('should fetch a specific campaign', async () => {
      const mockCampaign = {
        id: '1',
        title: 'Summer Campaign',
        budget: 10000,
        status: 'active'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCampaign)
      });

      const result = await campaignsApi.getById('1');
      expect(result.id).toBe('1');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/campaigns/1'),
        expect.any(Object)
      );
    });
  });

  describe('update', () => {
    it('should update campaign details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', budget: 12000 })
      });

      const result = await campaignsApi.update('1', { budget: 12000 });
      expect(result.budget).toBe(12000);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/campaigns/1'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('should update campaign status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', status: 'completed' })
      });

      const result = await campaignsApi.update('1', { status: 'completed' });
      expect(result.status).toBe('completed');
    });
  });

  describe('campaign workflow', () => {
    it('should create, update, and complete a campaign lifecycle', async () => {
      // Create
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', status: 'active' })
      });

      const created = await campaignsApi.create({ title: 'Test', budget: 5000 });
      expect(created.status).toBe('active');

      // Update budget
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', budget: 7000 })
      });

      const updated = await campaignsApi.update('1', { budget: 7000 });
      expect(updated.budget).toBe(7000);

      // Complete
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', status: 'completed' })
      });

      const completed = await campaignsApi.update('1', { status: 'completed' });
      expect(completed.status).toBe('completed');
    });
  });
});

