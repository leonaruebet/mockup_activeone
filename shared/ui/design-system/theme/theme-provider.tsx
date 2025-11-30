"use client"

/**
 * Theme Provider for ActiveOne Brand
 * Provides theme context with brand consistency
 */

import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';
import { brandTokens, type BrandTokens } from './brand-tokens';

interface ThemeContextValue {
  tokens: BrandTokens;
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: 'light' | 'dark';
  customTokens?: Partial<BrandTokens>;
}

export function ThemeProvider({
  children,
  initialMode = 'light',
  customTokens = {},
}: ThemeProviderProps) {
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Merge custom tokens with brand tokens (brand tokens take precedence)
  const tokens = useMemo(
    () => ({
      ...brandTokens,
      ...customTokens,
      // Brand identity is always preserved
      brand: brandTokens.brand,
    }),
    [customTokens],
  );

  const value = useMemo(() => ({
    tokens,
    mode,
    toggleMode,
  }), [tokens, mode, toggleMode]);

  return (
    <ThemeContext.Provider value={value}>
      <div className={mode === 'dark' ? 'dark' : ''} data-theme={mode}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useBrandTokens() {
  const { tokens } = useTheme();
  return tokens.brand;
}
