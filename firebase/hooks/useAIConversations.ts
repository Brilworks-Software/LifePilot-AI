import { useEffect } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import AIConversationService, {
  CreateConversationInput,
  CreateMessageInput,
} from '../services/AIConversationService';
import type { AIConversation, Message } from '../types';

type ConversationType = AIConversation['conversationType'];

const conversationListQueryKey = (
  userId?: string | null,
  conversationType?: ConversationType
) =>
  ['aiConversations', 'list', userId ?? 'unknown', conversationType ?? 'all'] as const;

const conversationDetailQueryKey = (conversationId?: string | null) =>
  ['aiConversations', 'detail', conversationId ?? 'unknown'] as const;

export const useConversationList = (
  userId?: string | null,
  conversationType?: ConversationType
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return undefined;

    const unsubscribe = AIConversationService.subscribeToUserConversations(
      userId,
      (conversations) => {
        queryClient.setQueryData(
          conversationListQueryKey(userId, conversationType),
          conversations
        );
      },
      conversationType
    );

    return unsubscribe;
  }, [conversationType, queryClient, userId]);

  return useQuery({
    enabled: !!userId,
    queryKey: conversationListQueryKey(userId, conversationType),
    queryFn: async () => {
      if (!userId) throw new Error('Missing user id');
      return AIConversationService.fetchUserConversations(userId, conversationType);
    },
  });
};

export const useConversation = (conversationId?: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return undefined;

    const unsubscribe = AIConversationService.subscribeToConversation(
      conversationId,
      (conversation) => {
        queryClient.setQueryData(
          conversationDetailQueryKey(conversationId),
          conversation
        );
      }
    );

    return unsubscribe;
  }, [conversationId, queryClient]);

  return useQuery({
    enabled: !!conversationId,
    queryKey: conversationDetailQueryKey(conversationId),
    queryFn: async () => {
      if (!conversationId) throw new Error('Missing conversation id');
      return AIConversationService.fetchConversation(conversationId);
    },
  });
};

export const useCreateConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConversationInput) =>
      AIConversationService.createConversation(input),
    onSuccess: (conversation) => {
      queryClient.setQueryData(
        conversationDetailQueryKey(conversation.id),
        conversation
      );
      queryClient.invalidateQueries({
        queryKey: ['aiConversations', 'list', conversation.userId],
      });
    },
  });
};

export const useAppendMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      messages,
    }: {
      conversationId: string;
      messages: Message[];
    }) => AIConversationService.appendMessage(conversationId, messages),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conversationDetailQueryKey(variables.conversationId),
      });
    },
  });
};

export const useUpdateConversationTypeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      conversationType,
    }: {
      conversationId: string;
      conversationType: ConversationType;
    }) =>
      AIConversationService.updateConversationType(
        conversationId,
        conversationType
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: conversationDetailQueryKey(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: ['aiConversations', 'list'],
      });
    },
  });
};

export const useDeleteConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => AIConversationService.deleteConversation(conversationId),
    onSuccess: (_, variables) => {
      queryClient.removeQueries({
        queryKey: conversationDetailQueryKey(variables.conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: ['aiConversations', 'list', variables.userId],
      });
    },
  });
};

