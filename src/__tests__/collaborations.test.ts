import { describe, it, expect, vi, beforeEach } from 'vitest';
import { collaborationsApi } from '../lib/api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('auth_token', 'test-token');
});

describe('Collaborations API', () => {
  describe('getAll', () => {
    it('should fetch all collaborations for authenticated user', async () => {
      const mockCollaborations = [
        {
          id: '1',
          campaignId: 'c1',
          influencerId: 'i1',
          brandId: 'b1',
          status: 'pending',
          offeredAmount: 5000,
          deliverables: '2 Instagram posts'
        },
        {
          id: '2',
          campaignId: 'c1',
          influencerId: 'i2',
          brandId: 'b1',
          status: 'accepted',
          offeredAmount: 3000,
          deliverables: '1 YouTube video'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCollaborations)
      });

      const result = await collaborationsApi.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('pending');
    });

    it('should handle empty collaborations list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const result = await collaborationsApi.getAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('should create a new collaboration request', async () => {
      const newCollab = {
        campaignId: 'c1',
        influencerId: 'i1',
        brandId: 'b1',
        offeredAmount: 5000,
        deliverables: '2 posts',
        deadline: '2025-01-15',
        notes: 'Looking forward to working together'
      };

      const mockResponse = { id: '1', ...newCollab, status: 'pending' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await collaborationsApi.create(newCollab);
      expect(result.id).toBe('1');
      expect(result.status).toBe('pending');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/collaborations'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('c1')
        })
      );
    });
  });

  describe('update', () => {
    it('should accept a collaboration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', status: 'accepted' })
      });

      const result = await collaborationsApi.update('1', { status: 'accepted' });
      expect(result.status).toBe('accepted');
    });

    it('should reject a collaboration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', status: 'rejected' })
      });

      const result = await collaborationsApi.update('1', { status: 'rejected' });
      expect(result.status).toBe('rejected');
    });

    it('should mark collaboration as completed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', status: 'completed' })
      });

      const result = await collaborationsApi.update('1', { status: 'completed' });
      expect(result.status).toBe('completed');
    });
  });

  describe('collaboration workflow', () => {
    it('should follow correct status transitions', async () => {
      // Create pending collaboration
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', status: 'pending' })
      });

      // Accept collaboration
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', status: 'accepted' })
      });

      // Complete collaboration
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1', status: 'completed' })
      });

      const created = await collaborationsApi.create({
        campaignId: 'c1',
        influencerId: 'i1',
        brandId: 'b1',
        offeredAmount: 5000
      });
      expect(created.status).toBe('pending');

      const accepted = await collaborationsApi.update('1', { status: 'accepted' });
      expect(accepted.status).toBe('accepted');

      const completed = await collaborationsApi.update('1', { status: 'completed' });
      expect(completed.status).toBe('completed');
    });
  });
});

