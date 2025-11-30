/**
 * Theme Utilities
 * Helper functions for working with the ActiveOne theme system
 */

import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { brandTokens } from './brand-tokens';

/**
 * Utility function to merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get brand-specific CSS variables for runtime theme application
 */
export function getBrandCSSVars(mode: 'light' | 'dark' = 'light') {
  const baseVars = {
    '--brand-orange-primary': brandTokens.brand.primary.orange[600],
    '--brand-orange-light': brandTokens.brand.primary.orange[100],
    '--brand-orange-dark': brandTokens.brand.primary.orange[800],
    '--font-primary': brandTokens.brand.fonts.primary,
    '--font-secondary': brandTokens.brand.fonts.secondary,
  };

  if (mode === 'dark') {
    return {
      ...baseVars,
      '--background': brandTokens.semantic['noble-black'][900],
      '--foreground': brandTokens.semantic['noble-black'][100],
      '--primary': brandTokens.brand.primary.orange[400],
      '--primary-foreground': brandTokens.semantic['noble-black'][900],
    };
  }

  return {
    ...baseVars,
    '--background': brandTokens.system.background.DEFAULT,
    '--foreground': brandTokens.semantic['noble-black'][900],
    '--primary': brandTokens.brand.primary.orange[600],
    '--primary-foreground': '#ffffff',
  };
}

/**
 * Generate Tailwind class strings for brand colors
 *
 * IMPORTANT: Updated to use Tailwind color utilities from design system
 * instead of hardcoded hex values to ensure proper color rendering.
 *
 * @deprecated Use colorClasses from './color-utils' for new code
 */
export const brandClasses = {
  // Primary brand orange variations - Using Tailwind classes
  primary: {
    bg: 'bg-primary-600',           // was: bg-[#ff7500]
    bgHover: 'hover:bg-primary-700', // was: hover:bg-[#e86a00]
    text: 'text-primary-600',       // was: text-[#ff7500]
    border: 'border-primary-600',   // was: border-[#ff7500]
    light: 'bg-primary-50',         // was: bg-[#fff1e6]
    dark: 'bg-primary-900',         // was: bg-[#8c4000]
  },
  // Noble black variations - Using Tailwind classes
  text: {
    primary: 'text-noble-black-500',   // was: text-[#363a3d]
    secondary: 'text-noble-black-400', // was: text-[#686b6e]
    muted: 'text-noble-black-300',     // was: text-[#9b9c9e]
    inverse: 'text-white',
  },
  // Background variations - Using Tailwind classes
  background: {
    primary: 'bg-whitesmoke-100',   // was: bg-[#f9fafb]
    secondary: 'bg-whitesmoke-200', // was: bg-[#f4f6f8]
    card: 'bg-white',
    overlay: 'bg-black/50',
  },
} as const;

/**
 * Responsive typography scale following brand guidelines
 */
export const typographyScale = {
  'display-xl': 'text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight',
  'display-lg': 'text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight',
  'display-md': 'text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight',
  'display-sm': 'text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight',
  'heading-xl': 'text-2xl lg:text-3xl font-semibold',
  'heading-lg': 'text-xl lg:text-2xl font-semibold',
  'heading-md': 'text-lg lg:text-xl font-semibold',
  'heading-sm': 'text-base lg:text-lg font-semibold',
  'body-lg': 'text-lg leading-relaxed',
  'body-md': 'text-base leading-relaxed',
  'body-sm': 'text-sm leading-relaxed',
  'caption': 'text-xs leading-tight text-noble-black-400', // was: text-[#686b6e]
} as const;

/**
 * Spacing scale following brand design system
 */
export const spacingScale = {
  'xs': 'space-y-1',
  'sm': 'space-y-2',
  'md': 'space-y-4',
  'lg': 'space-y-6',
  'xl': 'space-y-8',
  '2xl': 'space-y-12',
} as const;
