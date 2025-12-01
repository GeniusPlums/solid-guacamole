// Gemini AI Service for ICY Platform Chatbot
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

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

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
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
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  // Build system context based on user type
  const systemPrompt = buildSystemPrompt(context);
  
  // Build conversation history
  const conversationParts = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  // Add current message
  conversationParts.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model', 
        parts: [{ text: 'I understand. I am the ICY Platform AI Assistant and I will help with influencer marketing queries based on the context provided.' }]
      },
      ...conversationParts
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
      topP: 0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error:', errorText);
    throw new Error(`AI service error: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }

  const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!aiResponse) {
    throw new Error('No response from AI');
  }

  return aiResponse;
}

function buildSystemPrompt(context: {
  userType: 'brand' | 'influencer';
  userName?: string;
  influencers?: InfluencerData[];
  brandInfo?: any;
  influencerInfo?: any;
}): string {
  const basePrompt = `You are the ICY Platform AI Assistant, an expert in influencer marketing. 
You help connect brands with the right influencers and help influencers find brand opportunities.
Be concise, helpful, and professional. Format your responses clearly with bullet points when listing items.
Current user: ${context.userName || 'User'} (${context.userType})`;

  if (context.userType === 'brand') {
    let influencerContext = '';
    if (context.influencers && context.influencers.length > 0) {
      influencerContext = `\n\nAvailable influencers in the database:\n${context.influencers.map(inf =>
        `- ${inf.name}: ${inf.niche?.join(', ') || 'General'} niche, ` +
        `${formatFollowers(inf.instagramFollowers)} IG followers, ` +
        `${inf.engagementRate ? Number(inf.engagementRate).toFixed(1) : 'N/A'}% engagement, ` +
        `Rating: ${inf.rating ? Number(inf.rating).toFixed(1) : 'N/A'}, ` +
        `Location: ${inf.location || 'Not specified'}`
      ).join('\n')}`;
    }
    
    return `${basePrompt}

As a brand user, you can help with:
- Finding and recommending influencers based on niche, audience size, engagement rates, and demographics
- Explaining why specific influencers would be a good match for campaigns
- Providing insights about influencer performance and metrics
- Suggesting campaign strategies and budget recommendations
- Answering questions about the platform features
${influencerContext}

When recommending influencers, explain your reasoning including:
1. Audience match and niche alignment
2. Engagement rates and authenticity
3. Past performance and ratings
4. Demographics and location relevance`;
  } else {
    return `${basePrompt}

As an influencer user, you can help with:
- Understanding brand opportunities and campaign requirements
- Providing tips to improve profile visibility and engagement
- Explaining platform features and how to get discovered
- Offering advice on pricing and negotiation
- Answering questions about collaboration best practices

Influencer profile info: ${JSON.stringify(context.influencerInfo || {})}`;
  }
}

function formatFollowers(count: number): string {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

