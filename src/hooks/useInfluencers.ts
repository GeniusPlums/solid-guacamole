import { useQuery } from "@tanstack/react-query";
import { influencersApi } from "@/lib/api";
import type { InfluencerProfile, Profile } from "@/db/types";

export type InfluencerWithProfile = InfluencerProfile & {
  profiles?: Profile | null;
  profile?: Profile | null;
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
      const data = await influencersApi.getAll({
        search: params.search,
        niche: params.niche,
        platform: params.platform,
        minFollowers: params.minFollowers,
        minEngagement: params.minEngagement,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      });
      return data as InfluencerWithProfile[];
    },
  });
}

export function useInfluencer(id: string) {
  return useQuery({
    queryKey: ["influencer", id],
    queryFn: async () => {
      const data = await influencersApi.getById(id);
      return data as InfluencerWithProfile;
    },
    enabled: !!id,
  });
}

