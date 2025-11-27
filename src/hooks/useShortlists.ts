import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shortlistsApi, ShortlistItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useShortlists() {
  return useQuery({
    queryKey: ["shortlists"],
    queryFn: () => shortlistsApi.getAll(),
  });
}

export function useIsShortlisted(influencerId: string | undefined) {
  return useQuery({
    queryKey: ["shortlisted", influencerId],
    queryFn: () => (influencerId ? shortlistsApi.check(influencerId) : Promise.resolve({ isShortlisted: false })),
    enabled: !!influencerId,
  });
}

export function useAddToShortlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ influencerId, notes }: { influencerId: string; notes?: string }) =>
      shortlistsApi.add(influencerId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shortlists"] });
      queryClient.invalidateQueries({ queryKey: ["shortlisted", variables.influencerId] });
      toast({ title: "Added to shortlist", description: "Influencer has been added to your shortlist." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useRemoveFromShortlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (influencerId: string) => shortlistsApi.remove(influencerId),
    onSuccess: (_, influencerId) => {
      queryClient.invalidateQueries({ queryKey: ["shortlists"] });
      queryClient.invalidateQueries({ queryKey: ["shortlisted", influencerId] });
      toast({ title: "Removed from shortlist", description: "Influencer has been removed from your shortlist." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export type { ShortlistItem };

