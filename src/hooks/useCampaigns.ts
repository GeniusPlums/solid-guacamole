import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Campaign, BrandProfile, Profile } from "@/db/types";

export type CampaignWithDetails = Campaign & {
  brand_profiles?: BrandProfile & {
    profiles?: Profile;
  };
  brand?: BrandProfile & {
    profile?: Profile;
  };
  collaborations_count?: number;
};

export function useCampaigns() {
  const { brandProfile } = useAuth();

  return useQuery({
    queryKey: ["campaigns", brandProfile?.id],
    queryFn: async () => {
      if (!brandProfile?.id) return [];
      const data = await campaignsApi.getAll();
      // Transform to match expected format
      return data.map((campaign: any) => ({
        ...campaign,
        brand_profiles: campaign.brand ? {
          ...campaign.brand,
          profiles: campaign.brand.profile,
        } : undefined,
      })) as CampaignWithDetails[];
    },
    enabled: !!brandProfile?.id,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const data = await campaignsApi.getById(id);
      // Transform to match expected format
      return {
        ...data,
        brand_profiles: data.brand ? {
          ...data.brand,
          profiles: data.brand.profile,
        } : undefined,
      } as CampaignWithDetails;
    },
    enabled: !!id,
  });
}

export interface CreateCampaignInput {
  title: string;
  description?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  targetPlatforms?: string[];
  targetNiche?: string[];
  minFollowers?: number;
  maxFollowers?: number;
  targetEngagementRate?: number;
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: CreateCampaignInput) => {
      return campaignsApi.create(campaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  id: string;
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateCampaignInput) => {
      return campaignsApi.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

