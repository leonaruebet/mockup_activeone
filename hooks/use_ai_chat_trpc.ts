/**
 * useAIChatTRPC Hook
 * Location: apps/web/hooks/use_ai_chat_trpc.ts
 *
 * tRPC-based React hooks for AI chat functionality
 * Provides type-safe, non-streaming AI chat with full conversation management
 *
 * DIFFERENCES FROM use_ai_chat.ts:
 * - Uses tRPC for type-safe API calls
 * - Non-streaming responses (get complete message at once)
 * - Full conversation persistence and history
 * - Tier-based validation with clear error messages
 * - Better TypeScript integration
 *
 * USE CASES:
 * - When you need full type safety
 * - When streaming is not required
 * - When you want conversation history management
 * - When you need tier-aware agent selection
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc_client';
import type { AgentType } from '@shared/ai';

// ============================================
// Types
// ============================================

export interface UseAIChatTRPCOptions {
  agent_type: AgentType;
  conversation_id?: string;
  knowledge_base_ids?: string[];
  project_id?: string;
  enable_rag?: boolean;
  on_error?: (error: Error) => void;
  on_message?: (message: string) => void;
  auto_load_history?: boolean; // Auto-load conversation history on mount
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
  tokens_used?: number;
  model?: string;
  provider?: string;
}

// ============================================
// Main Hook: useAIChatTRPC
// ============================================

/**
 * useAIChatTRPC Hook
 *
 * Type-safe, non-streaming AI chat with full conversation management via tRPC
 *
 * @param options - Chat configuration options
 * @returns Chat state and functions
 *
 * @example
 * ```tsx
 * const {
 *   messages,
 *   input,
 *   setInput,
 *   send_message,
 *   isLoading,
 *   conversation_id,
 * } = useAIChatTRPC({
 *   agent_type: 'sales',
 *   knowledge_base_ids: ['kb_123'],
 *   auto_load_history: true,
 * });
 *
 * // Send message
 * await send_message('Show me laptops under $1000');
 * ```
 */
export function useAIChatTRPC(options: UseAIChatTRPCOptions) {
  console.log('[use_ai_chat_trpc] Initializing', {
    agent_type: options.agent_type,
    conversation_id: options.conversation_id,
    kb_count: options.knowledge_base_ids?.length || 0,
  });

  // State
  const [messages, set_messages] = useState<ChatMessage[]>([]);
  const [input, set_input] = useState('');
  const [agent_type, set_agent_type] = useState<AgentType>(options.agent_type);
  const [conversation_id, set_conversation_id] = useState<string | undefined>(
    options.conversation_id
  );
  const [knowledge_base_ids, set_knowledge_base_ids] = useState<string[]>(
    options.knowledge_base_ids || []
  );
  const [project_id] = useState<string | undefined>(options.project_id);
  const [enable_rag, set_enable_rag] = useState<boolean>(
    options.enable_rag !== false
  );

  // tRPC mutations
  const send_message_mutation = trpc.ai_chat.send_message.useMutation({
    onError: (error) => {
      console.error('[use_ai_chat_trpc] Send message error:', error);
      if (options.on_error) {
        options.on_error(error as Error);
      }
    },
    onSuccess: (data) => {
      console.log('[use_ai_chat_trpc] Message sent', {
        conversation_id: data.conversation_id,
        tokens_used: data.tokens_used,
      });

      // Update conversation_id if this was the first message
      if (!conversation_id) {
        set_conversation_id(data.conversation_id);
      }

      // Add assistant message to local state
      set_messages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant' as const,
          content: data.message,
          created_at: new Date(),
          tokens_used: data.tokens_used,
          model: data.model,
          provider: data.provider,
        },
      ]);

      if (options.on_message) {
        options.on_message(data.message);
      }
    },
  });

  // Load conversation history if conversation_id provided and auto_load enabled
  const {
    data: conversation_data,
    isLoading: loading_history,
    refetch: reload_history,
  } = trpc.ai_chat.get_conversation.useQuery(
    { conversation_id: conversation_id! },
    {
      enabled: !!conversation_id && options.auto_load_history !== false,
      refetchOnMount: true,
      onSuccess: (data) => {
        console.log('[use_ai_chat_trpc] History loaded', {
          message_count: data.messages.length,
        });

        // Convert to ChatMessage format
        const loaded_messages: ChatMessage[] = data.messages.map((msg: any) => ({
          id: msg._id.toString(),
          role: msg.role,
          content: msg.content,
          created_at: new Date(msg.created_at),
          tokens_used: msg.tokens_used,
          model: msg.model,
          provider: msg.provider,
        }));

        set_messages(loaded_messages);
      },
    }
  );

  /**
   * Send a message to the AI agent
   *
   * @param message - Message content (uses input state if not provided)
   */
  const send_message = useCallback(
    async (message?: string) => {
      const message_content = message || input;
      if (!message_content.trim()) {
        console.warn('[use_ai_chat_trpc] Empty message, skipping');
        return;
      }

      console.log('[use_ai_chat_trpc] Sending message', {
        agent_type,
        message_length: message_content.length,
        has_conversation: !!conversation_id,
      });

      // Add user message to local state immediately
      const user_message: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message_content,
        created_at: new Date(),
      };
      set_messages((prev) => [...prev, user_message]);

      // Clear input
      set_input('');

      // Send via tRPC
      await send_message_mutation.mutateAsync({
        agent_type,
        message: message_content,
        conversation_id,
        knowledge_base_ids,
        project_id,
        enable_rag,
      });
    },
    [
      input,
      agent_type,
      conversation_id,
      knowledge_base_ids,
      project_id,
      enable_rag,
      send_message_mutation,
    ]
  );

  /**
   * Handle form submit (for use with <form onSubmit={handleSubmit}>)
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }
      await send_message();
    },
    [send_message]
  );

  /**
   * Switch to a different agent
   *
   * @param new_agent_type - New agent type to use
   */
  const switch_agent = useCallback((new_agent_type: AgentType) => {
    console.log('[use_ai_chat_trpc] Switching agent', {
      from: agent_type,
      to: new_agent_type,
    });
    set_agent_type(new_agent_type);
  }, [agent_type]);

  /**
   * Update knowledge base IDs for RAG
   *
   * @param kb_ids - New knowledge base IDs
   */
  const update_knowledge_bases = useCallback((kb_ids: string[]) => {
    console.log('[use_ai_chat_trpc] Updating knowledge bases', {
      count: kb_ids.length,
    });
    set_knowledge_base_ids(kb_ids);
  }, []);

  /**
   * Enable or disable RAG
   *
   * @param enabled - Whether RAG should be enabled
   */
  const toggle_rag = useCallback((enabled: boolean) => {
    console.log('[use_ai_chat_trpc] Toggle RAG', { enabled });
    set_enable_rag(enabled);
  }, []);

  /**
   * Clear chat history (local state only, doesn't delete from server)
   */
  const clear_chat = useCallback(() => {
    console.log('[use_ai_chat_trpc] Clearing chat');
    set_messages([]);
    set_input('');
    set_conversation_id(undefined);
  }, []);

  /**
   * Start a new conversation (clears local state and resets conversation_id)
   */
  const start_new_conversation = useCallback(() => {
    console.log('[use_ai_chat_trpc] Starting new conversation');
    set_messages([]);
    set_input('');
    set_conversation_id(undefined);
  }, []);

  return {
    // Messages and state
    messages,
    input,
    setInput: set_input,
    conversation_id,
    agent_type,
    knowledge_base_ids,
    enable_rag,

    // Actions
    send_message,
    handleSubmit,
    switch_agent,
    update_knowledge_bases,
    toggle_rag,
    clear_chat,
    start_new_conversation,
    reload_history,

    // Loading states
    isLoading: send_message_mutation.isLoading,
    loading_history,
    error: send_message_mutation.error,
  };
}

// ============================================
// Hook: useAgentListTRPC
// ============================================

/**
 * useAgentListTRPC Hook
 *
 * Fetches and manages the list of available agents based on user's tier
 *
 * @returns Agent list state and functions
 *
 * @example
 * ```tsx
 * const { agents, loading, tier, upgrade_message } = useAgentListTRPC();
 *
 * // Free tier user sees 1 agent
 * // Plus tier user sees all 6 agents
 * ```
 */
export function useAgentListTRPC() {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = trpc.ai_chat.get_available_agents.useQuery(undefined, {
    refetchOnMount: true,
    onSuccess: (data) => {
      console.log('[use_agent_list_trpc] Agents fetched', {
        count: data.agents.length,
        tier: data.tier,
      });
    },
  });

  return {
    agents: data?.agents || [],
    tier: data?.tier || 'free',
    upgrade_message: data?.upgrade_message || null,
    loading,
    error: error as Error | null,
    refetch,
  };
}

// ============================================
// Hook: useConversationsTRPC
// ============================================

/**
 * useConversationsTRPC Hook
 *
 * Manages user's AI conversations with CRUD operations
 *
 * @returns Conversations state and management functions
 *
 * @example
 * ```tsx
 * const {
 *   conversations,
 *   loading,
 *   create_conversation,
 *   delete_conversation,
 * } = useConversationsTRPC();
 * ```
 */
export function useConversationsTRPC() {
  const utils = trpc.useUtils();

  // List conversations
  const {
    data: conversations,
    isLoading: loading,
    error,
    refetch,
  } = trpc.ai_chat.list_conversations.useQuery(undefined, {
    refetchOnMount: true,
    onSuccess: (data) => {
      console.log('[use_conversations_trpc] Conversations loaded', {
        count: data.length,
      });
    },
  });

  // Create conversation
  const create_mutation = trpc.ai_chat.create_conversation.useMutation({
    onSuccess: () => {
      console.log('[use_conversations_trpc] Conversation created');
      utils.ai_chat.list_conversations.invalidate();
    },
  });

  // Update conversation
  const update_mutation = trpc.ai_chat.update_conversation.useMutation({
    onSuccess: () => {
      console.log('[use_conversations_trpc] Conversation updated');
      utils.ai_chat.list_conversations.invalidate();
    },
  });

  // Delete conversation
  const delete_mutation = trpc.ai_chat.delete_conversation.useMutation({
    onSuccess: () => {
      console.log('[use_conversations_trpc] Conversation deleted');
      utils.ai_chat.list_conversations.invalidate();
    },
  });

  return {
    conversations: conversations || [],
    loading,
    error: error as Error | null,
    refetch,

    // Actions
    create_conversation: create_mutation.mutateAsync,
    update_conversation: update_mutation.mutateAsync,
    delete_conversation: delete_mutation.mutateAsync,

    // Loading states
    creating: create_mutation.isLoading,
    updating: update_mutation.isLoading,
    deleting: delete_mutation.isLoading,
  };
}

// ============================================
// Hook: useKnowledgeBaseTRPC
// ============================================

/**
 * useKnowledgeBaseTRPC Hook
 *
 * Manages knowledge base operations (create, list, view)
 *
 * @returns Knowledge base functions and state
 *
 * @example
 * ```tsx
 * const {
 *   knowledge_bases,
 *   create_knowledge_base,
 *   loading,
 * } = useKnowledgeBaseTRPC();
 *
 * // Create new KB (Plus tier only)
 * await create_knowledge_base({
 *   name: 'Product Docs',
 *   description: 'Product documentation',
 * });
 * ```
 */
export function useKnowledgeBaseTRPC() {
  const utils = trpc.useUtils();

  // List knowledge bases
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = trpc.ai_chat.list_knowledge_bases.useQuery(undefined, {
    refetchOnMount: true,
    onSuccess: (data) => {
      console.log('[use_knowledge_base_trpc] Knowledge bases loaded', {
        count: data.knowledge_bases.length,
        tier: data.tier,
      });
    },
  });

  // Create knowledge base
  const create_mutation = trpc.ai_chat.create_knowledge_base.useMutation({
    onSuccess: () => {
      console.log('[use_knowledge_base_trpc] Knowledge base created');
      utils.ai_chat.list_knowledge_bases.invalidate();
    },
  });

  return {
    knowledge_bases: data?.knowledge_bases || [],
    tier: data?.tier || 'free',
    can_create: data?.can_create || false,
    loading,
    error: error as Error | null,
    refetch,

    // Actions
    create_knowledge_base: create_mutation.mutateAsync,

    // Loading states
    creating: create_mutation.isLoading,
  };
}

// ============================================
// Hook: useAIStatsTRPC
// ============================================

/**
 * useAIStatsTRPC Hook
 *
 * Fetches AI usage statistics for the organization
 *
 * @returns AI usage stats and limits based on tier
 *
 * @example
 * ```tsx
 * const { stats, loading } = useAIStatsTRPC();
 *
 * console.log(stats?.total_tokens_used);  // 85000
 * console.log(stats?.usage_percentage.tokens);  // 8.5%
 * ```
 */
export function useAIStatsTRPC() {
  const {
    data: stats,
    isLoading: loading,
    error,
    refetch,
  } = trpc.ai_chat.get_ai_stats.useQuery(undefined, {
    refetchOnMount: true,
    refetchInterval: 30000, // Refresh every 30 seconds
    onSuccess: (data) => {
      console.log('[use_ai_stats_trpc] Stats loaded', {
        tokens_used: data.total_tokens_used,
        tier: data.tier,
      });
    },
  });

  return {
    stats,
    loading,
    error: error as Error | null,
    refetch,
  };
}
