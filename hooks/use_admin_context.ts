'use client';

/**
 * use_admin_context
 * Purpose: Hook to detect if the current page is in admin context
 * Location: apps/web/hooks/use_admin_context.ts
 *
 * Returns: boolean indicating if we're in /admin route
 *
 * Usage:
 * ```tsx
 * const is_admin_context = use_admin_context();
 * const { data } = trpc.scraper_config.list_configs.useQuery({
 *   admin_context: is_admin_context,
 *   // ... other params
 * });
 * ```
 */

import { usePathname } from 'next/navigation';

/**
 * use_admin_context
 * Purpose: Detect if current route is within /admin section
 * Returns: true if pathname starts with /[locale]/admin
 */
export function use_admin_context(): boolean {
  const pathname = usePathname();

  // Check if pathname includes /admin segment
  // Pattern: /en/admin/... or /th/admin/...
  const is_admin = pathname?.includes('/admin') ?? false;

  console.log('[use_admin_context] Pathname:', pathname, 'Is admin:', is_admin);

  return is_admin;
}
