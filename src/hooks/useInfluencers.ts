import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type InfluencerWithProfile = Tables<"influencer_profiles"> & {
  profiles: Tables<"profiles">;
};

interface UseInfluencersParams {
  search?: string;
  niche?: string;
  platform?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  sortBy?: "rating" | "followers" | "engagement";
  sortOrder?: "asc" | "desc";
}

export function useInfluencers(params: UseInfluencersParams = {}) {
  return useQuery({
    queryKey: ["influencers", params],
    queryFn: async () => {
      let query = supabase
        .from("influencer_profiles")
        .select(`
          *,
          profiles!inner(*)
        `);

      // Apply filters
      if (params.niche && params.niche !== "all") {
        query = query.contains("niche", [params.niche]);
      }

      if (params.minFollowers) {
        query = query.or(
          `instagram_followers.gte.${params.minFollowers},youtube_subscribers.gte.${params.minFollowers},twitter_followers.gte.${params.minFollowers},tiktok_followers.gte.${params.minFollowers}`
        );
      }

      if (params.minEngagement) {
        query = query.gte("engagement_rate", params.minEngagement);
      }

      // Apply sorting
      if (params.sortBy === "rating") {
        query = query.order("rating", { ascending: params.sortOrder === "asc" });
      } else if (params.sortBy === "engagement") {
        query = query.order("engagement_rate", { ascending: params.sortOrder === "asc" });
      } else {
        query = query.order("instagram_followers", { ascending: params.sortOrder === "asc", nullsFirst: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply search filter in memory (for profile name)
      let filteredData = data as InfluencerWithProfile[];
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter((inf) =>
          inf.profiles.full_name.toLowerCase().includes(searchLower) ||
          inf.bio?.toLowerCase().includes(searchLower) ||
          inf.niche?.some((n) => n.toLowerCase().includes(searchLower))
        );
      }

      // Apply platform filter in memory
      if (params.platform && params.platform !== "all") {
        filteredData = filteredData.filter((inf) => {
          switch (params.platform) {
            case "instagram":
              return inf.instagram_handle;
            case "youtube":
              return inf.youtube_handle;
            case "twitter":
              return inf.twitter_handle;
            case "tiktok":
              return inf.tiktok_handle;
            default:
              return true;
          }
        });
      }

      return filteredData;
    },
  });
}

export function useInfluencer(id: string) {
  return useQuery({
    queryKey: ["influencer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select(`
          *,
          profiles!inner(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as InfluencerWithProfile;
    },
    enabled: !!id,
  });
}

