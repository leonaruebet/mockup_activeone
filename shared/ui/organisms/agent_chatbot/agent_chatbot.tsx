'use client';

/**
 * AgentChatbot Component
 * Purpose: Real-time chatbot interface for testing agents
 * Location: shared/ui/organisms/agent_chatbot/agent_chatbot.tsx
 *
 * Features:
 * - Three AI modes: Lite, Basic, and Pro (each using different AI models)
 * - Styled message bubbles (bot: gray, user: orange/peach)
 * - Quick reply suggestions with lightbulb icon
 * - Date/time display with info button
 * - Collapse/expand button
 * - Design matches provided screenshot
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Loader2, Info,
  Bot, MessageCircleQuestion,
  AlertCircle, Zap, ChevronRight, User, RotateCcw
} from 'lucide-react';

/**
 * Message type for chat interface
 */
export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
};

/**
 * AI Mode type
 */
type AIMode = 'lite' | 'basic' | 'pro';

/**
 * Agent Type type
 */
export type AgentType = 'general' | 'sales' | 'real_estate' | 'property_intake';

/**
 * Model Options (System Prompts)
 */
const MODEL_OPTIONS: Array<{ value: AgentType; label: string; description: string }> = [
  {
    value: 'general',
    label: 'General Assistant',
    description: 'Balanced helper for common questions and task routing',
  },
  {
    value: 'sales',
    label: 'Sales Assistant',
    description: 'Product discovery, promotions, and order handling',
  },
  {
    value: 'real_estate',
    label: 'Real Estate Agent',
    description: 'Property discovery, client qualification, and follow-up',
  },
  {
    value: 'property_intake',
    label: 'Property Intake Assistant',
    description: 'Collect property listing information with intelligent follow-up questions',
  },
];

interface AgentChatbotProps {
  chatbot_id?: string;
  chatbot_name?: string;
  org_id?: string;
  agent_type?: AgentType;
  on_agent_type_change?: (agent_type: AgentType) => void;
  on_send_message?: (message: string, mode?: AIMode, conversation_history?: Message[]) => Promise<string>;
  on_reset?: () => void; // Callback when conversation is reset
  placeholder?: string;
  empty_state_message?: string;
  /** Controlled collapsed state from parent */
  is_collapsed?: boolean;
  on_collapse_change?: (is_collapsed: boolean) => void;
  /** Hide model selector dropdown (useful when agent type is fixed) */
  hide_model_selector?: boolean;
  /** Hide AI mode selector (Lite/Basic/Pro) */
  hide_ai_mode_selector?: boolean;
  /** Pass messages from parent for controlled mode */
  messages?: Message[];
  /** Overlay message when KB is not ready */
  overlay_message?: string;
  /** Hide collapse toggle button */
  hide_collapse_toggle?: boolean;
  /** Hide reset button and show username instead */
  show_username?: string;
  /** Admin view mode: user messages on LEFT, bot responses on RIGHT */
  is_admin_view?: boolean;
}

/**
 * AI Mode Model Configurations
 * All modes use Google Gemini models for consistency and cost efficiency
 * NOTE: Project policy - Only using Google Gemini provider
 */
export const MODE_MODEL_CONFIG: Record<AIMode, { provider: string; model: string; description: string }> = {
  lite: {
    provider: 'google',
    model: 'gemini-2.5-flash-lite',
    description: 'Fast and efficient - Gemini 2.5 Flash Lite',
  },
  basic: {
    provider: 'google',
    model: 'gemini-2.5-flash',
    description: 'Balanced performance - Gemini 2.5 Flash',
  },
  pro: {
    provider: 'google',
    model: 'gemini-2.5-pro',
    description: 'Most capable - Gemini 2.5 Pro',
  },
};


/**
 * ChatMessage Component
 * Purpose: Display individual chat message bubble
 */
const ChatMessage = ({ message, is_admin_view }: { message: Message; is_admin_view?: boolean }) => {
  const is_user = message.sender === 'user';

  // In admin view: user messages on LEFT, bot messages on RIGHT
  // In normal view: user messages on RIGHT, bot messages on LEFT
  const justify_position = is_admin_view
    ? (is_user ? 'justify-start' : 'justify-end')  // Admin: reverse layout
    : (is_user ? 'justify-end' : 'justify-start'); // Normal: user right, bot left

  return (
    <div className={`flex ${justify_position} mb-3 sm:mb-4`}>
      <div
        className={`max-w-[90%] sm:max-w-[85%] md:max-w-[80%] rounded-[10px] px-3 sm:px-4 py-2 sm:py-2.5 ${
          is_user
            ? 'bg-primary-200 text-noble-black-400 rounded-br-none'
            : 'text-noble-black-400 leading-5'
        }`}
      >
        <p className="text-xs sm:text-sm leading-5 whitespace-pre-wrap break-words">{message.text}</p>

        {/* Suggestions section removed */}
      </div>
    </div>
  );
};

/**
 * AgentChatbot Component
 * Purpose: Main chatbot interface with new design
 */
export function AgentChatbot({
  chatbot_id,
  chatbot_name = 'AI Agent',
  org_id,
  agent_type = 'general',
  on_agent_type_change,
  on_send_message,
  on_reset,
  placeholder = 'Type a message...',
  empty_state_message = 'Start conversation',
  is_collapsed: is_collapsed_prop,
  on_collapse_change,
  hide_model_selector = false,
  hide_ai_mode_selector = false,
  messages: messages_prop,
  overlay_message,
  hide_collapse_toggle = false,
  show_username,
  is_admin_view = false,
}: AgentChatbotProps) {
  console.log('[AgentChatbot] Rendering with is_collapsed prop:', is_collapsed_prop);

  const [messages, set_messages] = useState<Message[]>(messages_prop || []);
  const [input_value, set_input_value] = useState('');
  const [is_loading, set_is_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const [ai_mode, set_ai_mode] = useState<AIMode>('lite');
  const [is_collapsed, set_is_collapsed] = useState(is_collapsed_prop ?? false);

  // Sync internal collapsed state with prop when it changes
  useEffect(() => {
    console.log('[AgentChatbot] Syncing collapsed state from prop:', is_collapsed_prop);
    if (is_collapsed_prop !== undefined) {
      set_is_collapsed(is_collapsed_prop);
    }
  }, [is_collapsed_prop]);

  // Sync messages with prop when it changes (for controlled mode)
  useEffect(() => {
    if (messages_prop) {
      console.log('[AgentChatbot] Syncing messages from prop, count:', messages_prop.length);
      set_messages(messages_prop);
    }
  }, [messages_prop]);
  const messages_end_ref = useRef<HTMLDivElement | null>(null);
  const messages_container_ref = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    console.info('[AgentChatbot] lifecycle', {
      stage: 'mounted',
      timestamp: new Date().toISOString(),
      chatbot_id,
    });
    return () => {
      console.info('[AgentChatbot] lifecycle', {
        stage: 'unmounted',
        timestamp: new Date().toISOString(),
        chatbot_id,
      });
    };
  }, [chatbot_id]);

  /**
   * scroll_to_bottom
   * Purpose: Auto-scroll to latest message
   */
  const scroll_to_bottom = () => {
    messages_end_ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scroll_to_bottom();
  }, [messages, is_loading]);

  /**
   * handle_send_message
   * Purpose: Send user message and get bot response
   * Passes current AI mode and last 10 messages for conversation context
   */
  const handle_send_message = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input_value.trim() || is_loading) return;
    if (!on_send_message) {
      set_error('Chat functionality not configured');
      return;
    }

    const user_message: Message = {
      id: `user-${Date.now()}`,
      text: input_value.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    set_messages(prev => [...prev, user_message]);
    set_input_value('');
    set_is_loading(true);
    set_error(null);

    try {
      // Get last 10 messages for conversation history (excluding the current message)
      const conversation_history = messages.slice(-10);

      // Pass current AI mode, and conversation history for memory
      const bot_response = await on_send_message(user_message.text, ai_mode, conversation_history);

      const bot_message: Message = {
        id: `bot-${Date.now()}`,
        text: bot_response,
        sender: 'bot',
        timestamp: new Date(),
        // Example suggestions - in real implementation, could come from API
        suggestions: messages.length === 0 ? [
          'สรุปข้อมูลภาพรวมของผู้ใช้งานทั้งหมดในช่วงที่เลือก',
          'แสดงสัดส่วนยอดขายตามภูมิภาคทั่วประเทศ'
        ] : undefined,
      };

      set_messages(prev => [...prev, bot_message]);
    } catch (err) {
      set_error(err instanceof Error ? err.message : 'Failed to send message');
      console.error('chat_send_message_error', err);
    } finally {
      set_is_loading(false);
    }
  };

  /**
   * handle_reset_chat
   * Purpose: Clear chat messages and restart the chat
   * Also clears conversation memory by calling on_reset callback
   */
  const handle_reset_chat = () => {
    set_messages([]);
    set_error(null);
    set_is_loading(false);
    // Notify parent component to reset conversation_id for new conversation
    if (on_reset) {
      on_reset();
    }
  };

  if (is_collapsed) {
    return (
      <div
        ref={containerRef as any}
        className="h-full flex items-center justify-center"
      >
        <button
          onClick={() => {
            set_is_collapsed(false);
            on_collapse_change?.(false);
          }}
          className="w-9 h-9 flex items-center justify-center bg-white rounded-[12px] border border-noble-black-100 hover:border-primary-600 transition-all hover:scale-105"
        >
          <MessageCircleQuestion className="h-5 w-5 text-noble-black-400" strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef as any}
      className="h-full flex flex-col bg-noble-black-100/80 backdrop-blur-xl rounded-t-[24px] border border-white/40 overflow-hidden shadow-l"
    >
      {/* Header Section */}
      <div className="bg-white rounded-t-[24px] p-3 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0">
        {/* Top Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Username Display or Reset Button */}
            {show_username ? (
              <div className="h-8 sm:h-10 flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 rounded-[10px] bg-whitesmoke-100 border border-noble-black-100">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                <span className="text-[10px] sm:text-xs leading-4 font-medium text-noble-black-500">
                  {show_username}
                </span>
              </div>
            ) : (
              <button
                onClick={handle_reset_chat}
                className="h-8 sm:h-10 flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 rounded-[10px] bg-white border border-noble-black-100 hover:border-primary-600 transition-colors"
                title="Clear chat and restart"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-noble-black-500" />
                <span className="text-[10px] sm:text-xs leading-4 font-medium text-noble-black-500 hidden xs:inline">
                  Reset
                </span>
              </button>
            )}

            {/* Info Button */}
            <button className="h-6 w-6 flex items-center justify-center text-noble-black-400 hover:text-primary-600 transition-colors">
              <Info className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Collapse Button - Hidden on mobile or when hide_collapse_toggle is true */}
          {!hide_collapse_toggle && (
            <button
              onClick={() => {
                set_is_collapsed(true);
                on_collapse_change?.(true);
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 hidden lg:flex items-center justify-center rounded-[12px] bg-white border border-noble-black-100 hover:border-primary-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-noble-black-500" />
            </button>
          )}
        </div>

        {/* Mode Tabs */}
        {!hide_ai_mode_selector && (
          <>
            <div className="bg-white border border-noble-black-100 rounded-[10px] p-0.5 sm:p-1 flex gap-0.5 sm:gap-1">
              <button
                onClick={() => set_ai_mode('lite')}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-[8px] transition-colors ${
                  ai_mode === 'lite'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-noble-black-400 hover:bg-whitesmoke-100'
                }`}
              >
                <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm leading-5">Lite</span>
              </button>
              <button
                onClick={() => set_ai_mode('basic')}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-[8px] transition-colors ${
                  ai_mode === 'basic'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-noble-black-400 hover:bg-whitesmoke-100'
                }`}
              >
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm leading-5">Basic</span>
              </button>
              <button
                onClick={() => set_ai_mode('pro')}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-[8px] transition-colors ${
                  ai_mode === 'pro'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-noble-black-400 hover:bg-whitesmoke-100'
                }`}
              >
                <MessageCircleQuestion className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm leading-5">Pro</span>
              </button>
            </div>

            {/* Active Model Info */}
            {MODE_MODEL_CONFIG[ai_mode].description && (
              <div className="px-2 py-1.5 bg-whitesmoke-100 border border-noble-black-100 rounded-[8px]">
                <p className="text-xs text-noble-black-400 leading-[18px]">
                  {MODE_MODEL_CONFIG[ai_mode].description}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chat Area */}
      <div
        ref={messages_container_ref as any}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 min-h-0"
      >
        {/* Empty State */}
        {messages.length === 0 && !is_loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-3 sm:px-4">
            <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-noble-black-400 mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm text-noble-black-400 leading-5">
              {empty_state_message}
            </p>
          </div>
        )}

        {/* Message List */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} is_admin_view={is_admin_view} />
        ))}

        {/* Loading Indicator */}
        {is_loading && (
          <div className="flex justify-start mb-3 sm:mb-4">
            <div className="bg-whitesmoke-100 rounded-[10px] rounded-bl-none px-3 sm:px-4 py-2 sm:py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-noble-black-400" />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-[10px] mb-3 sm:mb-4">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-[10px] sm:text-xs text-red-700 break-words">{error}</p>
          </div>
        )}

        <div ref={messages_end_ref as any} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-3 sm:px-4 pb-3 sm:pb-4">
        <div className="bg-white rounded-[12px] sm:rounded-[16px] overflow-hidden shadow-[0px_-2px_8px_rgba(0,0,0,0.04)]">
          <form onSubmit={handle_send_message} className="flex flex-col p-2.5 sm:p-3.5 gap-1.5 sm:gap-2">
            {/* Model (System Prompt) Selector */}
            {!hide_model_selector && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-noble-black-400 flex-shrink-0" />
                <select
                  value={agent_type}
                  onChange={(e) => on_agent_type_change?.(e.target.value as AgentType)}
                  className="text-[10px] sm:text-xs text-noble-black-500 dark:text-white bg-transparent border-none outline-none cursor-pointer flex-1 min-w-0"
                >
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Text Input */}
            <input
              type="text"
              value={input_value}
              onChange={(e) => set_input_value(e.target.value)}
              placeholder={placeholder}
              disabled={is_loading || !on_send_message}
              className="w-full text-sm sm:text-base leading-5 sm:leading-6 text-noble-black-400 placeholder:text-noble-black-400 bg-transparent border-none outline-none"
            />

            {/* Actions Row */}
            <div className="flex items-center justify-end gap-3 sm:gap-4">
              {/* Send Button */}
              <button
                type="submit"
                disabled={!input_value.trim() || is_loading || !on_send_message}
                className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-[8px] bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {is_loading ? (
                  <Loader2 className="h-4 w-4 sm:h-[18px] sm:w-[18px] animate-spin text-white" />
                ) : (
                  <Send className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-white" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
