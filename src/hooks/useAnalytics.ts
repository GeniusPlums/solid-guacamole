import { useQuery } from "@tanstack/react-query";
import { analyticsApi, BrandAnalytics, InfluencerAnalytics } from "@/lib/api";

export function useBrandAnalytics() {
  return useQuery({
    queryKey: ["brandAnalytics"],
    queryFn: () => analyticsApi.getBrandAnalytics(),
  });
}

export function useInfluencerAnalytics() {
  return useQuery({
    queryKey: ["influencerAnalytics"],
    queryFn: () => analyticsApi.getInfluencerAnalytics(),
  });
}

export type { BrandAnalytics, InfluencerAnalytics };

