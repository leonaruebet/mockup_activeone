'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useCsrfToken - Reusable hook for CSRF token management
 * Purpose: Provide consistent CSRF token handling across all forms
 * Features: Auto-fetching, refresh capability, proper error handling
 */
export function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * fetchCsrfToken
   * Purpose: Fetch a fresh CSRF token from the server
   */
  const fetchCsrfToken = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const token = result.csrf_token;
      setCsrfToken(token);
      setIsLoading(false);
      return token;
    } catch (error) {
      const errorMessage = 'Failed to fetch CSRF token';
      setError(errorMessage);
      setIsLoading(false);
      console.error('CSRF token fetch error:', error);
      return null;
    }
  }, []);

  /**
   * getFreshCsrfToken
   * Purpose: Get a fresh CSRF token for form submission
   * Returns: Promise that resolves to token string or null
   */
  const getFreshCsrfToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const freshToken = result.csrf_token;
      setCsrfToken(freshToken);
      return freshToken;
    } catch (error) {
      console.error('Failed to fetch fresh CSRF token:', error);
      setError('Failed to get security token');
      return null;
    }
  }, []);

  /**
   * createSecureFormData
   * Purpose: Create form data object with CSRF token
   * @param formData - Form data to include CSRF token with
   * @param csrfToken - CSRF token to include (uses current if not provided)
   * @returns Object with form data and CSRF token using correct field name
   */
  const createSecureFormData = useCallback((
    formData: Record<string, any>,
    token?: string
  ): Record<string, any> => {
    const tokenToUse = token || csrfToken;
    if (!tokenToUse) {
      throw new Error('CSRF token not available');
    }

    return {
      ...formData,
      _csrf_token: tokenToUse  // Use the correct field name from CSRF config
    };
  }, [csrfToken]);

  /**
   * submitSecureForm
   * Purpose: Submit form with fresh CSRF token and proper error handling
   * @param url - API endpoint URL
   * @param formData - Form data to submit
   * @param options - Additional fetch options
   * @returns Promise with response data
   */
  const submitSecureForm = useCallback(async (
    url: string,
    formData: Record<string, any>,
    options: RequestInit = {}
  ): Promise<any> => {
    // Get fresh CSRF token for submission
    const freshToken = await getFreshCsrfToken();
    if (!freshToken) {
      throw new Error('Security token not available. Please refresh the page.');
    }

    // Create secure form data with CSRF token
    const secureData = createSecureFormData(formData, freshToken);

    // Submit form
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(secureData),
      credentials: 'include', // Allow cookies to be sent and stored
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  }, [getFreshCsrfToken, createSecureFormData]);

  // Auto-fetch CSRF token on mount
  useEffect(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  return {
    csrfToken,
    isLoading,
    error,
    fetchCsrfToken,
    getFreshCsrfToken,
    createSecureFormData,
    submitSecureForm
  };
}

/**
 * withCsrfProtection - HOC for components that need CSRF protection
 * Purpose: Wrap components to automatically provide CSRF token management
 */
export function withCsrfProtection<P extends object>(
  WrappedComponent: React.ComponentType<P & { csrf: ReturnType<typeof useCsrfToken> }>
) {
  return function CsrfProtectedComponent(props: P) {
    const csrf = useCsrfToken();

    return <WrappedComponent {...props} csrf={csrf} />;
  };
}

/**
 * CsrfTokenProvider - Context provider for CSRF token sharing
 * Purpose: Share CSRF token state across multiple components
 */
import { createContext, useContext } from 'react';

const CsrfTokenContext = createContext<ReturnType<typeof useCsrfToken> | null>(null);

export function CsrfTokenProvider({ children }: { children: React.ReactNode }) {
  const csrf = useCsrfToken();

  return (
    <CsrfTokenContext.Provider value={csrf}>
      {children}
    </CsrfTokenContext.Provider>
  );
}

export function useCsrfTokenContext() {
  const context = useContext(CsrfTokenContext);
  if (!context) {
    throw new Error('useCsrfTokenContext must be used within a CsrfTokenProvider');
  }
  return context;
}