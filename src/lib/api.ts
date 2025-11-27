// API Client for Neon + Express backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

