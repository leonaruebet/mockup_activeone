/**
 * use_dictionary Hook
 * Purpose: Centralized dictionary/i18n loading hook
 * Location: shared/ui/hooks/use_dictionary.ts
 *
 * Usage: Replace duplicated getDictionary + useState + useEffect patterns
 * Example:
 *   import { use_dictionary } from '@shared/ui/hooks'
 *   const { dict, loading } = use_dictionary(locale);
 *
 * Changelog:
 * - 2025-10-26: Initial extraction from 34+ duplicated dictionary loading patterns
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Dictionary hook for loading localized translations
 * Purpose: Simplifies i18n dictionary loading with built-in loading state
 *
 * Eliminates the need for manual useState + useEffect boilerplate:
 * BEFORE:
 *   const [dict, setDict] = useState<any>(null);
 *   useEffect(() => {
 *     getDictionary(locale as 'en' | 'th').then(setDict);
 *   }, [locale]);
 *
 * AFTER:
 *   const { dict, loading } = use_dictionary(locale);
 *
 * @param locale - The locale string ('en' | 'th')
 * @param getDictionary - Dictionary loader function (injected for flexibility)
 * @returns Object containing dictionary data and loading state
 *
 * @example
 * ```tsx
 * import { use_dictionary } from '@shared/ui/hooks';
 * import { getDictionary } from '@/i18n';
 *
 * export default function MyComponent({ locale }: { locale: string }) {
 *   const { dict, loading } = use_dictionary(locale, getDictionary);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!dict) return <div>Error loading translations</div>;
 *
 *   return <div>{dict.welcome}</div>;
 * }
 * ```
 */
export function use_dictionary<T = any>(
  locale: string,
  getDictionary: (locale: 'en' | 'th') => Promise<T>
): {
  dict: T | null;
  loading: boolean;
  error: Error | null;
} {
  console.log('[use_dictionary] Initializing for locale:', locale);

  const [dict, setDict] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('[use_dictionary] Loading dictionary for locale:', locale);
    setLoading(true);
    setError(null);

    getDictionary(locale as 'en' | 'th')
      .then((loadedDict) => {
        console.log('[use_dictionary] Dictionary loaded successfully for locale:', locale);
        setDict(loadedDict);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[use_dictionary] Failed to load dictionary for locale:', locale, err);
        setError(err instanceof Error ? err : new Error('Unknown error loading dictionary'));
        setLoading(false);
      });
  }, [locale, getDictionary]);

  return { dict, loading, error };
}
