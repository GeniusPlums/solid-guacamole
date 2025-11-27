/**
 * Gemini AI Integration for ICY Platform
 * Provides AI-powered influencer matching and recommendations
 */

import { InfluencerWithProfile } from "@/hooks/useInfluencers";
import { CampaignRequirements } from "./aiRecommendation";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

// Call Gemini API
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data: GeminiResponse = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || "";
}

// Generate AI-powered match explanation
export async function generateMatchExplanation(
  influencer: InfluencerWithProfile,
  requirements: CampaignRequirements
): Promise<string> {
  const displayName = influencer.profiles?.full_name || influencer.instagram_handle || "This influencer";
  
  const prompt = `You are an influencer marketing expert. Analyze this match and provide a brief, compelling explanation (2-3 sentences) for why this influencer is a good fit.

Influencer Profile:
- Name: ${displayName}
- Niches: ${influencer.niche?.join(", ") || "General"}
- Instagram Followers: ${influencer.instagram_followers?.toLocaleString() || "N/A"}
- YouTube Subscribers: ${influencer.youtube_subscribers?.toLocaleString() || "N/A"}
- Engagement Rate: ${influencer.engagement_rate || 0}%
- Rating: ${influencer.rating || "N/A"}/5
- Bio: ${influencer.bio || "No bio"}
- Location: ${influencer.location || "Not specified"}

Brand Requirements:
- Target Niches: ${requirements.niche.join(", ")}
- Preferred Platforms: ${requirements.platforms.join(", ")}
- Target Followers: ${requirements.minFollowers.toLocaleString()} - ${requirements.maxFollowers.toLocaleString()}
- Target Engagement: ${requirements.targetEngagement}%
- Campaign Goal: ${requirements.campaignGoal}
- Budget: $${requirements.budget.toLocaleString()}

Provide a personalized, professional explanation of why this match makes sense. Focus on specific strengths.`;

  try {
    return await callGemini(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);
    return `${displayName} aligns well with your campaign requirements based on their ${influencer.niche?.join(" and ")} expertise.`;
  }
}

// AI-powered campaign recommendations
export async function generateCampaignRecommendations(
  brandDescription: string,
  industry: string
): Promise<string[]> {
  const prompt = `You are an influencer marketing strategist. Based on this brand, suggest 5 specific campaign ideas.

Brand Industry: ${industry}
Brand Description: ${brandDescription}

Provide exactly 5 creative campaign ideas as a JSON array of strings. Each idea should be specific and actionable.
Example format: ["Campaign idea 1", "Campaign idea 2", ...]

Return ONLY the JSON array, no other text.`;

  try {
    const response = await callGemini(prompt);
    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API error:", error);
    return [
      "Product launch collaboration with micro-influencers",
      "Brand ambassador program for loyal customers",
      "Seasonal campaign with lifestyle influencers",
      "User-generated content challenge",
      "Behind-the-scenes content series",
    ];
  }
}

// Analyze brand requirements from natural language
export async function analyzeBrandRequirements(
  naturalLanguageQuery: string
): Promise<Partial<CampaignRequirements>> {
  const prompt = `You are an AI assistant for an influencer marketing platform. Parse this brand's requirements into structured data.

Brand's Request: "${naturalLanguageQuery}"

Extract and return a JSON object with these fields (use null for fields that can't be determined):
{
  "niche": ["array of relevant niches like Fashion, Tech, Beauty, Fitness, Food, Travel, Gaming, Lifestyle"],
  "platforms": ["instagram", "youtube", "tiktok", "twitter"],
  "minFollowers": number or null,
  "maxFollowers": number or null,
  "targetEngagement": number (percentage) or null,
  "budget": number or null,
  "campaignGoal": "awareness" | "sales" | "engagement" | "content" or null
}

Return ONLY the JSON object, no other text.`;

  try {
    const response = await callGemini(prompt);
    const cleaned = response.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini API error:", error);
    return {};
  }
}

// Check if Gemini is configured
export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}

