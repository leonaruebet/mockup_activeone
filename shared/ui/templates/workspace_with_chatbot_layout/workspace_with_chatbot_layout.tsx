'use client';

/**
 * Workspace Layout with Chatbot Sidebar Template
 * Purpose: Reusable template for agent pages with main content area and chatbot sidebar
 * Location: shared/ui/templates/workspace_with_chatbot_layout/workspace_with_chatbot_layout.tsx
 *
 * @description
 * Provides a standardized two-column layout for pages that need a chatbot sidebar:
 * - Left: Main content area with WorkspaceLayout (title, subtitle, content)
 * - Right: Chatbot sidebar with responsive width based on workspace sidebar state
 * - Proper spacing and alignment matching the design system
 * - Smooth transitions when workspace sidebar or chatbot collapses
 *
 * @example
 * <WorkspaceWithChatbotLayout
 *   title="Upload Knowledge"
 *   subtitle="Add files, text, and Q&As"
 *   chatbot_id={chatbot._id.toString()}
 *   chatbot_name={chatbot.name}
 *   org_id={org_id}
 *   agent_type="real_estate"
 *   on_agent_type_change={handleAgentTypeChange}
 *   on_send_message={handleSendMessage}
 *   on_reset={handleReset}
 *   messages={messages}
 *   headerActions={<Button>Index Now</Button>}
 * >
 *   <YourMainContent />
 * </WorkspaceWithChatbotLayout>
 */

import * as React from 'react';
import { ResizableWorkspaceLayout } from '../resizable_workspace_layout';
import { GlassPanel } from '../glass_panel';
import { AgentChatbot } from '../../organisms/agent_chatbot';
import type { AgentType, Message } from '../../organisms/agent_chatbot/agent_chatbot';
import { useSidebarWidth } from '../../context/sidebar_context';
import { get_local_storage_item, set_local_storage_item, STORAGE_KEYS } from '../../utils/local_storage';

// Re-export AIMode type for template type compatibility
export type AIMode = 'lite' | 'basic' | 'pro';

export interface WorkspaceWithChatbotLayoutProps {
  /** Page title displayed in the main content area */
  title: string;
  /** Subtitle displayed below the title */
  subtitle: string;
  /** Main content to be rendered in the workspace */
  children: React.ReactNode;
  /** Additional className for the main content wrapper */
  className?: string;
  /** Organization ID for workspace sidebar */
  organizationId?: string;
  /** User tier from organization */
  userTier?: 'free' | 'plus' | 'pro' | 'enterprise';
  /** Organization name */
  orgName?: string;
  /** Custom header actions to display in the workspace header */
  headerActions?: React.ReactNode;
  /** Optional content to render below title/subtitle in the header area (e.g., tabs) */
  headerExtension?: React.ReactNode;
  /** Project ID for topbar navigation */
  projectId?: string;
  /** Project name for topbar */
  projectName?: string;
  /** User roles for admin panel access */
  userRoles?: string[];

  // Chatbot-specific props
  /** Chatbot ID for API calls */
  chatbot_id: string;
  /** Chatbot display name */
  chatbot_name: string;
  /** Organization ID for chatbot context */
  org_id?: string;
  /** Current agent type */
  agent_type: AgentType;
  /** Callback when agent type changes */
  on_agent_type_change?: (type: AgentType) => void;
  /** Callback when user sends a message */
  on_send_message?: (message: string, mode?: AIMode, conversation_history?: Message[]) => Promise<string>;
  /** Callback when conversation is reset */
  on_reset?: () => void;
  /** Chat messages array */
  messages?: Message[];
  /** Whether chatbot has knowledge base */
  has_knowledge_base?: boolean;
  /** Overlay message when KB is not ready */
  overlay_message?: string;
  /** Initial collapsed state for chatbot */
  initial_chatbot_collapsed?: boolean;
  /** Hide model selector dropdown (useful when agent type is fixed) */
  hide_model_selector?: boolean;
  /** Hide AI mode selector (Lite/Basic/Pro) */
  hide_ai_mode_selector?: boolean;
  /** Whether to show border line under header title/subtitle (default: false) */
  showHeaderBorder?: boolean;
}

/**
 * Workspace layout with chatbot sidebar component
 * Provides consistent two-column layout with responsive chatbot sidebar
 */
/**
 * Render a workspace view that keeps the main content and chatbot sidebar aligned within the same height constraints.
 *
 * @param props - {@link WorkspaceWithChatbotLayoutProps} describing content metadata and chatbot behaviour.
 * @returns JSX element containing the main workspace panel beside the agent chatbot.
 */
export function WorkspaceWithChatbotLayout({
  title,
  subtitle,
  children,
  className = '',
  organizationId,
  userTier,
  orgName,
  headerActions,
  headerExtension,
  projectId,
  projectName,
  userRoles,
  chatbot_id,
  chatbot_name,
  org_id,
  agent_type,
  on_agent_type_change,
  on_send_message,
  on_reset,
  messages,
  has_knowledge_base = true,
  overlay_message,
  initial_chatbot_collapsed = false,
  hide_model_selector = false,
  hide_ai_mode_selector = false,
  showHeaderBorder = false,
}: WorkspaceWithChatbotLayoutProps) {
  console.info('[WorkspaceWithChatbotLayout] entry', {
    timestamp: new Date().toISOString(),
    chatbot_id,
    organizationId,
  });

  // Get workspace sidebar state for responsive chatbot width
  const { isCollapsed: isSidebarCollapsed } = useSidebarWidth();

  // Chatbot collapse state with localStorage persistence
  // Initialize with prop value to match SSR, then load from localStorage after hydration
  const [isChatbotCollapsed, setIsChatbotCollapsedState] = React.useState<boolean>(initial_chatbot_collapsed);

  // Load state from localStorage after hydration to avoid SSR mismatch
  React.useEffect(() => {
    const saved_collapsed = get_local_storage_item<boolean>(STORAGE_KEYS.CHATBOT_COLLAPSED, initial_chatbot_collapsed);
    setIsChatbotCollapsedState(saved_collapsed);
  }, [initial_chatbot_collapsed]);

  // Wrapper function to persist chatbot state to localStorage
  const setIsChatbotCollapsed = React.useCallback((collapsed: boolean) => {
    setIsChatbotCollapsedState(collapsed);
    set_local_storage_item(STORAGE_KEYS.CHATBOT_COLLAPSED, collapsed);
  }, []);

  React.useEffect(() => {
    console.info('[WorkspaceWithChatbotLayout] mount', {
      timestamp: new Date().toISOString(),
      chatbot_id,
    });
    return () => {
      console.info('[WorkspaceWithChatbotLayout] exit', {
        timestamp: new Date().toISOString(),
        chatbot_id,
      });
    };
  }, [chatbot_id]);

  return (
    <ResizableWorkspaceLayout
      organizationId={organizationId}
      userTier={userTier}
      orgName={orgName}
      userRoles={userRoles}
      showTopbar={true}
      projectId={projectId}
      projectName={projectName}
    >
      <div className="flex flex-col h-full w-full">
        <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
          {/* Main Content Area with GlassPanel directly */}
          <div className="flex-1 min-w-0 flex flex-col">
            <GlassPanel
              title={title}
              subtitle={subtitle}
              headerActions={headerActions}
              headerExtension={headerExtension}
              showWhiteContainer={false}
              showHeaderBorder={showHeaderBorder}
              className={className}
              shape="rounded_top_only"
              glass={true}
              elevation="none"
            >
              {children}
            </GlassPanel>
          </div>

          {/* Chatbot Sidebar */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isChatbotCollapsed
                ? 'w-9 lg:flex-shrink-0'
                : isSidebarCollapsed
                ? 'w-full lg:w-96 lg:flex-shrink-0'
                : 'w-full lg:w-80 lg:flex-shrink-0'
            }`}
          >
            <div className="flex h-full min-h-0 flex-col">
              <AgentChatbot
                key={`chatbot-${chatbot_id}`}
                chatbot_id={chatbot_id}
                chatbot_name={chatbot_name}
                org_id={org_id}
                agent_type={agent_type}
                on_agent_type_change={on_agent_type_change}
                on_send_message={on_send_message}
                on_reset={on_reset}
                is_collapsed={isChatbotCollapsed}
                on_collapse_change={setIsChatbotCollapsed}
                messages={messages}
                overlay_message={has_knowledge_base ? undefined : overlay_message}
                hide_model_selector={hide_model_selector}
                hide_ai_mode_selector={hide_ai_mode_selector}
              />
            </div>
          </div>
        </div>
      </div>
    </ResizableWorkspaceLayout>
  );
}
