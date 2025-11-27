import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collaborationsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Collaboration, Campaign, InfluencerProfile, BrandProfile, Profile } from "@/db/types";

export type CollaborationWithDetails = Collaboration & {
  campaigns?: Campaign;
  campaign?: Campaign;
  influencer_profiles?: InfluencerProfile & {
    profiles?: Profile;
  };
  influencer?: InfluencerProfile & {
    profile?: Profile;
  };
  brand_profiles?: BrandProfile & {
    profiles?: Profile;
  };
  brand?: BrandProfile & {
    profile?: Profile;
  };
};

export function useCollaborations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["collaborations", user?.id],
    queryFn: async () => {
      const data = await collaborationsApi.getAll();
      // Transform to match expected format
      return data.map((collab: any) => ({
        ...collab,
        campaigns: collab.campaign,
        influencer_profiles: collab.influencer ? {
          ...collab.influencer,
          profiles: collab.influencer.profile,
        } : undefined,
        brand_profiles: collab.brand ? {
          ...collab.brand,
          profiles: collab.brand.profile,
        } : undefined,
      })) as CollaborationWithDetails[];
    },
    enabled: !!user,
  });
}

export interface CreateCollaborationInput {
  campaignId: string;
  influencerId: string;
  offeredAmount?: number;
  deliverables?: string;
  deadline?: string;
  notes?: string;
}

export function useCreateCollaboration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collaboration: CreateCollaborationInput) => {
      return collaborationsApi.create(collaboration);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
    },
  });
}

export function useUpdateCollaborationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return collaborationsApi.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
    },
  });
}

export function useUpdateCollaboration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      return collaborationsApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
    },
  });
}

