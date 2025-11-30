'use client';

/**
 * Chat Layout Template
 * Purpose: Layout template for chat-focused pages with chatbot as main content
 * Location: shared/ui/templates/chat_layout/chat_layout.tsx
 *
 * @description
 * Provides a layout where the chatbot is the main focus in the center:
 * - Includes workspace sidebar and topbar (separate, not nested in glass container)
 * - Center: Full-width chatbot interface (main content)
 * - Right: Optional list/sidebar component
 * - Responsive design with mobile-first approach
 * - Smooth transitions and proper spacing
 *
 * @example
 * <ChatLayout
 *   title="Chat"
 *   subtitle="View conversations"
 *   projectId="123"
 *   projectName="My Project"
 *   chatbot_id={chatbot._id.toString()}
 *   chatbot_name={chatbot.name}
 *   org_id={org_id}
 *   agent_type="customer_service"
 *   on_send_message={handleSendMessage}
 *   on_reset={handleReset}
 *   messages={messages}
 *   right_panel_content={<UserList />}
 * />
 */

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { ResizableWorkspaceLayout } from '../resizable_workspace_layout';
import { Topbar } from '../../organisms/topbar';
import { AgentChatbot } from '../../organisms/agent_chatbot';
import type { AgentType, Message } from '../../organisms/agent_chatbot/agent_chatbot';
import { useSidebarWidth } from '../../context/sidebar_context';
import { get_local_storage_item, set_local_storage_item, STORAGE_KEYS } from '../../utils/local_storage';
import { Typography } from '../../atoms/typography/typography';

// Re-export AIMode type for template type compatibility
export type AIMode = 'lite' | 'basic' | 'pro';

export interface ChatLayoutProps {
  // Page layout props
  /** Page title displayed in the header */
  title?: string;
  /** Subtitle displayed below the title */
  subtitle?: string;
  /** Organization ID for workspace sidebar */
  organizationId?: string;
  /** User tier from organization */
  userTier?: 'free' | 'plus' | 'pro' | 'enterprise';
  /** Organization name */
  orgName?: string;
  /** Custom header actions to display in the workspace header */
  headerActions?: React.ReactNode;
  /** Project ID for topbar navigation */
  projectId?: string;
  /** Project name for topbar */
  projectName?: string;
  /** Array of user roles for admin access check */
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
  /** Hide model selector dropdown (useful when agent type is fixed) */
  hide_model_selector?: boolean;
  /** Hide AI mode selector (Lite/Basic/Pro) */
  hide_ai_mode_selector?: boolean;
  /** Hide collapse toggle button from chatbot */
  hide_collapse_toggle?: boolean;
  /** Show username instead of reset button */
  show_username?: string;
  /** Admin view mode: user messages on LEFT, bot responses on RIGHT */
  is_admin_view?: boolean;

  // Layout-specific props
  /** Right panel content (for chat history list, settings, etc.) */
  right_panel_content?: React.ReactNode;
  /** Show/hide right panel */
  show_right_panel?: boolean;
  /** Initial collapsed state for right panel */
  initial_right_panel_collapsed?: boolean;
  /** Right panel header title */
  right_panel_header_title?: React.ReactNode;
  /** Right panel header icon */
  right_panel_header_icon?: React.ReactNode;
  /** Additional className for the layout wrapper */
  className?: string;
}

/**
 * Chat layout component with chatbot as main focus
 * Includes workspace sidebar, topbar separately (not nested in glass container)
 */
export function ChatLayout({
  title,
  subtitle,
  organizationId,
  userTier,
  orgName,
  headerActions,
  projectId,
  projectName,
  userRoles = [],
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
  hide_model_selector = false,
  hide_ai_mode_selector = false,
  hide_collapse_toggle = false,
  show_username,
  is_admin_view = false,
  right_panel_content,
  show_right_panel = true,
  initial_right_panel_collapsed = false,
  right_panel_header_title,
  right_panel_header_icon,
  className = '',
}: ChatLayoutProps) {
  // Get workspace sidebar state for responsive layout
  const { isCollapsed: isSidebarCollapsed } = useSidebarWidth();

  // Right panel collapse state with localStorage persistence
  const [isRightPanelCollapsed, setIsRightPanelCollapsedState] = React.useState<boolean>(initial_right_panel_collapsed);

  // Load state from localStorage after hydration to avoid SSR mismatch
  React.useEffect(() => {
    const saved_collapsed = get_local_storage_item<boolean>(STORAGE_KEYS.RIGHT_PANEL_COLLAPSED, initial_right_panel_collapsed);
    setIsRightPanelCollapsedState(saved_collapsed);
  }, [initial_right_panel_collapsed]);

  // Wrapper function to persist right panel state to localStorage
  const setIsRightPanelCollapsed = React.useCallback((collapsed: boolean) => {
    setIsRightPanelCollapsedState(collapsed);
    set_local_storage_item(STORAGE_KEYS.RIGHT_PANEL_COLLAPSED, collapsed);
  }, []);

  return (
    <ResizableWorkspaceLayout
      organizationId={organizationId}
      userTier={userTier}
      orgName={orgName}
      showTopbar={true}
      projectName={projectName}
      projectId={projectId}
      userRoles={userRoles}
    >
      {/* Main Content Area - No glass container wrapper */}
      <div className="flex flex-col h-full w-full">
        {/* Chat Layout Content - Chatbot + Right Panel */}
        <div className={`flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden ${className}`}>
          {/* Main Content - Chatbot in Center - No collapse toggle */}
          <div className="flex-1 min-w-0">
            <AgentChatbot
              key={`chatbot-${chatbot_id}`}
              chatbot_id={chatbot_id}
              chatbot_name={chatbot_name}
              org_id={org_id}
              agent_type={agent_type}
              on_agent_type_change={on_agent_type_change}
              on_send_message={has_knowledge_base ? on_send_message : undefined}
              on_reset={on_reset}
              is_collapsed={false}
              on_collapse_change={undefined}
              messages={messages}
              overlay_message={has_knowledge_base ? undefined : overlay_message}
              hide_model_selector={hide_model_selector}
              hide_ai_mode_selector={hide_ai_mode_selector}
              hide_collapse_toggle={hide_collapse_toggle}
              show_username={show_username}
              is_admin_view={is_admin_view}
            />
          </div>

          {/* Right Panel - Optional List/Sidebar Component with collapse toggle */}
          {show_right_panel && (
            <div
              className={`transition-all duration-300 ease-in-out ${
                isRightPanelCollapsed
                  ? 'w-12 lg:flex-shrink-0' // Collapsed: just show toggle button
                  : isSidebarCollapsed
                  ? 'w-full lg:w-96 lg:flex-shrink-0' // More width when workspace sidebar is collapsed
                  : 'w-full lg:w-80 lg:flex-shrink-0' // Standard width when workspace sidebar is open
              }`}
            >
              {isRightPanelCollapsed ? (
                /* Collapsed: Show icon button to expand */
                <div className="flex items-center justify-center h-full">
                  <button
                    onClick={() => setIsRightPanelCollapsed(false)}
                    className="w-9 h-9 flex items-center justify-center bg-white rounded-[12px] border border-noble-black-100 hover:border-primary-600 transition-all hover:scale-105"
                    aria-label="Expand user list"
                  >
                    {right_panel_header_icon || (
                      <svg
                        className="w-5 h-5 text-noble-black-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                /* Expanded: Show header with toggle and content - Match chatbot glass styling */
                <div className="h-full flex flex-col bg-noble-black-100/80 backdrop-blur-xl rounded-t-[24px] border border-white/40 overflow-hidden shadow-l">
                  {/* Header Section with Toggle - Match chatbot header exactly */}
                  <div className="bg-white rounded-t-[24px] p-3 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0">
                    <div className="flex items-center justify-between gap-2">
                      {/* Header Title */}
                      <div className="flex items-center gap-2">
                        {right_panel_header_title}
                      </div>

                      {/* Collapse Button */}
                      <button
                        onClick={() => setIsRightPanelCollapsed(true)}
                        className="h-8 w-8 flex items-center justify-center rounded-[10px] bg-white border border-noble-black-100 hover:border-primary-600 transition-colors flex-shrink-0"
                        aria-label="Collapse user list"
                      >
                        <ChevronRight className="h-5 w-5 text-noble-black-500" />
                      </button>
                    </div>
                  </div>

                  {/* Right Panel Content */}
                  <div className="flex-1 overflow-hidden">
                    {right_panel_content}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ResizableWorkspaceLayout>
  );
}
