'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { LayoutGrid, Settings, Users, PanelLeftClose, PanelLeftOpen, LucideIcon, MessageSquare, Bot, Link2, ChevronDown, Building2, UserPlus, User, CreditCard, ClipboardList, Shield, Sparkles, Database } from 'lucide-react'
import { Button } from '../../atoms/button'
import { Tag } from '../../index'
import { useWorkspace } from '../../hooks/useWorkspace'
import { useBetterAuth as useAuth } from '../../hooks/useBetterAuth'
import { useSidebarWidth } from '../../context/sidebar_context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown_menu'
import { EnhancedAvatar } from '../../atoms/avatar'
import { SidebarLanguageSwitcher } from '../../molecules/sidebar_language_switcher'
import { useLocaleFont } from '../../hooks/use-locale-font'
import { SidebarLogo } from '../../molecules/logo'
import { CreditsDisplay } from '../../molecules/credits_display'
import { use_usage_tracking } from '../../hooks/use_usage_tracking'
import { cn } from '../../utils'
import { useSidebarGlass } from '../../styles/workspace-glass'
import { is_admin, has_admin_access } from '@shared/permissions/client_helpers'
import type { SystemRole } from '@shared/db/types'

// Navigation item interface
interface NavigationItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  badge?: {
    count: number
    variant?: 'happy-orange' | 'heisenberg-blue' | 'stem-green' | 'red-power' | 'day-blue' | 'purple-blue' | 'sunglow' | 'electric-green'
  }
  roles?: string[]
  subItems?: NavigationItem[] // Add support for sub-items
}

interface WorkspaceSidebarProps {
  className?: string
  organizationId?: string
  navigationItems?: NavigationItem[]
  userRole?: string
  userTier?: 'free' | 'plus' | 'pro' | 'enterprise'
  orgName?: string
  userRoles?: string[] // Array of user roles for admin access check
  disableToggle?: boolean // Disable the collapse/expand toggle button (for public pages)
  logoUrl?: string // Custom logo URL (for public pages) - when provided, logo becomes clickable external link
}

/**
 * Navigation Item Component
 * Purpose: Renders a single navigation item with active state and optional sub-items
 * Memoized to prevent unnecessary re-renders
 */
const NavItem = React.memo(function NavItem({
  item,
  isActive,
  onNavigate,
  currentPath
}: {
  item: NavigationItem
  isActive: boolean
  onNavigate: (href: string) => void
  currentPath: string
}) {
  const IconComponent = item.icon
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Auto-expand if any sub-item is active
  React.useEffect(() => {
    if (item.subItems) {
      const hasActiveSubItem = item.subItems.some(subItem =>
        currentPath === subItem.href || currentPath.startsWith(subItem.href + '/')
      )
      if (hasActiveSubItem) {
        setIsExpanded(true)
      }
    }
  }, [item.subItems, currentPath])

  // Check if any sub-item is active
  const hasActiveSubItem = item.subItems?.some(subItem =>
    subItem.href.endsWith('/agents')
      ? currentPath === subItem.href
      : currentPath.startsWith(subItem.href)
  )

  return (
    <div className="space-y-0.5">
      <div
        key={item.id}
        className={cn(
          "relative transition-colors group mx-4 rounded-lg",
          isActive ? "font-semibold hover:bg-orange-50/30" : "hover:bg-orange-50/30"
        )}
        title={item.label}
      >
        {/* Orange line indicator removed */}
        <button
          onClick={() => {
            if (item.subItems) {
              setIsExpanded(!isExpanded)
            } else {
              onNavigate(item.href)
            }
          }}
          className="w-full flex items-center justify-between px-4 py-2 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <IconComponent className={cn("w-4 h-4", isActive ? "text-orange-600" : "text-noble-black-400")} />
            <span className={cn("text-xs", isActive ? "text-noble-black-600" : "text-noble-black-400")}>{item.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {item.badge && item.badge.count > 0 && (
              <Tag
                variant={item.badge.variant || 'happy-orange'}
                size="sm"
                className="text-[10px] px-3 py-0.5 h-5 rounded-full leading-none min-w-[24px]"
              >
                {item.badge.count}
              </Tag>
            )}
            {item.subItems && (
              <ChevronDown
                className={cn(
                  "w-3 h-3 text-noble-black-400 transition-transform duration-200",
                  isExpanded ? "rotate-180" : "rotate-0"
                )}
              />
            )}
          </div>
        </button>
      </div>

      {/* Sub-items */}
      {item.subItems && isExpanded && (
        <div className="ml-4 mr-4
         space-y-0.5">
          {item.subItems.map((subItem) => {
            // Exact match for main agents page, or starts with for sub-pages
            const isSubActive = subItem.href.endsWith('/agents')
              ? currentPath === subItem.href
              : currentPath.startsWith(subItem.href)

            return (
              <div
                key={subItem.id}
                className="relative group mx-2"
              >
                <button
                  onClick={() => onNavigate(subItem.href)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors",
                    isSubActive
                      ? "text-orange-600 font-semibold bg-orange-50"
                      : "text-noble-black-400 hover:bg-orange-50/30"
                  )}
                >
                  <span className="text-xs">
                    {subItem.label}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

/**
 * User Profile Dropdown Component
 * Purpose: Renders user profile with dropdown menu
 */
function UserProfileDropdown({
  displayUser,
  user,
  fontClass,
  sidebarWidth,
  isCollapsed,
  tNav,
  onNavigate,
  onLogout,
  calculateUserNameWidth,
  userRoles = []
}: {
  displayUser: any
  user: any
  fontClass: string
  sidebarWidth: number
  isCollapsed: boolean
  tNav: any
  onNavigate: (href: string) => void
  onLogout: (e?: React.MouseEvent) => void
  calculateUserNameWidth: (width: number, collapsed: boolean) => number
  userRoles?: string[]
}) {
  /**
   * Check if user has any admin-related roles
   * Purpose: Determine if Admin Panel link should be shown
   * Uses: is_admin() helper from @shared/permissions/helpers
   */
  const hasAdminRole = React.useMemo(() => {
    console.log('[WorkspaceSidebar] UserProfileDropdown roles check:', {
      userRoles,
      userRolesType: typeof userRoles,
      isArray: Array.isArray(userRoles),
      length: userRoles?.length,
      has_admin: userRoles?.includes('admin'),
      has_super_admin: userRoles?.includes('super_admin'),
      result: is_admin(userRoles as SystemRole[])
    });
    return is_admin(userRoles as SystemRole[])
  }, [userRoles])
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-orange-50/30 focus:outline-none focus-visible:ring-0 active:scale-100 justify-start flex-shrink min-w-0 max-w-[calc(100%-40px)]"
        >
          <EnhancedAvatar
            src={displayUser.avatar}
            alt={displayUser.name}
            fallback={displayUser.initials}
            className="h-5 w-5 ring-1 ring-orange-100"
          />
          <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
            <span
              className={`text-xs font-semibold leading-tight text-noble-black-400 ${fontClass}`}
              title={displayUser.name && displayUser.name !== 'undefined undefined' ? displayUser.name : (user?.email?.split('@')[0] || 'User')}
              style={{
                maxWidth: `${calculateUserNameWidth(sidebarWidth, isCollapsed)}px`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {displayUser.name && displayUser.name !== 'undefined undefined' ? displayUser.name : (user?.email?.split('@')[0] || 'User')}
            </span>
            <div className="mt-1">
              <Tag
                variant={displayUser.tier === 'plus' ? 'happy-orange' : displayUser.tier === 'pro' ? 'heisenberg-blue' : displayUser.tier === 'enterprise' ? 'purple-blue' : 'gray'}
                size="sm"
                className="h-4 leading-none !text-primary-600"
              >
                {displayUser.tierLabel}
              </Tag>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-white border border-noble-black-100 shadow-lg rounded-lg"
        align="end"
        forceMount
        sideOffset={4}
      >
        <DropdownMenuLabel className="font-normal bg-white px-3 py-2">
          <div className="flex flex-col space-y-1.5">
            <p className={`text-sm font-medium leading-none text-noble-black-600 truncate ${fontClass}`} title={displayUser.name && displayUser.name !== 'undefined undefined' ? displayUser.name : (user?.email?.split('@')[0] || 'User')}>
              {displayUser.name && displayUser.name !== 'undefined undefined' ? displayUser.name : (user?.email?.split('@')[0] || 'User')}
            </p>
            <p className={`text-xs leading-none text-noble-black-400 truncate ${fontClass}`} title={displayUser.email}>{displayUser.email}</p>
            <div className="pt-0.5">
              <Tag
                variant={displayUser.tier === 'plus' ? 'happy-orange' : displayUser.tier === 'pro' ? 'heisenberg-blue' : displayUser.tier === 'enterprise' ? 'purple-blue' : 'gray'}
                size="sm"
                className="!text-primary-600"
              >
                {displayUser.tierLabel}
              </Tag>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-noble-black-100" />
        <DropdownMenuItem
          onClick={() => onNavigate('/profile')}
          className="cursor-pointer hover:bg-primary-50 text-noble-black-500 px-3 py-2"
        >
          <User className="mr-2 h-4 w-4" />
          {tNav('profile')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onNavigate('/pricing')}
          className="cursor-pointer hover:bg-primary-50 text-noble-black-500 px-3 py-2"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {tNav('pricing')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onNavigate('/settings/organization')}
          className="cursor-pointer hover:bg-primary-50 text-noble-black-500 px-3 py-2"
        >
          <Building2 className="mr-2 h-4 w-4" />
          {tNav('organizationSettings') || 'Organization'}
        </DropdownMenuItem>
        {hasAdminRole && (
          <DropdownMenuItem
            onClick={() => onNavigate('/admin')}
            className="cursor-pointer hover:bg-primary-50 text-noble-black-500 px-3 py-2"
          >
            <Shield className="mr-2 h-4 w-4" />
            {tNav('adminPanel')}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-noble-black-100" />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer hover:bg-red-power-100 text-red-power-600 px-3 py-2"
        >
          {tNav('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function WorkspaceSidebar({
  className,
  organizationId,
  navigationItems,
  userRole,
  userTier: propUserTier,
  orgName: propOrgName,
  userRoles = [],
  disableToggle = false,
  logoUrl
}: WorkspaceSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const tNav = useTranslations('navigation')
  const tCommon = useTranslations('common')
  const { fontClass } = useLocaleFont()
  const { isCollapsed, toggleCollapsed, sidebarWidth } = useSidebarWidth()
  const { projects } = useWorkspace({ provider: 'mongodb', autoRefresh: false })
  const { user, signOut, isAuthenticated, profile } = useAuth()
  const projectCount = projects?.length || 0

  // DEBUG: Log userRoles received by WorkspaceSidebar
  console.log('[WorkspaceSidebar] Component mounted/updated:', {
    pathname,
    userRoles,
    userRolesType: typeof userRoles,
    isArray: Array.isArray(userRoles),
    length: userRoles?.length,
    has_admin: userRoles?.includes('admin'),
    has_super_admin: userRoles?.includes('super_admin')
  })

  const [organizationData, setOrganizationData] = useState<{
    name: string
    tier: 'free' | 'pro' | 'plus' | 'enterprise'
  } | null>(null)

  const effectiveUserRole = userRole || (user as any)?.role || 'user'
  const effectiveOrgId = organizationId || user?.org_id?.toString()

  const {
    usages,
    is_loading: usage_loading,
  } = use_usage_tracking(effectiveOrgId, isAuthenticated && !!effectiveOrgId)

  // Cache previous credits value to prevent flickering using ref
  const cachedCreditsRef = React.useRef(0)

  const total_credits = React.useMemo(() => {
    if (!usages || usages.length === 0) {
      return cachedCreditsRef.current
    }
    const credits = usages.reduce((sum, usage) => {
      if (usage.limit) {
        return sum + (usage.limit - usage.current_usage)
      }
      return sum
    }, 0)
    // Update ref with new value
    if (credits > 0) {
      cachedCreditsRef.current = credits
    }
    return credits
  }, [usages])

  // Set organization data
  React.useEffect(() => {
    if (propUserTier && propOrgName) {
      setOrganizationData({ name: propOrgName, tier: propUserTier })
      return
    }

    if (user) {
      const userAny = user as any
      const fallbackOrgName = userAny?.user_metadata?.organization_name ||
                             (user?.name ? `${user.name}'s Organization` : 'Personal Organization')
      setOrganizationData({ name: fallbackOrgName, tier: propUserTier || 'free' })
    }
  }, [propUserTier, propOrgName, user, user?.name])

  // Detect project context - memoized to avoid recalculation
  const { currentPath, isInsideProject, currentProjectId } = React.useMemo(() => {
    const normalizedPath = (pathname ?? '').replace(`/${locale}`, '')
    const path = normalizedPath || '/'
    const projectMatch = path.match(/^\/project\/([^/]+)/)
    return {
      currentPath: path,
      isInsideProject: !!projectMatch,
      currentProjectId: projectMatch ? projectMatch[1] : null
    }
  }, [pathname, locale])

  // Default navigation configuration - memoized
  const defaultNavItems = React.useMemo((): NavigationItem[] => {
    // No default navigation items - Overview moved to project-specific navigation
    const navItems: NavigationItem[] = [];
    return navItems;
  }, [tNav, projectCount])

  // Filter navigation items - memoized
  const filteredNavItems = React.useMemo(() => {
    const navItems = navigationItems || defaultNavItems
    return navItems.filter(item => {
      if (!item.roles || item.roles.length === 0) return true
      return item.roles.includes(effectiveUserRole)
    })
  }, [navigationItems, defaultNavItems, effectiveUserRole])

  // Project navigation items - memoized
  const projectNavItems = React.useMemo((): NavigationItem[] => {
    if (!isInsideProject || !currentProjectId) return []

    return [
      {
        id: 'overview',
        label: tNav('overview') || 'Overview',
        href: `/project/${currentProjectId}/overview`,
        icon: LayoutGrid,
      },
      {
        id: 'workflow',
        label: tNav('workflow') || 'Workflow',
        href: `/project/${currentProjectId}/workflow`,
        icon: Bot,
      },
      {
        id: 'history',
        label: tNav('history') || 'History',
        href: `/project/${currentProjectId}/history`,
        icon: ClipboardList,
      },
      {
        id: 'settings',
        label: tNav('settings') || 'Settings',
        href: `/project/${currentProjectId}/settings`,
        icon: Settings,
      }
    ]
  }, [isInsideProject, currentProjectId, tNav])

  // Real Estate navigation items - separate section with flat structure
  const realEstateNavItems = React.useMemo((): NavigationItem[] => {
    if (!isInsideProject || !currentProjectId) return []

    return [
      {
        id: 'realestate-properties',
        label: tNav('properties') || 'Properties',
        href: `/project/${currentProjectId}/realestate/properties`,
        icon: Building2,
      },
      {
        id: 'realestate-surveys',
        label: tNav('surveys') || 'Surveys',
        href: `/project/${currentProjectId}/realestate/surveys`,
        icon: ClipboardList,
      },
      {
        id: 'realestate-leads',
        label: tNav('leads') || 'Leads',
        href: `/project/${currentProjectId}/realestate/leads`,
        icon: UserPlus,
      }
    ]
  }, [isInsideProject, currentProjectId, tNav])

  // Check active route - memoized callback
  const isActiveRoute = React.useCallback((href: string) => {
    if (href === '/overview') return currentPath === '/overview'
    if (href.startsWith('/project/')) return currentPath === href
    // Special handling for organization routes - check for exact match or sub-paths
    if (href.startsWith('/organization/')) {
      return currentPath === href || currentPath.startsWith(href + '/')
    }
    return currentPath === href || (href !== '/' && currentPath.startsWith(href + '/'))
  }, [currentPath])

  // Calculate user name width
  const calculateUserNameWidth = React.useCallback((sidebarWidth: number, isCollapsed: boolean) => {
    if (isCollapsed) return 0
    const avatarWidth = 24
    const gap = 8
    const buttonPadding = 16
    const containerPadding = 32
    const safetyBuffer = 20
    const usedSpace = avatarWidth + gap + buttonPadding + containerPadding + safetyBuffer
    const availableWidth = sidebarWidth - usedSpace
    return Math.max(60, availableWidth)
  }, [])

  // Cache previous user data to prevent flickering using ref
  const cachedDisplayUserRef = React.useRef<any>(null)

  // Generate display user data
  const displayUser = React.useMemo(() => {
    // Return cached value if not authenticated or no user
    if (!isAuthenticated || !user) {
      return cachedDisplayUserRef.current
    }

    const email = user.email || 'user@example.com'
    const emailName = email.includes('@') ? email.split('@')[0] : 'user'

    const userAny = user as any
    const profileAny = profile as any

    const nameFields = [
      user?.name,
      profileAny?.full_name,
      userAny?.full_name,
      userAny?.user_metadata?.name,
      userAny?.user_metadata?.full_name,
      userAny?.user_metadata?.display_name,
      emailName
    ]

    const validNames = nameFields
      .filter(name =>
        name &&
        typeof name === 'string' &&
        name.trim() !== '' &&
        name !== 'undefined' &&
        name !== 'undefined undefined' &&
        !name.includes('undefined')
      )
      .map(name => name.trim())

    const rawDisplayName = validNames.length > 0 ? validNames[0] : emailName
    const displayName = rawDisplayName
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    const nameWords = displayName.split(' ').filter((word: string) => word && word.trim() !== '')
    const initials = nameWords.length > 1
      ? `${nameWords[0][0]}${nameWords[1][0]}`.toUpperCase()
      : displayName.slice(0, 2).toUpperCase()

    const localizedName = locale === 'th' && displayName === emailName
      ? `ผู้ใช้ ${emailName}`
      : displayName

    const tier = organizationData?.tier || 'free'
    const localizedTier = locale === 'th'
      ? (tier === 'plus' ? 'พลัส' : tier === 'pro' ? 'โปร' : tier === 'enterprise' ? 'องค์กร' : 'ฟรี')
      : (tier.charAt(0).toUpperCase() + tier.slice(1))

    const result = {
      name: localizedName,
      email: email,
      initials,
      tier: tier,
      tierLabel: localizedTier,
      avatar: userAny?.image || profileAny?.avatar_url || userAny?.avatar_url || userAny?.user_metadata?.avatar_url
    }

    // Update ref with new value
    if (result.email) {
      cachedDisplayUserRef.current = result
    }

    return result
  }, [isAuthenticated, user, profile, locale, organizationData])

  // Handlers - memoized to maintain referential equality
  const handleLogout = React.useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    try {
      await signOut()
      router.push(`/${locale}/auth/login`)
    } catch (error) {
      console.error('Logout failed:', error)
      router.push(`/${locale}/auth/login`)
    }
  }, [signOut, router, locale])

  const handleNavigation = React.useCallback((href: string) => {
    router.push(`/${locale}${href}`)
  }, [router, locale])

  const handleLanguageChange = React.useCallback((newLocale: string) => {
    router.push(`/${newLocale}${currentPath}`)
  }, [router, currentPath])

  const liquidGlassStyles = useSidebarGlass()

  // Early return for collapsed state
  if (isCollapsed) {
    return (
      <div className={cn('w-full h-full flex flex-col items-center', className)}>
        {/* Top Section - Logo and Expand Button */}
        <div className="flex flex-col items-center pt-6 space-y-3">
          {/* Logo */}
          <div className="pb-1">
            {logoUrl ? (
              <SidebarLogo externalHref={logoUrl} clickable={false} />
            ) : (
              <SidebarLogo onClick={disableToggle ? undefined : toggleCollapsed} clickable={!disableToggle} />
            )}
          </div>

          {/* Expand Button - Pure icon without background (hidden if toggle disabled) */}
          {!disableToggle && (
            <button
              onClick={toggleCollapsed}
              className="flex items-center justify-center hover:opacity-70 transition-opacity"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-5 w-5 text-noble-black-400" />
            </button>
          )}
        </div>

        {/* Middle Section - Navigation Icons (vertically centered) */}
        <div className="flex-1 flex items-center justify-center">
          {/* White Container with navigation icons only - Show context-relevant items */}
          {(filteredNavItems.length > 0 || (isInsideProject && (projectNavItems.length > 0 || realEstateNavItems.length > 0))) && (
            <div className="bg-white rounded-[16px] border border-noble-black-100 w-11 py-2 flex flex-col items-center space-y-2">
              {/* Show main navigation icons ONLY when NOT inside a project */}
              {!isInsideProject && filteredNavItems.map((item) => {
                const IconComponent = item.icon
                const isActive = isActiveRoute(item.href)
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      'w-9 h-9 flex items-center justify-center rounded-[12px] transition-all',
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-noble-black-400 hover:bg-whitesmoke-100'
                    )}
                    title={item.label}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                )
              })}

            {/* Project Navigation Icons - Show when inside project */}
            {isInsideProject && projectNavItems.map((item) => {
              const IconComponent = item.icon
              const isActive = isActiveRoute(item.href)
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-[12px] transition-all',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-noble-black-400 hover:bg-whitesmoke-100'
                  )}
                  title={item.label}
                >
                  <IconComponent className="h-4 w-4" />
                </button>
              )
            })}

            {/* Real Estate Navigation Icons - Show when inside project */}
            {isInsideProject && realEstateNavItems.map((item) => {
              const IconComponent = item.icon
              const isActive = isActiveRoute(item.href)
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-[12px] transition-all',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-noble-black-400 hover:bg-whitesmoke-100'
                  )}
                  title={item.label}
                >
                  <IconComponent className="h-4 w-4" />
                </button>
              )
            })}
            </div>
          )}
        </div>

        {/* Bottom Section - Language and Profile in ONE white container */}
        <div className="flex flex-col items-center pb-4">
          <div className="bg-white rounded-[16px] border border-noble-black-100 w-11 py-2 flex flex-col items-center space-y-2">
            {/* Language Switcher */}
            <div className="w-9 h-9 flex items-center justify-center">
              <SidebarLanguageSwitcher
                active_locale={locale}
                on_select={handleLanguageChange}
                is_collapsed={true}
                icon_only={true}
              />
            </div>

            {/* User Profile */}
            {isAuthenticated && displayUser && (
              <button
                onClick={() => handleNavigation('/profile')}
                className="w-9 h-9 flex items-center justify-center hover:bg-whitesmoke-100 rounded-[12px] transition-all"
                title={displayUser.name}
              >
                <EnhancedAvatar
                  src={displayUser.avatar}
                  alt={displayUser.name}
                  fallback={displayUser.initials}
                  className="w-6 h-6"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('w-full h-full flex flex-col', className)}
      style={{
        ...liquidGlassStyles
      }}
    >
      {/* Logo Section */}
      <div className="flex items-center h-16 pt-4 pb-2 relative" style={{
        justifyContent: 'space-between',
        paddingLeft: '16px',
        paddingRight: '12px'
      }}>
        {logoUrl ? (
          <SidebarLogo externalHref={logoUrl} clickable={false} />
        ) : (
          <SidebarLogo />
        )}
        {!disableToggle && (
          <button
            onClick={toggleCollapsed}
            className="flex items-center justify-center hover:opacity-70 transition-opacity"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5 text-noble-black-400" />
          </button>
        )}
      </div>

      {/* Credits Display - Always show when authenticated */}
      {isAuthenticated && (
        <CreditsDisplay
          credits={total_credits}
          label={tCommon('creditsRemaining')}
          is_loading={usage_loading && total_credits === 0}
          on_add_credits={() => router.push(`/${locale}/pricing`)}
        />
      )}

      {/* Navigation */}
      <div className="flex-1 py-3 overflow-hidden relative">
        {/* Show MENU section only when NOT inside a project */}
        {!isInsideProject && (
          <>
            {/* Menu Header */}
            <div className="px-4 mb-1">
              <h3 className="text-xs font-bold text-noble-black-300 uppercase tracking-wider">
                {tNav('menu') || 'MENU'}
              </h3>
            </div>

            {/* Main Navigation Items */}
            {filteredNavItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={isActiveRoute(item.href)}
                onNavigate={handleNavigation}
                currentPath={currentPath}
              />
            ))}
          </>
        )}

        {/* Project Navigation Section */}
        {isInsideProject && projectNavItems.length > 0 && (
          <>
            <div className="px-4 mb-1">
              <h3 className="text-xs font-bold text-noble-black-300 uppercase tracking-wider">
                {tNav('projects') || 'PROJECTS'}
              </h3>
            </div>
            <div className="space-y-1">
              {projectNavItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                  onNavigate={handleNavigation}
                  currentPath={currentPath}
                />
              ))}
            </div>
          </>
        )}

        {/* Real Estate Navigation Section */}
        {isInsideProject && realEstateNavItems.length > 0 && (
          <>
            <div className="px-4 mb-1 mt-4">
              <h3 className="text-xs font-bold text-noble-black-300 uppercase tracking-wider">
                {tNav('realestate') || 'REAL ESTATE'}
              </h3>
            </div>
            <div className="space-y-1">
              {realEstateNavItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                  onNavigate={handleNavigation}
                  currentPath={currentPath}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* User Profile and Language Section - Always render when authenticated */}
      <div className="pt-2 overflow-hidden px-3 py-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-2 w-full justify-between">
            {displayUser && (
              <UserProfileDropdown
                displayUser={displayUser}
                user={user}
                fontClass={fontClass}
                sidebarWidth={sidebarWidth}
                isCollapsed={isCollapsed}
                tNav={tNav}
                onNavigate={handleNavigation}
                onLogout={handleLogout}
                calculateUserNameWidth={calculateUserNameWidth}
                userRoles={userRoles}
              />
            )}
            <div className="flex-shrink-0" title={tCommon('language', { default: 'Language' })}>
              <SidebarLanguageSwitcher
                active_locale={locale}
                on_select={handleLanguageChange}
                is_collapsed={false}
                icon_only={true}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/auth/login`)}
              className="px-3 py-3 hover:bg-gray-50 transition-colors rounded-lg"
            >
              {tNav('login')}
            </Button>
            <div className="flex-shrink-0" title={tCommon('language', { default: 'Language' })}>
              <SidebarLanguageSwitcher
                active_locale={locale}
                on_select={handleLanguageChange}
                is_collapsed={false}
                icon_only={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkspaceSidebar
