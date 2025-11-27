import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi, Conversation, Message } from "@/lib/api";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => messagesApi.getConversations(),
    refetchInterval: 10000, // Poll every 10 seconds for new messages
  });
}

export function useMessages(userId: string | null) {
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: () => (userId ? messagesApi.getMessages(userId) : Promise.resolve([])),
    enabled: !!userId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { toUserId: string; content: string; collaborationId?: string }) =>
      messagesApi.sendMessage(data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["messages", variables.toUserId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => messagesApi.markAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// Type exports for convenience
export type { Conversation, Message };

