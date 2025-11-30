"use client";

import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { get_local_storage_item, set_local_storage_item, STORAGE_KEYS } from '../utils/local_storage';

type SidebarContextValue = {
  sidebarWidth: number;
  setSidebarWidth: (w: number) => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

/**
 * SidebarProvider - Manages sidebar state with localStorage persistence
 *
 * Persists sidebar collapsed state and width across page navigation and browser refresh.
 * Loads saved state on mount and saves changes automatically.
 *
 * Uses useEffect to avoid SSR hydration mismatches by loading localStorage after initial render.
 *
 * @param {React.ReactNode} children - Child components
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Initialize with default values to match SSR
  const [sidebarWidth, setSidebarWidthState] = useState<number>(207);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [_isHydrated, setIsHydrated] = useState<boolean>(false);

  // Load state from localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    const saved_width = get_local_storage_item<number>(STORAGE_KEYS.SIDEBAR_WIDTH, 207);
    const saved_collapsed = get_local_storage_item<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);

    setSidebarWidthState(saved_width);
    setIsCollapsed(saved_collapsed);
    setIsHydrated(true);
  }, []);

  // Persist sidebar width to localStorage when it changes
  const setSidebarWidth = useCallback((w: number) => {
    setSidebarWidthState(w);
    set_local_storage_item(STORAGE_KEYS.SIDEBAR_WIDTH, w);
  }, []);

  // Toggle collapsed state and persist to localStorage
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const new_collapsed = !prev;
      set_local_storage_item(STORAGE_KEYS.SIDEBAR_COLLAPSED, new_collapsed);
      return new_collapsed;
    });
  }, []);

  const value = useMemo(
    () => ({ sidebarWidth, setSidebarWidth, isCollapsed, toggleCollapsed }),
    [sidebarWidth, setSidebarWidth, isCollapsed, toggleCollapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebarWidth() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    // Provide a safe fallback to avoid build/runtime crashes
    return {
      sidebarWidth: 207,
      setSidebarWidth: (__w: number) => void 0,
      isCollapsed: false,
      toggleCollapsed: () => void 0,
    } as SidebarContextValue;
  }
  return ctx;
}

// Backward-compat safe hook name used by Topbar fallback pattern
export const useSidebarWidthSafe = useSidebarWidth;

