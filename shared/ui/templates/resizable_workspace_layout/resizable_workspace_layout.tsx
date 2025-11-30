"use client";

/**
 * Resizable Workspace Layout Client Component
 * Provides resizable sidebar functionality with persistence
 * Mobile Integration: Includes MobileBottomNav and MobileMenu for mobile devices
 * @author Senior Developer (29 years experience)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { WorkspaceSidebar } from '../../organisms/workspace_sidebar';
import { Topbar } from '../../organisms/topbar';
import { MobileBottomNav, MobileMenu } from '../../organisms';
import { SidebarProvider, useSidebarWidth } from '../../context/sidebar_context';
import { GradientBackground } from '../../atoms/gradient_background';
import { Home, Building2, Bot, Settings, MessageSquare } from 'lucide-react';

interface ResizableWorkspaceLayoutProps {
  children: React.ReactNode;
  organizationId?: string;
  userTier?: 'free' | 'plus' | 'pro' | 'enterprise';
  orgName?: string;
  showTopbar?: boolean;
  showLogo?: boolean; // Show company logo in topbar (default: true)
  projectName?: string;
  projectId?: string;
  userRoles?: string[]; // Array of user roles for admin access
  sidebarLockedCollapsed?: boolean; // Lock sidebar in collapsed mode (for public pages)
  logoUrl?: string; // Custom logo URL (for public pages)
  customNavigationItems?: Array<{
    id: string;
    label: string;
    href: string;
    icon: any;
  }>;
  customBottomNavItems?: Array<{
    id: string;
    label: string;
    href: string;
    icon: any;
  }>; // Custom mobile bottom navigation items (for public pages)
}

const TOPBAR_HEIGHT = 32; // 32px (h-8)
const MOBILE_TOPBAR_HEIGHT = 56; // 56px (h-14)
const MOBILE_BOTTOMNAV_HEIGHT = 80; // 80px (h-20 = 5rem = 80px)

const SIDEBAR_WIDTH_KEY = 'workspace-sidebar-width';
const DEFAULT_SIDEBAR_WIDTH = 180; // 180px
const MIN_SIDEBAR_WIDTH = 160; // 160px minimum
const MAX_SIDEBAR_WIDTH = 500; // 500px maximum

/**
 * Internal resizable layout component that uses sidebar context
 * @param children - Child components to render in main content area
 * @param organizationId - Organization ID for WorkspaceSidebar
 * @returns JSX element with resizable sidebar layout
 */
function ResizableLayoutInternal({
  children,
  organizationId, // TEMPORARILY UNUSED: to eliminate organization access errors
  userTier,
  orgName,
  showTopbar = false,
  showLogo = false,
  projectName,
  projectId,
  userRoles = [],
  sidebarLockedCollapsed = false,
  logoUrl,
  customNavigationItems,
  customBottomNavItems
}: ResizableWorkspaceLayoutProps) {
  const { sidebarWidth, setSidebarWidth, isCollapsed: contextIsCollapsed, toggleCollapsed } = useSidebarWidth();

  // If sidebar is locked collapsed, always use collapsed state
  const isCollapsed = sidebarLockedCollapsed ? true : contextIsCollapsed;
  const [isResizing, setIsResizing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate effective sidebar width (collapsed = 60px for icon-only view)
  const effectiveSidebarWidth = isCollapsed ? 60 : sidebarWidth;

  // Force sidebar to collapsed state when locked on mount
  useEffect(() => {
    if (sidebarLockedCollapsed && !contextIsCollapsed) {
      toggleCollapsed();
    }
  }, [sidebarLockedCollapsed]);

  // Set loaded flag after mount to prevent hydration issues
  useEffect(() => {
    setIsLoaded(true);
  }, [sidebarWidth, isCollapsed]);

  /**
   * Handle mouse down on resize handle
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  /**
   * Handle mouse move during resize
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current || isCollapsed) return; // Don't resize when collapsed

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    
    // Clamp width within bounds
    const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, newWidth));
    
    setSidebarWidth(clampedWidth);
    localStorage.setItem(SIDEBAR_WIDTH_KEY, clampedWidth.toString());
  }, [isResizing, isCollapsed]);

  /**
   * Handle mouse up to stop resizing
   */
  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
    }
  }, [isResizing, sidebarWidth]);

  // Add global mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Use a simpler approach - just don't show loading state, let client render immediately
  // This prevents hydration mismatches by avoiding different server/client renders


  // Calculate sidebar height based on whether topbar is shown
  const sidebarTop = showTopbar ? TOPBAR_HEIGHT : 0;
  const sidebarHeight = showTopbar ? `calc(100vh - ${TOPBAR_HEIGHT}px)` : '100vh';

  // Mobile bottom navigation items - Property, Agents, Chat, Settings
  // Use custom items if provided (for public pages), otherwise use default based on projectId
  const bottomNavItems = customBottomNavItems || (projectId ? [
    {
      id: 'property',
      label: 'Property',
      href: `/project/${projectId}/realestate/properties`,
      icon: Building2
    },
    {
      id: 'agents',
      label: 'Agents',
      href: `/project/${projectId}/agents`,
      icon: Bot
    },
    {
      id: 'chat',
      label: 'Chat',
      href: `/project/${projectId}/chat`,
      icon: MessageSquare
    },
    {
      id: 'settings',
      label: 'Settings',
      href: `/project/${projectId}/settings`,
      icon: Settings
    },
  ] : [
    { id: 'overview', label: 'Overview', href: '/overview', icon: Home },
    { id: 'agents', label: 'Agents', href: '/agents', icon: Bot },
    { id: 'property', label: 'Property', href: '/property', icon: Building2 },
    { id: 'settings', label: 'Settings', href: '/profile', icon: Settings },
  ]);

  // Mobile hamburger menu items - mirrors sidebar navigation
  const mobileMenuItems = projectId ? [
    {
      id: 'overview',
      label: 'Overview',
      href: `/project/${projectId}`,
      icon: Home
    },
    {
      id: 'properties',
      label: 'Properties',
      href: `/project/${projectId}/realestate/properties`,
      icon: Building2
    },
    {
      id: 'agents',
      label: 'AI Agents',
      href: `/project/${projectId}/agents`,
      icon: Bot
    },
    {
      id: 'chat',
      label: 'Chat',
      href: `/project/${projectId}/chat`,
      icon: MessageSquare
    },
    {
      id: 'settings',
      label: 'Settings',
      href: `/project/${projectId}/settings`,
      icon: Settings
    },
  ] : [
    { id: 'overview', label: 'Overview', href: '/overview', icon: Home },
    { id: 'settings', label: 'Settings', href: '/settings', icon: Settings },
  ];

  // User profile for mobile menu
  const userProfile = {
    name: orgName || 'User',
    email: '',
    initials: orgName?.charAt(0)?.toUpperCase() || 'U',
    tier: (userTier || 'free') as 'free' | 'plus' | 'pro' | 'enterprise',
    tierLabel: userTier ? userTier.charAt(0).toUpperCase() + userTier.slice(1) : 'Free',
  };

  useEffect(() => {
    if (!showTopbar) {
      return;
    }
    // eslint-disable-next-line no-console
    console.debug('[ResizableLayoutInternal] topbar_props_synced', {
      organizationName: orgName,
      organizationTier: userTier,
      projectName,
      showLogo,
      timestamp: new Date().toISOString()
    });
  }, [showTopbar, orgName, userTier, projectName, showLogo]);

  return (
    <div ref={containerRef} className="min-h-screen relative">
      {/* Gradient Background - Behind everything */}
      <GradientBackground />

      {/* Mobile Menu with Topbar - Always show on mobile */}
      <MobileMenu
        items={mobileMenuItems}
        user={userProfile}
      />

      {/* Desktop Topbar - Fixed Position at top (only show if showTopbar=true on desktop) */}
      {showTopbar && (
        <Topbar
          fixedWithSidebar={false}
          showSearch={false}
          showLogo={showLogo}
          organizationName={orgName}
          organizationTier={userTier}
          projectName={projectName}
          projectId={projectId}
          className="hidden md:flex"
        />
      )}

      {/* Resizable Sidebar - Fixed Position below topbar - Hidden on mobile */}
      <div
        className="fixed left-0 overflow-hidden z-40 hidden md:block"
        style={{
          top: `${sidebarTop}px`,
          width: effectiveSidebarWidth,
          height: sidebarHeight,
          minHeight: sidebarHeight,
          maxHeight: sidebarHeight
        }}
      >
        <WorkspaceSidebar
          className="h-full w-full overflow-hidden"
          userTier={userTier}
          orgName={orgName}
          userRoles={userRoles}
          disableToggle={sidebarLockedCollapsed}
          logoUrl={logoUrl}
          navigationItems={customNavigationItems}
          // TEMPORARILY REMOVED: organizationId prop to eliminate organization access errors
          // organizationId={organizationId}
        />

        {/* Invisible Resize Handle - positioned over the sidebar border (only when not collapsed) */}
        {!isCollapsed && (
          <div
            className="absolute top-0 right-0 h-full cursor-col-resize"
            onMouseDown={handleMouseDown}
            style={{
              width: '8px'
            }}
            title="Drag to resize sidebar"
          />
        )}
      </div>

      {/* Main Content - With Left Margin for Fixed Sidebar and Top Margin for Topbar */}
      {/* Mobile: Top padding for mobile topbar (56px) + bottom padding for bottom nav (80px) */}
      {/* Desktop: Left margin for sidebar, no bottom padding, optional top padding for topbar */}
      <div
        className="h-screen overflow-hidden transition-all duration-300 ease-in-out relative flex flex-col pt-14 pb-20 md:pt-0 md:pb-0"
        style={{
          marginLeft: 0, // Mobile: no margin
          paddingTop: showTopbar ? `${TOPBAR_HEIGHT}px` : undefined // Desktop only: use topbar height if shown
        }}
      >
        {/* Add desktop margin via media query in style tag since we can't use responsive inline styles */}
        <style jsx>{`
          @media (min-width: 768px) {
            .main-content-wrapper {
              margin-left: ${effectiveSidebarWidth}px;
            }
          }
        `}</style>
        <div className="main-content-wrapper h-full">
          {/* Uniform padding: 16px all sides (gap-4 pattern), bottom 0 for full height */}
          <div
            className="w-full relative z-10 flex flex-col flex-1 h-full min-h-0"
            style={{
              // Top padding reduced to 16px to match left/right; bottom 0 and h-full to allow white container to calculate correctly
              padding: '16px 16px 0 16px'
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <MobileBottomNav items={bottomNavItems} />
    </div>
  );
}

/**
 * Main resizable workspace layout component  
 * @param children - Child components to render in main content area
 * @param organizationId - Organization ID for WorkspaceSidebar
 * @returns JSX element with resizable sidebar layout
 */
export function ResizableWorkspaceLayout({
  children,
  organizationId,
  userTier,
  orgName,
  showTopbar = false,
  showLogo = false,
  projectName,
  projectId,
  userRoles = [],
  sidebarLockedCollapsed = false,
  logoUrl,
  customNavigationItems,
  customBottomNavItems
}: ResizableWorkspaceLayoutProps) {
  // Provide sidebar context locally to ensure stability across environments
  return (
    <SidebarProvider>
      <ResizableLayoutInternal
        organizationId={organizationId}
        userTier={userTier}
        sidebarLockedCollapsed={sidebarLockedCollapsed}
        orgName={orgName}
        showTopbar={showTopbar}
        showLogo={showLogo}
        projectName={projectName}
        projectId={projectId}
        userRoles={userRoles}
        logoUrl={logoUrl}
        customNavigationItems={customNavigationItems}
        customBottomNavItems={customBottomNavItems}
      >
        {children}
      </ResizableLayoutInternal>
    </SidebarProvider>
  );
}
