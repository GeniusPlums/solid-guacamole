import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  chatHistory: ChatMessage[];
  context: {
    userType: 'brand' | 'influencer';
    userName?: string;
    influencers?: any[];
    brandInfo?: any;
    influencerInfo?: any;
  };
}

// POST /api/chat - Send message to AI
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const { message, chatHistory, context } = req.body as ChatRequest;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(context);

    // Build conversation history
    const conversationParts = (chatHistory || []).map((msg: ChatMessage) => ({
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
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'I understand. I am the ICY Platform AI Assistant and I will help with influencer marketing queries based on the context provided.' }] },
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
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

function buildSystemPrompt(context: ChatRequest['context']): string {
  const basePrompt = `You are the ICY Platform AI Assistant, an expert in influencer marketing. 
You help connect brands with the right influencers and help influencers find brand opportunities.
Be concise, helpful, and professional. Format your responses clearly with bullet points when listing items.
Current user: ${context.userName || 'User'} (${context.userType})`;

  if (context.userType === 'brand') {
    let influencerContext = '';
    if (context.influencers && context.influencers.length > 0) {
      influencerContext = `\n\nAvailable influencers in the database:\n${context.influencers.map((inf: any) =>
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
${influencerContext}

When recommending influencers, explain your reasoning including audience match, engagement rates, and ratings.`;
  }

  return `${basePrompt}

As an influencer user, you can help with:
- Understanding brand opportunities and campaign requirements
- Providing tips to improve profile visibility and engagement
- Explaining platform features and how to get discovered
- Offering advice on pricing and negotiation

Influencer profile info: ${JSON.stringify(context.influencerInfo || {})}`;
}

function formatFollowers(count: number): string {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
}

export const chatRouter = router;

