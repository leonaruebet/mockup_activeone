'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  locale?: string;
  redirectTo?: string;
  fallbackComponent?: React.ReactNode;
}

/**
 * AuthGuard Component
 * Purpose: Automatically redirects unauthenticated users to login page
 * Params:
 * - children: Components to render when authenticated
 * - isAuthenticated: Boolean indicating if user is logged in
 * - locale: Current locale for redirect path (optional)
 * - redirectTo: Custom redirect path (optional, defaults to /login)
 * - fallbackComponent: Component to show while redirecting (optional)
 * Returns: Protected content or fallback/null during redirect
 * Throws: none (graceful error handling)
 */
export function AuthGuard({
  children,
  isAuthenticated,
  locale = 'en',
  redirectTo,
  fallbackComponent = null
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      // Default redirect to login with current locale
      const defaultRedirect = `/${locale}/auth/login`;
      const redirectPath = redirectTo || defaultRedirect;

      // Add return URL as query parameter for better UX
      const returnUrl = encodeURIComponent(pathname);
      const finalRedirect = `${redirectPath}?returnUrl=${returnUrl}`;

      console.log('AuthGuard: Redirecting unauthenticated user to:', finalRedirect);
      router.replace(finalRedirect);
    }
  }, [isAuthenticated, router, locale, redirectTo, pathname]);

  // Show fallback component while redirecting
  if (!isAuthenticated) {
    return fallbackComponent;
  }

  // Render protected content
  return <>{children}</>;
}