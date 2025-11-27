import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export type CampaignWithDetails = Tables<"campaigns"> & {
  brand_profiles: Tables<"brand_profiles"> & {
    profiles: Tables<"profiles">;
  };
  collaborations_count?: number;
};

export function useCampaigns() {
  const { brandProfile } = useAuth();

  return useQuery({
    queryKey: ["campaigns", brandProfile?.id],
    queryFn: async () => {
      if (!brandProfile?.id) return [];

      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          *,
          brand_profiles(*, profiles(*))
        `)
        .eq("brand_id", brandProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CampaignWithDetails[];
    },
    enabled: !!brandProfile?.id,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          *,
          brand_profiles(*, profiles(*))
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as CampaignWithDetails;
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: TablesInsert<"campaigns">) => {
      const { data, error } = await supabase
        .from("campaigns")
        .insert(campaign)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: TablesUpdate<"campaigns"> & { id: string }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

