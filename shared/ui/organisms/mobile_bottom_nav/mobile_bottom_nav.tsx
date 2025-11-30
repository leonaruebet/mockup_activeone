'use client'

/**
 * Mobile Bottom Navigation Bar
 * Purpose: Mobile-friendly bottom navigation (iOS/Android style)
 * Location: shared/ui/organisms/mobile_bottom_nav/mobile_bottom_nav.tsx
 *
 * Features:
 * - Fixed bottom position
 * - Touch-optimized buttons (min 44px)
 * - Active state indicators
 * - Icon + label layout
 * - Safe area support for iOS notch
 * - Only visible on mobile (<768px)
 */

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { cn } from '../../utils'

interface MobileBottomNavItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface MobileBottomNavProps {
  items: MobileBottomNavItem[]
  className?: string
}

/**
 * MobileBottomNav Component
 *
 * @param items - Navigation items to display (recommended: 4-5 max)
 * @param className - Additional CSS classes
 *
 * Usage:
 * ```tsx
 * <MobileBottomNav
 *   items={[
 *     { id: 'home', label: 'Home', href: '/home', icon: Home },
 *     { id: 'properties', label: 'Properties', href: '/properties', icon: Building2 },
 *     { id: 'chat', label: 'Chat', href: '/chat', icon: MessageSquare, badge: 3 },
 *     { id: 'profile', label: 'Profile', href: '/profile', icon: User },
 *   ]}
 * />
 * ```
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  items,
  className
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const currentPath = pathname ?? ''

  const handleNavigate = (href: string) => {
    console.log('[MobileBottomNav] Navigating to:', href)
    router.push(href)
  }

  return (
    <nav
      className={cn(
        // Positioning
        'fixed bottom-0 left-0 right-0 z-50',
        // Only show on mobile (<768px), hide on tablet and above
        'block md:hidden',
        // Background & border - light grey background
        'bg-whitesmoke-100 border-t border-noble-black-100',
        // Safe area for iOS notch
        'pb-safe',
        // Shadow
        'shadow-[0_-2px_10px_rgba(0,0,0,0.08)]',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const IconComponent = item.icon
          const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/')

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.href)}
              className={cn(
                // Layout
                'flex flex-col items-center justify-center',
                // Touch target: min 44px (iOS/Android guideline)
                'min-w-[60px] h-14',
                // Spacing
                'px-2',
                // Transitions
                'transition-all duration-200',
                // Active state
                isActive && 'scale-105'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon container with badge */}
              <div className="relative">
                <IconComponent
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isActive
                      ? 'text-primary-600' // Active: brand orange
                      : 'text-noble-black-300' // Inactive: light grey
                  )}
                />
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium transition-colors',
                  isActive
                    ? 'text-primary-600' // Active: brand orange
                    : 'text-noble-black-300' // Inactive: light grey
                )}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute bottom-0 w-1 h-1 bg-primary-600 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/**
 * useMobileBottomNavItems Hook
 * Purpose: Generate navigation items from workspace sidebar items
 *
 * Usage:
 * ```tsx
 * const mobileNavItems = useMobileBottomNavItems(sidebarItems)
 * ```
 */
export const useMobileBottomNavItems = (
  sidebarItems: any[],
  maxItems: number = 4
): MobileBottomNavItem[] => {
  // Take first N items (most important)
  return sidebarItems
    .slice(0, maxItems)
    .map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      icon: item.icon,
      badge: item.badge?.count || 0,
    }))
}
