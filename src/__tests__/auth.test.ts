import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../lib/api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('Authentication API', () => {
  describe('signUp', () => {
    it('should register a new brand user', async () => {
      const mockResponse = {
        user: { id: '1', email: 'brand@test.com' },
        token: 'test-token',
        profile: { id: '1', userType: 'brand', fullName: 'Test Brand' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authApi.signUp({
        email: 'brand@test.com',
        password: 'password123',
        fullName: 'Test Brand',
        userType: 'brand'
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signup'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('brand@test.com')
        })
      );
    });

    it('should register a new influencer user', async () => {
      const mockResponse = {
        user: { id: '2', email: 'influencer@test.com' },
        token: 'test-token',
        profile: { id: '2', userType: 'influencer', fullName: 'Test Influencer' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authApi.signUp({
        email: 'influencer@test.com',
        password: 'password123',
        fullName: 'Test Influencer',
        userType: 'influencer'
      });

      expect(result.profile.userType).toBe('influencer');
    });

    it('should throw error on duplicate email', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Email already exists' })
      });

      await expect(authApi.signUp({
        email: 'existing@test.com',
        password: 'password123',
        fullName: 'Test User',
        userType: 'brand'
      })).rejects.toThrow('Email already exists');
    });
  });

  describe('signIn', () => {
    it('should authenticate valid credentials', async () => {
      const mockResponse = {
        user: { id: '1', email: 'user@test.com' },
        token: 'test-token',
        profile: { id: '1', userType: 'brand' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await authApi.signIn({
        email: 'user@test.com',
        password: 'password123'
      });

      expect(result.token).toBe('test-token');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/signin'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should throw error on invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' })
      });

      await expect(authApi.signIn({
        email: 'user@test.com',
        password: 'wrongpassword'
      })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getSession', () => {
    it('should fetch authenticated user session', async () => {
      const mockSession = {
        user: { id: '1', email: 'user@test.com' }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSession)
      });

      const result = await authApi.getSession();
      expect(result).toEqual(mockSession);
    });

    it('should return null when no token present', async () => {
      // Setup: mock localStorage to return null for auth_token
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const result = await authApi.getSession();
      expect(result).toBeNull();
    });
  });
});

