'use client'

import * as React from 'react'
// Conditional next-intl import with fallback
let useLocale: any;
let useTranslations: any;
try {
  const nextIntl = require('next-intl');
  useLocale = nextIntl.useLocale;
  useTranslations = nextIntl.useTranslations;
} catch {
  useLocale = () => 'en'; // Default to English
  useTranslations = () => (key: string) => key; // Fallback for translations
}
import { useRouter, usePathname } from 'next/navigation'
import { cn, generate_slug } from '../../utils/utils'
// Import sidebar context from shared/ui
import { useSidebarWidth } from '../../context/sidebar_context'
// Import auth hook to get organization data
import { useBetterAuth } from '../../hooks/useBetterAuth'
// Import mobile menu for hamburger integration
import { MobileMenu } from '../mobile_menu'
// Import ChevronRight, Menu, Share2, Plus, Users, Bell icons
import { ChevronRight, Menu, Share2, Plus, Users, Bell } from 'lucide-react'
// Import logo for admin pages
import { SidebarLogo } from '../../molecules/logo'
// Import dropdown menu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown_menu'
// Import Modal for organization actions
import { Modal } from '../../molecules/modal'
// Import Input for form fields
import { Input } from '../../atoms/input'



/**
 * Redesigned topbar component props
 */
interface TopbarProps {
  notificationCount?: number
  showSearch?: boolean
  className?: string
  fixedWithSidebar?: boolean // New prop for fixed positioning with sidebar
  showOrganization?: boolean // New prop to show/hide organization display (deprecated - now shows breadcrumbs)
  organizationName?: string // Override organization name
  organizationTier?: 'free' | 'pro' | 'plus' | 'enterprise' // Override organization tier
  onSwitchOrganization?: () => void // Callback for switching organization
  projectName?: string // Project name to display in breadcrumb
  projectId?: string // Project ID for navigation
  pageName?: string // Current page name to display in breadcrumb
  mobileMenuItems?: any[] // Mobile menu items for hamburger menu
  mobileUserProfile?: any // User profile for mobile menu
  showLogo?: boolean // Show logo in topbar (for admin pages)
  logoHref?: string // Logo click href (defaults to '/overview')
}

/**
 * Redesigned Top Bar Component
 *
 * Features:
 * - Organization display with switch functionality
 * - Search functionality (optional)
 * - Language switcher
 * - Notification bell with badge
 * - User profile dropdown (authentication-aware)
 * - Responsive design
 * - Removes logo duplication (now only in sidebar)
 * - Handles own authentication state
 *
 * @param notificationCount - Number of unread notifications
 * @param showSearch - Whether to show search input
 * @param className - Additional CSS classes
 * @param showOrganization - Whether to show organization display
 * @param organizationName - Override organization name
 * @param organizationTier - Override organization tier
 * @param onSwitchOrganization - Callback for switching organization
 * @returns JSX element representing the redesigned top bar
 */
export function Topbar({
  notificationCount = 0,
  showSearch = true,
  className,
  fixedWithSidebar = false,
  showOrganization = true,
  organizationName,
  organizationTier,
  onSwitchOrganization,
  projectName,
  projectId,
  pageName,
  mobileMenuItems = [],
  mobileUserProfile,
  showLogo = false,
  logoHref = '/overview'
}: TopbarProps) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const tNav = useTranslations('navigation')

  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[Topbar] render_state', {
      path: pathname,
      organizationName,
      organizationTier,
      projectName,
      showLogo,
      timestamp: new Date().toISOString()
    });

    return () => {
      // eslint-disable-next-line no-console
      console.debug('[Topbar] render_cleanup', {
        path: pathname,
        timestamp: new Date().toISOString()
      });
    };
  }, [pathname, organizationName, organizationTier, projectName, showLogo]);

  // Get auth state for organization data
  const { user, isAuthenticated } = useBetterAuth()

  // Detect if we're inside a project by checking the URL
  const isInsideProject = React.useMemo(() => {
    if (!pathname) return false
    const pathWithoutLocale = pathname.replace(`/${locale}`, '')
    return pathWithoutLocale.startsWith('/project/')
  }, [pathname, locale])

  // Extract project ID from URL if not provided via props
  const detectedProjectId = React.useMemo(() => {
    if (projectId) return projectId
    if (!pathname) return null
    const pathWithoutLocale = pathname.replace(`/${locale}`, '')
    const match = pathWithoutLocale.match(/^\/project\/([^/]+)/)
    return match ? match[1] : null
  }, [pathname, locale, projectId])

  // Get dynamic sidebar width from context
  const { sidebarWidth, isCollapsed } = useSidebarWidth();
  // Calculate effective width (collapsed = 60px, expanded = sidebarWidth)
  const effectiveSidebarWidth = isCollapsed ? 60 : sidebarWidth;

  // Get organization data from user or props
  const [orgData, setOrgData] = React.useState<{
    name: string
    tier: 'free' | 'pro' | 'plus' | 'enterprise'
  } | null>(null)

  // Modal states for organization actions
  const [shareModalOpen, setShareModalOpen] = React.useState(false)
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [joinModalOpen, setJoinModalOpen] = React.useState(false)

  // Form states
  const [shareLink, setShareLink] = React.useState('')
  const [copied, setCopied] = React.useState(false)
  const [newOrgName, setNewOrgName] = React.useState('')

  const resolvedOrgTier = React.useMemo(
    () => (orgData?.tier || organizationTier || 'free') as 'free' | 'pro' | 'plus' | 'enterprise',
    [orgData, organizationTier]
  )
  const displayOrgName = React.useMemo(
    () => orgData?.name || organizationName || null,
    [orgData, organizationName]
  )
  const hasNotifications = notificationCount > 0

  React.useEffect(() => {
    if (!displayOrgName) {
      return;
    }
    // eslint-disable-next-line no-console
    console.debug('[Topbar] organization_display_ready', {
      organizationName: displayOrgName,
      organizationTier: resolvedOrgTier,
      notificationCount,
      timestamp: new Date().toISOString()
    });
  }, [displayOrgName, resolvedOrgTier, notificationCount]);

  React.useEffect(() => {
    /**
     * Purpose: Set organization data from props or user metadata
     * Input: organizationName, organizationTier, user
     * Output: Sets orgData state
     */
    const timestamp = new Date().toISOString();

    if (organizationName) {
      const normalizedTier = (organizationTier || 'free') as 'free' | 'pro' | 'plus' | 'enterprise';
      setOrgData((previous) => {
        if (previous?.name === organizationName && previous?.tier === normalizedTier) {
          return previous;
        }
        // eslint-disable-next-line no-console
        console.debug('[Topbar] org_state_from_props', {
          organizationName,
          organizationTier: normalizedTier,
          timestamp
        });
        return {
          name: organizationName,
          tier: normalizedTier
        };
      });
      return;
    }

    if (user) {
      const userAny = user as any;
      const fallbackOrgName = userAny?.user_metadata?.organization_name ||
        (user?.name ? `${user.name}'s Organization` : 'Personal Organization');
      const fallbackTier = (organizationTier || userAny?.user_metadata?.organization_tier || 'free') as 'free' | 'pro' | 'plus' | 'enterprise';

      setOrgData((previous) => {
        if (previous?.name === fallbackOrgName && previous?.tier === fallbackTier) {
          return previous;
        }
        // eslint-disable-next-line no-console
        console.debug('[Topbar] org_state_from_user', {
          fallbackOrgName,
          fallbackTier,
          timestamp
        });
        return {
          name: fallbackOrgName,
          tier: fallbackTier
        };
      });
      return;
    }

    setOrgData((previous) => {
      if (previous === null) {
        return previous;
      }
      // eslint-disable-next-line no-console
      console.debug('[Topbar] org_state_reset', { timestamp });
      return null;
    });
  }, [organizationName, organizationTier, user])

  // Determine positioning approach - always use inline style to avoid hydration mismatch
  const headerStyle = React.useMemo(() => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: 'transparent', // transparent background
      borderBottomWidth: '0px', // no border
    };

    if (!fixedWithSidebar) return baseStyle;

    // Always use inline style for left positioning to ensure SSR/client consistency
    return {
      ...baseStyle,
      left: `${effectiveSidebarWidth}px`
    };
  }, [fixedWithSidebar, effectiveSidebarWidth]);

  /**
   * Handle organization click
   * Purpose: Navigate to overview page or execute custom callback
   */
  const handleSwitchOrganization = React.useCallback(() => {
    if (onSwitchOrganization) {
      onSwitchOrganization()
    } else {
      // Default behavior: navigate to overview
      router.push(`/${locale}/overview`)
    }
  }, [onSwitchOrganization, router, locale])

  /**
   * Handle Share Organization
   * Purpose: Generate and display shareable organization link
   */
  const handleShareOrganization = React.useCallback(() => {
    // Generate shareable link (in production, this would be an invite link from the backend)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const inviteLink = `${baseUrl}/${locale}/join?org=${displayOrgName || 'organization'}`
    // eslint-disable-next-line no-console
    console.debug('[Topbar] share_link_generated', {
      inviteLink,
      organizationName: displayOrgName,
      timestamp: new Date().toISOString()
    });
    setShareLink(inviteLink)
    setShareModalOpen(true)
  }, [locale, displayOrgName])

  /**
   * Handle Copy Link
   * Purpose: Copy shareable link to clipboard
   */
  const handleCopyLink = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }, [shareLink])

  /**
   * Handle Create New Organization
   * Purpose: Open modal for creating a new organization
   */
  const handleCreateOrganization = React.useCallback(() => {
    setCreateModalOpen(true)
  }, [])

  /**
   * Handle Join Organization
   * Purpose: Open modal for joining an existing organization
   */
  const handleJoinOrganization = React.useCallback(() => {
    setJoinModalOpen(true)
  }, [])

  /**
   * Handle Projects breadcrumb click
   * Purpose: Navigate to overview (projects overview)
   */
  const handleProjectsClick = React.useCallback(() => {
    router.push(`/${locale}/overview`)
  }, [router, locale])

  /**
   * Extract current page name from pathname
   * Purpose: Get the primary page section name from URL (only the main section, not sub-pages)
   */
  const currentPage = React.useMemo(() => {
    if (pageName) return pageName
    if (!pathname) return null

    const pathWithoutLocale = pathname.replace(`/${locale}`, '')
    const segments = pathWithoutLocale.split('/').filter(Boolean)

    // Extract only the main page section after project/[id]/
    // For example: /project/123/agents/upload -> show only "Agents"
    // /project/123/integration/line/step1 -> show only "Integration"
    if (segments.length > 2 && segments[0] === 'project') {
      const mainSection = segments[2]

      // Page name mapping for better display names
      const pageNameMap: Record<string, string> = {
        'agents': 'Agents',
        'integration': 'Connect',
        'chatbot': 'Chatbot',
        'realestate': 'Real Estate',
        'settings': 'Settings',
        'analytics': 'Analytics',
        'team': 'Team',
        'billing': 'Billing',
      }

      return pageNameMap[mainSection] ||
             mainSection.charAt(0).toUpperCase() + mainSection.slice(1).replace(/-/g, ' ')
    }

    return null
  }, [pathname, locale, pageName])

  return (
    <>
      {/* Mobile Menu Component - Only visible on mobile */}
      {mobileMenuItems.length > 0 && mobileUserProfile && (
        <MobileMenu
          items={mobileMenuItems}
          user={mobileUserProfile}
        />
      )}

      <header
        className={cn(
          'fixed top-0 z-50 h-8 flex items-center',
          // Hide on mobile since MobileMenu has its own topbar
          'hidden md:flex',
          fixedWithSidebar ? 'right-0' : 'left-0 right-0 w-full',
          className
        )}
        style={headerStyle}
      >
        <div className="flex h-8 items-center justify-between w-full px-3">
          {/* Left Section: Logo (for admin) or Breadcrumb Navigation */}
          <div className="flex items-center gap-2">
          {/* Show Logo on Admin Pages */}
          {showLogo && (
            <SidebarLogo
              onClick={() => router.push(logoHref)}
              width={24}
              height={24}
            />
          )}

          {/* Show breadcrumbs for non-admin authenticated pages */}
          {!showLogo && isAuthenticated && isInsideProject && (
            <>
              {/* ActiveOne Brand */}
              <span className="text-xs font-medium text-noble-black-400">
                ActiveOne
              </span>

              {/* Separator */}
              <ChevronRight className="w-3 h-3 text-noble-black-300" />

              {/* Organization Name */}
              {displayOrgName && (
                <>
                  <button
                    onClick={handleSwitchOrganization}
                    className="text-xs font-medium text-noble-black-400 hover:text-primary-600 transition-colors cursor-pointer"
                    title="Go to dashboard"
                    aria-label="View organization overview"
                  >
                    {displayOrgName}
                  </button>

                  {/* Separator */}
                  <ChevronRight className="w-3 h-3 text-noble-black-300" />
                </>
              )}

              {/* Project Name */}
              <button
                onClick={handleProjectsClick}
                className="text-xs font-medium text-noble-black-400 hover:text-primary-600 transition-colors cursor-pointer"
                title="Go to projects"
              >
                {projectName || 'Project'}
              </button>

              {/* Current Page */}
              {currentPage && (
                <>
                  {/* Separator */}
                  <ChevronRight className="w-3 h-3 text-noble-black-300" />

                  <span className="text-xs font-medium text-noble-black-500 dark:text-white">
                    {currentPage}
                  </span>
                </>
              )}
            </>
          )}

          {/* When NOT inside project and NOT showing logo: Show organization name */}
          {!showLogo && isAuthenticated && !isInsideProject && (
            <>
              {/* ActiveOne Brand */}
              <span className="text-xs font-medium text-noble-black-400">
                ActiveOne
              </span>

              {displayOrgName && showOrganization && (
                <>
                  {/* Separator */}
                  <ChevronRight className="w-3 h-3 text-noble-black-300" />

                  <button
                    onClick={handleSwitchOrganization}
                    className="text-xs font-medium text-noble-black-500 dark:text-white hover:text-primary-600 transition-colors cursor-pointer"
                    title="Click to go to dashboard"
                    aria-label="View organization overview"
                  >
                    {displayOrgName}
                  </button>
                </>
              )}
            </>
          )}
          </div>

          {/* Right Section: Notification icon and organization name */}
          {isAuthenticated && displayOrgName && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="relative flex h-6 w-6 items-center justify-center rounded-md text-noble-black-400 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                aria-label={hasNotifications ? `Notifications (${notificationCount})` : 'Notifications'}
              >
                <Bell className="w-4 h-4" />
                {hasNotifications && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-primary-600 px-[5px] text-[10px] font-semibold text-white leading-none">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>

              <span aria-hidden="true" className="h-4 w-px bg-noble-black-200" />

              {showLogo ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="text-xs font-medium text-noble-black-400 hover:text-primary-600 transition-colors cursor-pointer px-2 py-1 rounded-md hover:bg-gray-50"
                      title="Organization menu"
                    >
                      {displayOrgName}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-noble-black-100">
                    <DropdownMenuItem
                      onClick={handleShareOrganization}
                      className="text-noble-black-400 hover:text-noble-black-500 hover:bg-primary-50 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleCreateOrganization}
                      className="text-noble-black-400 hover:text-noble-black-500 hover:bg-primary-50 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      <span>Create New</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleJoinOrganization}
                      className="text-noble-black-400 hover:text-noble-black-500 hover:bg-primary-50 cursor-pointer"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      <span>Join</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={handleSwitchOrganization}
                  className="text-xs font-medium text-noble-black-500 dark:text-white hover:text-primary-600 transition-colors cursor-pointer"
                  title="Click to go to dashboard"
                  aria-label="View organization overview"
                >
                  {displayOrgName}
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Share Organization Modal */}
      <Modal
        isOpen={shareModalOpen}
        onOpenChange={setShareModalOpen}
        title="Share Organization"
        description="Share this link with team members to invite them to your organization"
        icon={<Share2 className="w-6 h-6" />}
        size="default"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={shareLink}
              readOnly
              className="flex-1"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-noble-black-300">
            Anyone with this link can request to join your organization
          </p>
        </div>
      </Modal>

      {/* Create New Organization Modal */}
      <Modal
        isOpen={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Create New Organization"
        description="Create a new organization to manage separate teams and projects"
        icon={<Plus className="w-6 h-6" />}
        size="default"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-noble-black-500">
              Organization Name
            </label>
            <Input
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Enter organization name"
              className="w-full"
            />
            {newOrgName && (
              <p className="text-xs text-noble-black-300">
                Slug: {generate_slug(newOrgName)}
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Join Organization Modal */}
      <Modal
        isOpen={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        title="Join Organization"
        description="Enter an invite code or link to join an existing organization"
        icon={<Users className="w-6 h-6" />}
        size="default"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-noble-black-500">
              Invite Code or Link
            </label>
            <Input
              placeholder="Enter invite code or paste invite link"
              className="w-full"
            />
          </div>
          <p className="text-xs text-noble-black-300">
            Ask your organization admin for an invite code or link
          </p>
        </div>
      </Modal>
    </>
  )
}
