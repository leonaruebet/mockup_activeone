"use client";

import { useState, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  name?: string;
  status: string;
  org_id?: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    role: string;
  } | null;
  created_at: Date;
  updated_at: Date;
};

/**
 * useBetterAuth - Hook for managing user authentication state
 *
 * Purpose: Provides centralized authentication state management with
 * automatic user session fetching and error handling.
 *
 * @returns Authentication state and methods
 */
export function useBetterAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * fetchUser - Retrieves current authenticated user from API
     *
     * Purpose: Makes authenticated request to /api/user/me endpoint
     * and updates authentication state based on response.
     *
     * Error Handling:
     * - Network errors: Logged with detailed error info
     * - 401 Unauthorized: User not authenticated
     * - 404 Not Found: User session exists but user record missing
     * - 500 Server Error: Server-side error fetching user data
     */
    const fetchUser = async () => {
      console.log('[useBetterAuth] fetch_user_enter - Fetching user data from /api/user/me');

      try {
        const response = await fetch('/api/user/me', {
          credentials: 'include', // Include cookies for session
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('[useBetterAuth] fetch_user_response', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('[useBetterAuth] fetch_user_success - User authenticated', {
            user_id: userData.id,
            email: userData.email,
            has_organization: !!userData.organization,
          });
          setUser(userData);
          setIsAuthenticated(true);
          setError(null);
        } else {
          // Handle different HTTP error statuses
          const errorMessage = response.status === 401
            ? 'User not authenticated'
            : response.status === 404
            ? 'User not found'
            : `Authentication failed with status ${response.status}`;

          console.log('[useBetterAuth] fetch_user_not_authenticated', {
            status: response.status,
            error: errorMessage,
          });

          setUser(null);
          setIsAuthenticated(false);
          setError(errorMessage);
        }
      } catch (error) {
        // Network or other fetch errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorName = error instanceof Error ? error.name : 'Error';

        console.error('[useBetterAuth] fetch_user_error - Network or fetch failed', {
          error_name: errorName,
          error_message: errorMessage,
          error_stack: error instanceof Error ? error.stack : undefined,
          error_type: typeof error,
        });

        // Set user state to unauthenticated but don't treat network errors as authentication failures
        setUser(null);
        setIsAuthenticated(false);
        setError(`Failed to connect: ${errorMessage}`);
      } finally {
        console.log('[useBetterAuth] fetch_user_exit - Loading complete');
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  /**
   * signOut - Logs out the current user
   *
   * Purpose: Makes POST request to /api/auth/logout to invalidate
   * the user session and clears local authentication state.
   *
   * Error Handling: Logs errors but doesn't throw to prevent UI breakage
   */
  const signOut = async () => {
    console.log('[useBetterAuth] sign_out_enter - Logging out user');

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('[useBetterAuth] sign_out_success - User logged out');
        setUser(null);
        setIsAuthenticated(false);
        setError(null);
      } else {
        console.error('[useBetterAuth] sign_out_failed', {
          status: response.status,
          statusText: response.statusText,
        });
        // Still clear local state even if server logout fails
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[useBetterAuth] sign_out_error - Logout request failed', {
        error_message: errorMessage,
        error_stack: error instanceof Error ? error.stack : undefined,
      });
      // Clear local state even on network error
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      console.log('[useBetterAuth] sign_out_exit');
    }
  };

  return {
    user,
    profile: user?.organization ? {
      role: user.organization.role,
      organization_name: user.organization.name,
      organization_id: user.organization.id
    } : null,
    isAuthenticated,
    isLoading,
    error,
    signOut,
  };
}
