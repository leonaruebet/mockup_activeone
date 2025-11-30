'use client';

/**
 * AdminSidebar
 * Purpose: Minimal clean admin sidebar with just white/grey colors
 * Location: shared/ui/organisms/admin_sidebar/admin_sidebar.tsx
 *
 * Features:
 * - Clean white background with grey borders
 * - Logo at top
 * - Collapsible with toggle button
 * - Drag-to-resize functionality
 * - Navigation items
 * - No heavy styling, just clean and functional
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Home,
  Users as UsersIcon,
  Shield,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  Activity,
  Key,
  Database,
  ShieldCheck,
  Network,
  type LucideIcon,
} from 'lucide-react';
import { Button, Tag, EnhancedAvatar } from '@shared/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown_menu';
import { SidebarLanguageSwitcher } from '../../molecules/sidebar_language_switcher/sidebar_language_switcher';
import { cn } from '@shared/ui/utils';
import { useSidebarWidth } from '../../context/sidebar_context';
import { useBetterAuth as useAuth } from '../../hooks/useBetterAuth';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
  section?: 'dashboard' | 'superadmin';
}

interface AdminSidebarProps {
  userRoles?: string[];
  userName?: string | null;
  userEmail?: string | null;
  onResize?: (width: number) => void;
}

/**
 * NavItem Component
 * Purpose: Renders a single navigation item with active state
 */
const NavItem = React.memo(function NavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: NavigationItem;
  isActive: boolean;
  onNavigate: (href: string) => void;
}) {
  const IconComponent = item.icon;

  return (
    <div
      className={cn(
        'relative group mx-4 rounded-lg',
        isActive ? 'font-semibold bg-whitesmoke-100' : ''
      )}
      title={item.label}
    >
      <button
        onClick={() => onNavigate(item.href)}
        className="w-full flex items-center gap-2 px-3 py-3 rounded-lg"
      >
        <IconComponent className={cn('w-4 h-4', isActive ? 'text-noble-black-600' : 'text-noble-black-400')} />
        <span className={cn('text-xs', isActive ? 'text-noble-black-600' : 'text-noble-black-400')}>
          {item.label}
        </span>
      </button>
    </div>
  );
});

const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 400;

/**
 * UserProfileDropdown Component
 * Purpose: Profile dropdown with avatar, name, role, and menu options
 */
const UserProfileDropdown = React.memo(function UserProfileDropdown({
  userName,
  userEmail,
  userRoles,
}: {
  userName?: string | null;
  userEmail?: string | null;
  userRoles?: string[];
}) {
  const router = useRouter();
  const locale = useLocale();
  const { signOut } = useAuth();

  // Get display name and initials
  const displayName = userName || userEmail?.split('@')[0] || 'Admin';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push(`/${locale}/signin`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-whitesmoke-100 focus:outline-none focus-visible:ring-0"
        >
          <EnhancedAvatar
            src={undefined}
            alt={displayName}
            fallback={initials}
            className="h-8 w-8 ring-1 ring-gray-200 text-xs"
          />
          <div className="flex flex-col items-start min-w-0 flex-1 overflow-hidden">
            <span className="text-xs font-semibold text-noble-black-600 truncate w-full">
              {displayName}
            </span>
            <Tag
              variant={userRoles?.includes('super_admin') ? 'destructive' : 'happy-orange'}
              size="sm"
              className="text-[10px] px-2 py-0.5 h-4 mt-1"
            >
              {userRoles?.includes('super_admin') ? 'Super Admin' : 'Admin'}
            </Tag>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white border border-noble-black-200 rounded-lg"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-noble-black-600">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-noble-black-200" />
        <DropdownMenuItem
          onClick={() => router.push(`/${locale}/profile`)}
          className="text-xs text-noble-black-600 cursor-pointer hover:bg-whitesmoke-100"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(`/${locale}/admin/settings`)}
          className="text-xs text-noble-black-600 cursor-pointer hover:bg-whitesmoke-100"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-noble-black-200" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-xs text-red-power-600 cursor-pointer hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export function AdminSidebar({ userRoles = [], userName, userEmail, onResize }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { sidebarWidth, setSidebarWidth, isCollapsed, toggleCollapsed } = useSidebarWidth();
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();

  // Get current path without locale
  const currentPath = pathname ? pathname.replace(`/${locale}`, '') || '/' : '/';

  // Calculate effective width
  const effectiveWidth = isCollapsed ? 64 : sidebarWidth;

  // Debug log
  console.log('[AdminSidebar] User data:', { userName, userEmail, userRoles, isCollapsed });

  // Navigation items organized by section
  // Note: No role filtering needed - /admin route already handles auth/redirect
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin',
      icon: Home,
      section: 'dashboard',
    },
    {
      id: 'users',
      label: 'Users',
      href: '/admin/users',
      icon: UsersIcon,
      section: 'dashboard',
    },
    {
      id: 'monitor',
      label: 'Monitor',
      href: '/admin/monitor',
      icon: Activity,
      section: 'dashboard',
    },
    {
      id: 'data-collecting',
      label: 'Data Collecting',
      href: '/admin/data-collecting',
      icon: Database,
      section: 'dashboard',
    },
    {
      id: 'access',
      label: 'Access',
      href: '/admin/access',
      icon: Key,
      section: 'superadmin',
    },
    {
      id: 'super_monitor',
      label: 'Super Admin Monitor',
      href: '/admin/super_monitor',
      icon: ShieldCheck,
      section: 'superadmin',
    },
    {
      id: 'diagram',
      label: 'Schema Diagram',
      href: '/admin/diagram',
      icon: Network,
      section: 'superadmin',
    },
  ];

  // No role filtering - /admin route already handles authentication
  // All navigation items are shown to authenticated admin users
  const filteredNavItems = navigationItems;

  // Log for debugging
  console.log('[AdminSidebar] Navigation items:', filteredNavItems.map(i => i.id));

  // Check if route is active
  const isActiveRoute = useCallback(
    (href: string) => {
      if (href === '/admin') return currentPath === '/admin';
      return currentPath === href || currentPath.startsWith(href + '/');
    },
    [currentPath]
  );

  // Handle navigation
  const handleNavigation = useCallback(
    (href: string) => {
      router.push(`/${locale}${href}`);
    },
    [router, locale]
  );

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !sidebarRef.current || isCollapsed) return;

    const newWidth = e.clientX;
    const clampedWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, newWidth));

    setSidebarWidth(clampedWidth);
    if (onResize) onResize(clampedWidth);
  }, [isResizing, isCollapsed, setSidebarWidth, onResize]);

  // Handle mouse up to stop resizing
  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
    }
  }, [isResizing]);

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

  // Handle language change
  const handleLanguageChange = useCallback(
    (nextLocale: string) => {
      const currentPath = pathname || '';
      const pathWithoutLocale = currentPath.replace(`/${locale}`, '');
      router.push(`/${nextLocale}${pathWithoutLocale || '/'}`);
    },
    [pathname, locale, router]
  );

  // Collapsed view
  if (isCollapsed) {
    return (
      <div
        ref={sidebarRef}
        className="relative h-full flex flex-col items-center bg-white border-r border-noble-black-200"
        style={{ width: effectiveWidth }}
      >
        {/* Navigation Icons */}
        <div className="flex-1 flex items-center justify-center pt-6">
          <div className="bg-white rounded-lg border border-noble-black-200 w-11 py-2 flex flex-col items-center space-y-2">
            {filteredNavItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.href);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center rounded-lg',
                    isActive
                      ? 'bg-whitesmoke-100 text-noble-black-600'
                      : 'text-noble-black-400'
                  )}
                  title={item.label}
                >
                  <IconComponent className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer - Language Switcher & User Avatar (Icon Only) */}
        <div className="pb-4 flex flex-col items-center gap-2 border-t border-noble-black-200 pt-3">
          <SidebarLanguageSwitcher
            active_locale={locale}
            on_select={handleLanguageChange}
            is_collapsed={true}
            icon_only={true}
          />

          {/* User Avatar in Collapsed Mode */}
          {(userName || userEmail) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-9 h-9 p-0 flex items-center justify-center rounded-lg hover:bg-whitesmoke-100"
                >
                  <EnhancedAvatar
                    src={undefined}
                    alt={userName || userEmail?.split('@')[0] || 'Admin'}
                    fallback={(userName || userEmail?.split('@')[0] || 'Admin')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                    className="h-7 w-7 ring-1 ring-gray-200 text-[10px]"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white border border-noble-black-200 rounded-lg"
              >
                <DropdownMenuLabel className="text-xs font-semibold text-noble-black-600">
                  {userName || userEmail?.split('@')[0] || 'Admin'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-noble-black-200" />
                <DropdownMenuItem
                  onClick={() => router.push(`/${locale}/profile`)}
                  className="text-xs text-noble-black-600 cursor-pointer hover:bg-whitesmoke-100"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/${locale}/admin/settings`)}
                  className="text-xs text-noble-black-600 cursor-pointer hover:bg-whitesmoke-100"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-noble-black-200" />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    router.push(`/${locale}/signin`);
                  }}
                  className="text-xs text-red-power-600 cursor-pointer hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }

  // Expanded view
  return (
    <div
      ref={sidebarRef}
      className="relative h-full flex flex-col bg-white border-r border-noble-black-200"
      style={{ width: effectiveWidth }}
    >
      {/* Navigation */}
      <div className="flex-1 pt-6 pb-6 overflow-hidden relative">
        {/* Dashboard Section */}
        {filteredNavItems.some((item) => item.section === 'dashboard') && (
          <div className="mb-4">
            <div className="px-6 mb-2">
              <h3 className="text-xs font-bold text-noble-black-300 uppercase tracking-wider">DASHBOARD</h3>
            </div>
            <div className="space-y-1">
              {filteredNavItems
                .filter((item) => item.section === 'dashboard')
                .map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={isActiveRoute(item.href)}
                    onNavigate={handleNavigation}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Super Admin Section */}
        {filteredNavItems.some((item) => item.section === 'superadmin') && (
          <div className="mb-4">
            <div className="px-6 mb-2">
              <h3 className="text-xs font-bold text-noble-black-300 uppercase tracking-wider">SUPERADMIN</h3>
            </div>
            <div className="space-y-1">
              {filteredNavItems
                .filter((item) => item.section === 'superadmin')
                .map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={isActiveRoute(item.href)}
                    onNavigate={handleNavigation}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Language Switcher & User Profile */}
      <div className="border-t border-noble-black-200">
        {/* Language Switcher */}
        <div className="px-4 py-3">
          <SidebarLanguageSwitcher
            active_locale={locale}
            on_select={handleLanguageChange}
            is_collapsed={isCollapsed}
          />
        </div>

        {/* User Profile Dropdown */}
        {(userName || userEmail) && (
          <div className="px-4 py-3 border-t border-noble-black-200">
            <UserProfileDropdown
              userName={userName}
              userEmail={userEmail}
              userRoles={userRoles}
            />
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent"
          style={{ zIndex: 50 }}
        />
      )}
    </div>
  );
}
