// API Client for Neon + Express backend
// In production (Vercel), use relative /api path which routes to serverless functions
// In development, use localhost:3001
const API_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// Token management
const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Base fetch helper with auth
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  async signUp(data: { email: string; password: string; name: string; userType: 'brand' | 'influencer' }) {
    const result = await fetchApi<{
      success: boolean;
      session: {
        user: any;
        token: string;
        expiresAt: string;
      };
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.session?.token) {
      setToken(result.session.token);
    }
    
    return result;
  },

  async signIn(data: { email: string; password: string }) {
    const result = await fetchApi<{
      success: boolean;
      session: {
        user: any;
        token: string;
        expiresAt: string;
      };
      brandProfile?: any;
      influencerProfile?: any;
    }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (result.session?.token) {
      setToken(result.session.token);
    }

    return result;
  },

  async getSession() {
    const token = getToken();
    if (!token) return null;
    
    try {
      return await fetchApi<{ user: any }>('/auth/session');
    } catch {
      removeToken();
      return null;
    }
  },

  async signOut() {
    removeToken();
    return { success: true };
  },
};

// Profiles API
export const profilesApi = {
  async getMe() {
    return fetchApi<{
      profile: any;
      brandProfile: any;
      influencerProfile: any;
    }>('/profiles/me');
  },

  async updateProfile(data: { fullName?: string; avatarUrl?: string }) {
    return fetchApi('/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async saveBrandProfile(data: {
    companyName: string;
    description?: string;
    industry?: string;
    website?: string;
    logoUrl?: string;
  }) {
    return fetchApi('/profiles/brand', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async saveInfluencerProfile(data: any) {
    return fetchApi('/profiles/influencer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Campaigns API
export const campaignsApi = {
  async getAll() {
    return fetchApi<any[]>('/campaigns');
  },

  async getById(id: string) {
    return fetchApi<any>(`/campaigns/${id}`);
  },

  async create(data: any) {
    return fetchApi('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any) {
    return fetchApi(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return fetchApi(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  },
};

// Campaign Discovery API (for influencers)
export const campaignDiscoveryApi = {
  async getAll(params?: { search?: string; niche?: string; minBudget?: number; maxBudget?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.niche) searchParams.set('niche', params.niche);
    if (params?.minBudget) searchParams.set('minBudget', params.minBudget.toString());
    if (params?.maxBudget) searchParams.set('maxBudget', params.maxBudget.toString());

    const query = searchParams.toString();
    return fetchApi<any[]>(`/campaigns/discover${query ? `?${query}` : ''}`);
  },
};

// Collaborations API
export const collaborationsApi = {
  async getAll() {
    return fetchApi<any[]>('/collaborations');
  },

  async create(data: any) {
    return fetchApi('/collaborations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: string, status: string) {
    return fetchApi(`/collaborations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async update(id: string, data: any) {
    return fetchApi(`/collaborations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Influencers API
export const influencersApi = {
  async getAll(params: {
    search?: string;
    niche?: string;
    platform?: string;
    minFollowers?: number;
    minEngagement?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const query = searchParams.toString();
    return fetchApi<any[]>(`/influencers${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return fetchApi<any>(`/influencers/${id}`);
  },
};

// Messages API
export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  userType: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  read: boolean;
  createdAt: string;
  collaborationId?: string;
}

export const messagesApi = {
  async getConversations(): Promise<Conversation[]> {
    return fetchApi<Conversation[]>('/messages/conversations');
  },

  async getMessages(userId: string): Promise<Message[]> {
    return fetchApi<Message[]>(`/messages/${userId}`);
  },

  async sendMessage(data: { toUserId: string; content: string; collaborationId?: string }): Promise<Message> {
    return fetchApi<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async markAsRead(userId: string): Promise<void> {
    return fetchApi(`/messages/read/${userId}`, {
      method: 'PATCH',
    });
  },
};

// Analytics API
export interface BrandAnalytics {
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSpend: number;
    activeCollabs: number;
    pendingCollabs: number;
    completedCollabs: number;
    totalCollabs: number;
  };
  monthlyData: Array<{ month: string; spend: number; collaborations: number; completed: number }>;
  nicheDistribution: Array<{ name: string; value: number; color: string }>;
  campaignPerformance: Array<{ name: string; spend: number; collaborations: number; completed: number }>;
}

export interface InfluencerAnalytics {
  summary: {
    totalFollowers: number;
    engagementRate: number;
    totalEarnings: number;
    completedCollabs: number;
    activeCollabs: number;
    pendingCollabs: number;
    rating: number;
  };
  monthlyData: Array<{ month: string; earnings: number; collaborations: number }>;
  platformDistribution: Array<{ name: string; value: number; color: string }>;
}

export const analyticsApi = {
  async getBrandAnalytics(): Promise<BrandAnalytics> {
    return fetchApi<BrandAnalytics>('/analytics/brand');
  },

  async getInfluencerAnalytics(): Promise<InfluencerAnalytics> {
    return fetchApi<InfluencerAnalytics>('/analytics/influencer');
  },
};

// Shortlists API
export interface ShortlistItem {
  id: string;
  brandId: string;
  influencerId: string;
  notes: string | null;
  createdAt: string;
  influencer: {
    id: string;
    bio: string;
    niche: string[];
    instagramFollowers: number;
    youtubeSubscribers: number;
    engagementRate: number;
    rating: number;
    profile: {
      fullName: string;
      avatarUrl: string;
    };
  };
}

export const shortlistsApi = {
  async getAll(): Promise<ShortlistItem[]> {
    return fetchApi<ShortlistItem[]>('/shortlists');
  },

  async add(influencerId: string, notes?: string): Promise<any> {
    return fetchApi('/shortlists', {
      method: 'POST',
      body: JSON.stringify({ influencerId, notes }),
    });
  },

  async remove(influencerId: string): Promise<void> {
    return fetchApi(`/shortlists/${influencerId}`, {
      method: 'DELETE',
    });
  },

  async check(influencerId: string): Promise<{ isShortlisted: boolean }> {
    return fetchApi<{ isShortlisted: boolean }>(`/shortlists/check/${influencerId}`);
  },
};

