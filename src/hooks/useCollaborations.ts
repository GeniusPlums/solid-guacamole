import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export type CollaborationWithDetails = Tables<"collaborations"> & {
  campaigns: Tables<"campaigns">;
  influencer_profiles: Tables<"influencer_profiles"> & {
    profiles: Tables<"profiles">;
  };
  brand_profiles: Tables<"brand_profiles"> & {
    profiles: Tables<"profiles">;
  };
};

export function useCollaborations() {
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["collaborations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collaborations")
        .select(`
          *,
          campaigns(*),
          influencer_profiles(*, profiles(*)),
          brand_profiles(*, profiles(*))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CollaborationWithDetails[];
    },
    enabled: !!user,
  });
}

export function useCreateCollaboration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collaboration: TablesInsert<"collaborations">) => {
      const { data, error } = await supabase
        .from("collaborations")
        .insert(collaboration)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
    },
  });
}

export function useUpdateCollaboration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: Tables<"collaborations">["status"];
    }) => {
      const { data, error } = await supabase
        .from("collaborations")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
    },
  });
}

