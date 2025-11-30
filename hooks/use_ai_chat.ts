/**
 * useAIChat Hook
 * Location: apps/web/hooks/use_ai_chat.ts
 *
 * React hook for AI chat functionality
 * Wraps Vercel AI SDK's useChat with custom configuration
 */

'use client';

// TODO: useChat not available in AI SDK v5 core - need @ai-sdk/react or alternative approach
// import { useChat } from 'ai';
import { useState } from 'react';
import type { AgentType } from '@shared/ai';

/**
 * AI Chat Hook Options
 */
export interface UseAIChatOptions {
  agent_type: AgentType;
  conversation_id?: string;
  knowledge_base_ids?: string[];
  enable_rag?: boolean;
  initial_messages?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  on_error?: (error: Error) => void;
  on_finish?: (message: string) => void;
}

/**
 * useAIChat Hook
 *
 * @param options - Chat configuration options
 * @returns Chat state and functions
 *
 * @example
 * ```tsx
 * const { messages, input, setInput, handleSubmit, isLoading } = useAIChat({
 *   agent_type: 'sales',
 *   knowledge_base_ids: ['kb_123'],
 * });
 * ```
 */
export function useAIChat(options: UseAIChatOptions) {
  console.log('[use_ai_chat] Initializing', {
    agent_type: options.agent_type,
    conversation_id: options.conversation_id,
    kb_count: options.knowledge_base_ids?.length || 0,
  });

  const [agent_type, set_agent_type] = useState<AgentType>(options.agent_type);
  const [knowledge_base_ids, set_knowledge_base_ids] = useState<string[]>(
    options.knowledge_base_ids || []
  );
  const [enable_rag, set_enable_rag] = useState<boolean>(
    options.enable_rag !== false
  );

  // TODO: Stub out useChat until @ai-sdk/react is available
  const chat_state: any = {
    messages: [],
    input: '',
    setInput: () => {},
    handleSubmit: () => {},
    append: () => Promise.resolve(undefined),
    reload: () => Promise.resolve(undefined),
    stop: () => {},
    isLoading: false,
  };
  
  /*
  const chat_state = useChat({
    api: '/api/ai/chat',
    id: options.conversation_id,
    initialMessages: options.initial_messages?.map((msg, index) => ({
      id: `msg_${Date.now()}_${index}`,
      role: msg.role,
      content: msg.content,
    })),
    body: {
      agent_type,
      knowledge_base_ids,
      enable_rag,
      conversation_id: options.conversation_id,
    },
    onError: (error) => {
      console.error('[use_ai_chat] Error:', error);
      if (options.on_error) {
        options.on_error(error);
      }
    },
    onFinish: (message) => {
      console.log('[use_ai_chat] Finished', {
        message_length: message.content.length,
      });
      if (options.on_finish) {
        options.on_finish(message.content);
      }
    },
  });
  */

  /**
   * Switch to a different agent
   *
   * @param new_agent_type - New agent type to use
   */
  const switch_agent = (new_agent_type: AgentType) => {
    console.log('[use_ai_chat] Switching agent', {
      from: agent_type,
      to: new_agent_type,
    });
    set_agent_type(new_agent_type);
  };

  /**
   * Update knowledge base IDs for RAG
   *
   * @param kb_ids - New knowledge base IDs
   */
  const update_knowledge_bases = (kb_ids: string[]) => {
    console.log('[use_ai_chat] Updating knowledge bases', {
      count: kb_ids.length,
    });
    set_knowledge_base_ids(kb_ids);
  };

  /**
   * Enable or disable RAG
   *
   * @param enabled - Whether RAG should be enabled
   */
  const toggle_rag = (enabled: boolean) => {
    console.log('[use_ai_chat] Toggle RAG', { enabled });
    set_enable_rag(enabled);
  };

  /**
   * Clear chat history
   */
  const clear_chat = () => {
    console.log('[use_ai_chat] Clearing chat');
    chat_state.setMessages([]);
    chat_state.setInput('');
  };

  return {
    // Chat state from useChat
    messages: chat_state.messages,
    input: chat_state.input,
    setInput: chat_state.setInput,
    handleSubmit: chat_state.handleSubmit,
    isLoading: chat_state.isLoading,
    error: chat_state.error,
    stop: chat_state.stop,
    reload: chat_state.reload,

    // Additional state
    agent_type,
    knowledge_base_ids,
    enable_rag,

    // Custom functions
    switch_agent,
    update_knowledge_bases,
    toggle_rag,
    clear_chat,
  };
}

/**
 * useAgentList Hook
 *
 * Fetches and manages the list of available agents
 *
 * @returns Agent list state and functions
 *
 * @example
 * ```tsx
 * const { agents, loading, error, refetch } = useAgentList();
 * ```
 */
export function useAgentList() {
  const [agents, set_agents] = useState<
    Array<{
      type: AgentType;
      name: string;
      description: string;
      model: string;
      tool_count: number;
    }>
  >([]);
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<Error | null>(null);

  const fetch_agents = async () => {
    console.log('[use_agent_list] Fetching agents');
    set_loading(true);
    set_error(null);

    try {
      const response = await fetch('/api/ai/agents');
      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`);
      }

      const data = await response.json();
      set_agents(data.agents);
      console.log('[use_agent_list] Agents fetched', { count: data.agents.length });
    } catch (err) {
      console.error('[use_agent_list] Error:', err);
      set_error(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      set_loading(false);
    }
  };

  // Fetch on mount
  useState(() => {
    fetch_agents();
  });

  return {
    agents,
    loading,
    error,
    refetch: fetch_agents,
  };
}

/**
 * useKnowledgeBase Hook
 *
 * Manages knowledge base operations (upload, search)
 *
 * @returns Knowledge base functions and state
 *
 * @example
 * ```tsx
 * const { upload_document, search, uploading, searching } = useKnowledgeBase();
 * ```
 */
export function useKnowledgeBase() {
  const [uploading, set_uploading] = useState(false);
  const [searching, set_searching] = useState(false);
  const [error, set_error] = useState<Error | null>(null);

  /**
   * Upload a document to a knowledge base
   */
  const upload_document = async (params: {
    knowledge_base_id: string;
    document_id: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
  }) => {
    console.log('[use_knowledge_base] Uploading document', {
      kb_id: params.knowledge_base_id,
      doc_id: params.document_id,
      content_length: params.content.length,
    });

    set_uploading(true);
    set_error(null);

    try {
      const response = await fetch('/api/ai/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          ...params,
        }),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[use_knowledge_base] Upload complete', data);
      return data;
    } catch (err) {
      console.error('[use_knowledge_base] Upload error:', err);
      const error_obj = err instanceof Error ? err : new Error('Unknown error');
      set_error(error_obj);
      throw error_obj;
    } finally {
      set_uploading(false);
    }
  };

  /**
   * Search a knowledge base
   */
  const search = async (params: {
    knowledge_base_id: string;
    query: string;
    top_k?: number;
  }) => {
    console.log('[use_knowledge_base] Searching', {
      kb_id: params.knowledge_base_id,
      query_length: params.query.length,
      top_k: params.top_k || 5,
    });

    set_searching(true);
    set_error(null);

    try {
      const response = await fetch('/api/ai/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search',
          ...params,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[use_knowledge_base] Search complete', {
        result_count: data.results.length,
      });
      return data.results;
    } catch (err) {
      console.error('[use_knowledge_base] Search error:', err);
      const error_obj = err instanceof Error ? err : new Error('Unknown error');
      set_error(error_obj);
      throw error_obj;
    } finally {
      set_searching(false);
    }
  };

  return {
    upload_document,
    search,
    uploading,
    searching,
    error,
  };
}
