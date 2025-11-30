'use client';

/**
 * usePersistedTab Hook
 * Purpose: Persist tab state across page refreshes using localStorage
 * Location: shared/ui/hooks/use_persisted_tab.ts
 *
 * Features:
 * * - Persists tab selection in localStorage with page-specific keys
 * * - Automatic cleanup of invalid tabs
 * * - Fallback to default tab if no persisted value exists
 * * - Type-safe tab ID management
 *
 * Usage:
 * ```tsx
 * const [activeTab, setActiveTab] = usePersistedTab('admin-monitor', 'usage_logs');
 * ```
 */

import { useState, useEffect } from 'react';

/**
 * usePersistedTab Hook
 * Purpose: Manage and persist tab state across page refreshes
 * Params:
 *   - pageKey: Unique identifier for the page (e.g., 'admin-monitor')
 *   - defaultTab: Default tab to use if no persisted value exists
 *   - validTabs: Optional array of valid tab IDs for validation
 * Returns: [activeTab, setActiveTab, isReady] tuple where isReady indicates hydration status
 */
export function usePersistedTab(
  pageKey: string,
  defaultTab: string,
  validTabs?: string[]
): [string, (tabId: string) => void, boolean] {
  // Storage key for localStorage
  const storageKey = `admin-tab-${pageKey}`;

  // Initialize state with default tab on server, will update on client after hydration
  const [activeTab, setActiveTabState] = useState<string>(defaultTab);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration and load persisted tab
  useEffect(() => {
    setIsHydrated(true);

    // Only access localStorage and URL params on client side after hydration
    if (typeof window !== 'undefined') {
      try {
        let targetTab = defaultTab;

        // First, check URL parameter for tab
        const urlParams = new URLSearchParams(window.location.search);
        const urlTab = urlParams.get('tab');

        if (urlTab && (!validTabs || validTabs.indexOf(urlTab) !== -1)) {
          console.log(`[usePersistedTab] Using URL tab "${urlTab}" for page "${pageKey}"`);
          targetTab = urlTab;
        } else {
          // Fall back to localStorage
          const storedTab = localStorage.getItem(storageKey);

          if (storedTab && (!validTabs || validTabs.indexOf(storedTab) !== -1)) {
            console.log(`[usePersistedTab] Using stored tab "${storedTab}" for page "${pageKey}"`);
            targetTab = storedTab;
          }
        }

        // Validate final tab against valid tabs if provided
        if (targetTab && validTabs && validTabs.indexOf(targetTab) === -1) {
          console.warn(`[usePersistedTab] Invalid tab "${targetTab}" for page "${pageKey}", using default`);
          targetTab = defaultTab;
        }

        // Update state if different from current
        if (targetTab !== defaultTab) {
          setActiveTabState(targetTab);
        }
      } catch (error) {
        console.error(`[usePersistedTab] Error reading tab state:`, error);
      }
    }
  }, [pageKey, defaultTab, validTabs, storageKey]);

  // Wrapper function to update both state, localStorage, and URL
  const setActiveTab = (tabId: string) => {
    console.log(`[usePersistedTab] Setting tab "${tabId}" for page "${pageKey}"`);

    // Validate against valid tabs if provided
    if (validTabs && validTabs.indexOf(tabId) === -1) {
      console.warn(`[usePersistedTab] Invalid tab "${tabId}" for page "${pageKey}"`);
      return;
    }

    setActiveTabState(tabId);

    // Persist to localStorage and update URL (only on client side and after hydration)
    if (typeof window !== 'undefined' && isHydrated) {
      try {
        // Update localStorage
        localStorage.setItem(storageKey, tabId);
        console.log(`[usePersistedTab] Persisted tab "${tabId}" for page "${pageKey}"`);

        // Update URL without page reload
        const url = new URL(window.location.href);
        if (tabId === defaultTab) {
          // Remove tab parameter if it's the default
          url.searchParams.delete('tab');
        } else {
          url.searchParams.set('tab', tabId);
        }

        // Clean up tab-specific query parameters when switching tabs
        // Remove 'run' parameter that persists from datasets/actor-run detail views
        url.searchParams.delete('run');
        console.log(`[usePersistedTab] Cleaned up tab-specific query parameters (run) when switching to "${tabId}"`);

        // Update URL history without causing a navigation
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error(`[usePersistedTab] Error persisting tab state:`, error);
      }
    }
  };

  // Log current state for debugging
  useEffect(() => {
    console.log(`[usePersistedTab] Current active tab for "${pageKey}": "${activeTab}" (hydrated: ${isHydrated})`);
  }, [activeTab, pageKey, isHydrated]);

  return [activeTab, setActiveTab, isHydrated];
}
