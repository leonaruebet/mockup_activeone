'use client'

/**
 * Mobile Hamburger Menu
 * Purpose: Dropdown navigation menu for mobile devices using Sheet component
 * Location: shared/ui/organisms/mobile_menu/mobile_menu.tsx
 *
 * Features:
 * - Hamburger button in topbar
 * - Dropdown from top using Sheet component from design system
 * - Full navigation items
 * - User profile section
 * - Backdrop overlay (from Sheet)
 * - Touch-friendly spacing (min 44px)
 * - Only visible on mobile (<768px)
 */

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, LucideIcon, ChevronRight } from 'lucide-react'
import { Button } from '../../atoms/button'
import { EnhancedAvatar } from '../../atoms/avatar'
import { Tag } from '../../atoms/tag'
import { cn } from '../../utils'
import { Logo } from '../../molecules/logo/logo'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../sheet/sheet'

interface MobileMenuItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  badge?: {
    count: number
    variant?: 'happy-orange' | 'stem-green' | 'day-blue' | 'red-power'
  }
  subItems?: MobileMenuItem[]
}

interface UserProfile {
  name: string
  email: string
  avatar?: string
  initials: string
  tier: 'free' | 'plus' | 'pro' | 'enterprise'
  tierLabel: string
}

interface MobileMenuProps {
  items: MobileMenuItem[]
  user?: UserProfile
  onLogout?: () => void
  className?: string
}

/**
 * MobileMenu Component
 *
 * @param items - Navigation items to display
 * @param user - User profile information
 * @param onLogout - Logout callback
 *
 * Usage:
 * ```tsx
 * <MobileMenu
 *   items={navigationItems}
 *   user={currentUser}
 *   onLogout={handleLogout}
 * />
 * ```
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({
  items,
  user,
  onLogout,
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleNavigate = (href: string) => {
    console.log('[MobileMenu] Navigating to:', href)
    router.push(href)
    setIsOpen(false)
  }

  const handleLogout = () => {
    console.log('[MobileMenu] Logout triggered')
    onLogout?.()
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Topbar - Only visible on mobile */}
      <header
        className={cn(
          // Positioning
          'fixed top-0 left-0 right-0 z-40',
          // Only show on mobile
          'block md:hidden',
          // Layout
          'h-14 px-4',
          // Styling
          'bg-whitesmoke-100 border-b border-noble-black-100',
          'flex items-center justify-between',
          // Shadow
          'shadow-sm',
          className
        )}
      >
        {/* Logo on Left */}
        <div className="flex items-center">
          <Logo size="sm" variant="mainColor" clickable={false} width={36} height={36} />
        </div>

        {/* Sheet with Hamburger Trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                // Touch target
                'w-11 h-11', // 44px
                // Styling
                'rounded-lg',
                'flex items-center justify-center',
                // Transitions
                'transition-all duration-200',
                'hover:bg-whitesmoke-200 active:scale-95'
              )}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-noble-black-400" />
            </button>
          </SheetTrigger>

          {/* Sheet Content - Dropdown from Top */}
          <SheetContent
            side="top"
            className={cn(
              // Only show on mobile
              'block md:hidden',
              // Positioning - below topbar
              'top-14 left-0 right-0',
              // Height
              'max-h-[calc(100vh-56px)]',
              // Styling
              'bg-whitesmoke-100 border-b border-noble-black-100',
              // Remove default padding from Sheet
              'p-0'
            )}
          >
        <div className="flex flex-col h-full">
          {/* Header - Close button provided by Sheet component */}
          <div className="flex items-center p-4 border-b border-noble-black-100">
            <SheetTitle className="text-lg font-semibold text-noble-black-500">Menu</SheetTitle>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="p-4 border-b border-noble-black-100">
              <div className="flex items-center gap-3">
                <EnhancedAvatar
                  src={user.avatar}
                  alt={user.name}
                  fallback={user.initials}
                  className="h-12 w-12 ring-2 ring-orange-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-noble-black-500 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-noble-black-300 truncate">
                    {user.email}
                  </p>
                  <div className="mt-1">
                    <Tag
                      variant={
                        user.tier === 'plus' ? 'happy-orange' :
                        user.tier === 'pro' ? 'heisenberg-blue' :
                        user.tier === 'enterprise' ? 'purple-blue' :
                        'gray'
                      }
                      size="sm"
                      className="text-[10px] px-2 py-0.5"
                    >
                      {user.tierLabel}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-2">
            {items.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                pathname={pathname ?? ''}
                onNavigate={handleNavigate}
              />
            ))}
          </nav>

          {/* Footer Actions */}
          {onLogout && (
            <div className="p-4 border-t border-noble-black-100">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}

/**
 * MenuItem Component
 * Purpose: Renders individual menu item with sub-items support
 */
const MenuItem: React.FC<{
  item: MobileMenuItem
  pathname: string
  onNavigate: (href: string) => void
}> = ({ item, pathname, onNavigate }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const IconComponent = item.icon
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const hasSubItems = item.subItems && item.subItems.length > 0

  return (
    <div className="mb-1">
      {/* Main Item */}
      <button
        onClick={() => {
          if (hasSubItems) {
            setIsExpanded(!isExpanded)
          } else {
            onNavigate(item.href)
          }
        }}
        className={cn(
          // Layout
          'w-full flex items-center gap-3 px-3 py-3',
          // Touch target: min 44px
          'min-h-[44px]',
          // Styling
          'rounded-lg transition-colors',
          // Active state
          isActive
            ? 'bg-orange-50 text-primary-600'
            : 'text-noble-black-400 hover:bg-whitesmoke-200',
        )}
      >
        <IconComponent className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium flex-1 text-left">
          {item.label}
        </span>
        {item.badge && item.badge.count > 0 && (
          <Tag
            variant={item.badge.variant || 'happy-orange'}
            size="sm"
            className="text-[10px] px-2 py-0.5"
          >
            {item.badge.count}
          </Tag>
        )}
        {hasSubItems && (
          <ChevronRight
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        )}
      </button>

      {/* Sub Items */}
      {hasSubItems && isExpanded && (
        <div className="ml-8 mt-1 space-y-1">
          {item.subItems!.map((subItem) => {
            const SubIconComponent = subItem.icon
            const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/')

            return (
              <button
                key={subItem.id}
                onClick={() => onNavigate(subItem.href)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2',
                  'min-h-[40px]',
                  'rounded-lg text-sm transition-colors',
                  isSubActive
                    ? 'bg-orange-50 text-primary-600'
                    : 'text-noble-black-300 hover:bg-whitesmoke-200'
                )}
              >
                <SubIconComponent className="w-4 h-4" />
                <span>{subItem.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * useMobileMenuItems Hook
 * Purpose: Convert sidebar items to mobile menu format
 */
export const useMobileMenuItems = (sidebarItems: any[]): MobileMenuItem[] => {
  return sidebarItems.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    icon: item.icon,
    badge: item.badge,
    subItems: item.subItems?.map((sub: any) => ({
      id: sub.id,
      label: sub.label,
      href: sub.href,
      icon: sub.icon,
    })),
  }))
}
