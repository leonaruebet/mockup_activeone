import { redirect } from 'next/navigation';

interface ServerAuthGuardProps {
  user: any; // User object or null
  locale: string;
  redirectTo?: string;
  returnUrl?: string;
}

/**
 * ServerAuthGuard Function
 * Purpose: Server-side authentication guard that redirects unauthenticated users
 * Params:
 * - user: User object (null if not authenticated)
 * - locale: Current locale for redirect path
 * - redirectTo: Custom redirect path (optional, defaults to /login)
 * - returnUrl: URL to return to after login (optional)
 * Returns: void (redirects if unauthenticated)
 * Throws: redirect (Next.js redirect)
 */
export function serverAuthGuard({
  user,
  locale,
  redirectTo,
  returnUrl
}: ServerAuthGuardProps): void {
  if (!user) {
    // Default redirect to login with current locale
    const defaultRedirect = `/${locale}/auth/login`;
    const redirectPath = redirectTo || defaultRedirect;

    // Add return URL as query parameter for better UX
    let finalRedirect = redirectPath;
    if (returnUrl) {
      const encodedReturnUrl = encodeURIComponent(returnUrl);
      finalRedirect = `${redirectPath}?returnUrl=${encodedReturnUrl}`;
    }

    console.log('ServerAuthGuard: Redirecting unauthenticated user to:', finalRedirect);
    redirect(finalRedirect);
  }
}

/**
 * RequireAuth Higher-Order Component for Server Components
 * Purpose: Wraps server components to enforce authentication
 * Params:
 * - user: User object (null if not authenticated)
 * - locale: Current locale for redirect path
 * - redirectTo: Custom redirect path (optional)
 * - returnUrl: URL to return to after login (optional)
 * - children: Protected content to render
 * Returns: Protected content or redirects
 */
interface RequireAuthProps extends ServerAuthGuardProps {
  children: React.ReactNode;
}

export function RequireAuth({
  user,
  locale,
  redirectTo,
  returnUrl,
  children
}: RequireAuthProps) {
  serverAuthGuard({ user, locale, redirectTo, returnUrl });
  return <>{children}</>;
}