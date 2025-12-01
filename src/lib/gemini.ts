// Gemini AI Service for Fiery Platform Chatbot
// This now calls the backend API to keep the Gemini API key secure

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface InfluencerData {
  id: string;
  name: string;
  bio: string;
  niche: string[];
  instagramFollowers: number;
  youtubeSubscribers: number;
  twitterFollowers: number;
  tiktokFollowers: number;
  engagementRate: number | string | null;
  rating: number | string | null;
  location: string;
  languages: string[];
}

export async function sendMessageToGemini(
  message: string,
  chatHistory: ChatMessage[],
  context: {
    userType: 'brand' | 'influencer';
    userName?: string;
    influencers?: InfluencerData[];
    brandInfo?: any;
    influencerInfo?: any;
  }
): Promise<string> {
  // Get auth token from localStorage
  const token = localStorage.getItem('auth_token');

  if (!token) {
    throw new Error('Please log in to use the AI assistant');
  }

  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      chatHistory: chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      context,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `AI service error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.response) {
    throw new Error('No response from AI');
  }

  return data.response;
}

