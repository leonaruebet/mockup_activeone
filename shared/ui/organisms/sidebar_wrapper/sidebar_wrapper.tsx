import { cookies } from 'next/headers';
import { WorkspaceSidebar } from '@shared/ui';
import { create_trpc_client_with_headers } from '@shared/schema/src/client';

/**
 * SidebarWrapper
 *
 * Purpose: Server component that fetches user tier and passes it to WorkspaceSidebar
 * This ensures the tier is always up-to-date from the database
 *
 * @returns {Promise<JSX.Element>} WorkspaceSidebar with user tier and organization data
 *
 * @example
 * ```tsx
 * // In a server component layout
 * import { SidebarWrapper } from '@shared/ui';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <div>
 *       <SidebarWrapper />
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 */
export async function SidebarWrapper() {
  // Fetch user profile with org tier and system roles from server
  let userTier: 'free' | 'plus' | 'pro' | 'enterprise' = 'free';
  let orgName: string | null = null;
  let userRoles: string[] = ['user']; // Default to basic user role

  try {
    const store = await cookies();
    const sessionId = store.get('session_id')?.value || '';
    const devUserId = store.get('x-user-id')?.value || '';

    const client = create_trpc_client_with_headers(() => {
      const headers: Record<string, string> = {};
      if (sessionId) headers['x-session-id'] = sessionId;
      if (devUserId) headers['x-user-id'] = devUserId;
      return headers;
    });

    // Fetch user profile which includes org_tier, org_name, and system_roles
    const userProfile = await client.user.me.query();

    if (userProfile.org_tier) {
      userTier = userProfile.org_tier as 'free' | 'plus' | 'pro' | 'enterprise';
    }

    if (userProfile.org_name) {
      orgName = userProfile.org_name;
    }

    // Get system roles for admin access checks
    if (userProfile.system_roles && Array.isArray(userProfile.system_roles)) {
      userRoles = userProfile.system_roles;
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    // Will fall back to 'free' tier and default 'user' role
  }

  return (
    <WorkspaceSidebar
      userTier={userTier}
      orgName={orgName || undefined}
      userRoles={userRoles}
    />
  );
}
