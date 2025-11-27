import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { InfluencerWithProfile } from "./useInfluencers";
import { CampaignRequirements, scoreInfluencers, InfluencerScore } from "@/lib/aiRecommendation";
import {
  generateMatchExplanation,
  generateCampaignRecommendations,
  analyzeBrandRequirements,
  isGeminiConfigured,
} from "@/lib/geminiAI";

export interface AIMatchResult extends InfluencerScore {
  aiExplanation?: string;
  isLoadingExplanation?: boolean;
}

// Hook for AI-powered influencer matching
export function useAIMatching() {
  const [results, setResults] = useState<AIMatchResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeAndMatch = useCallback(
    async (
      influencers: InfluencerWithProfile[],
      requirements: CampaignRequirements
    ): Promise<AIMatchResult[]> => {
      setIsAnalyzing(true);

      // First, get rule-based scores
      const scoredInfluencers = scoreInfluencers(influencers, requirements);

      // Convert to AIMatchResult
      const initialResults: AIMatchResult[] = scoredInfluencers.map((s) => ({
        ...s,
        isLoadingExplanation: true,
      }));
      setResults(initialResults);

      // If Gemini is configured, get AI explanations for top matches
      if (isGeminiConfigured()) {
        const topMatches = initialResults.slice(0, 5); // Only get AI explanations for top 5

        // Fetch AI explanations in parallel
        const explanationPromises = topMatches.map(async (match, index) => {
          try {
            const explanation = await generateMatchExplanation(
              match.influencer,
              requirements
            );
            return { index, explanation };
          } catch {
            return { index, explanation: match.matchReasons.join(". ") };
          }
        });

        const explanations = await Promise.all(explanationPromises);

        // Update results with AI explanations
        const updatedResults = [...initialResults];
        explanations.forEach(({ index, explanation }) => {
          updatedResults[index] = {
            ...updatedResults[index],
            aiExplanation: explanation,
            isLoadingExplanation: false,
          };
        });

        // Mark remaining as not loading
        for (let i = 5; i < updatedResults.length; i++) {
          updatedResults[i].isLoadingExplanation = false;
        }

        setResults(updatedResults);
        setIsAnalyzing(false);
        return updatedResults;
      }

      // No AI available, use rule-based explanations
      const fallbackResults = initialResults.map((r) => ({
        ...r,
        aiExplanation: r.matchReasons.join(". "),
        isLoadingExplanation: false,
      }));
      setResults(fallbackResults);
      setIsAnalyzing(false);
      return fallbackResults;
    },
    []
  );

  return {
    results,
    isAnalyzing,
    analyzeAndMatch,
    isAIEnabled: isGeminiConfigured(),
  };
}

// Hook for natural language search
export function useNaturalLanguageSearch() {
  return useMutation({
    mutationFn: async (query: string) => {
      if (!isGeminiConfigured()) {
        throw new Error("AI not configured");
      }
      return analyzeBrandRequirements(query);
    },
  });
}

// Hook for campaign recommendations
export function useCampaignRecommendations() {
  return useMutation({
    mutationFn: async ({
      description,
      industry,
    }: {
      description: string;
      industry: string;
    }) => {
      if (!isGeminiConfigured()) {
        return [
          "Product launch with influencers",
          "Brand ambassador program",
          "Seasonal marketing campaign",
          "User-generated content contest",
          "Influencer takeover event",
        ];
      }
      return generateCampaignRecommendations(description, industry);
    },
  });
}

