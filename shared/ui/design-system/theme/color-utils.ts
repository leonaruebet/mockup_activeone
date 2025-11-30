/**
 * Color Utilities
 * Helper functions to properly use design system colors with Tailwind CSS
 *
 * This file bridges the gap between TypeScript color tokens and Tailwind CSS classes,
 * ensuring colors render correctly without appearing as black.
 */

import { colorTokens } from '../tokens/colors';
import type { ColorToken, ColorShade } from '../tokens/colors';

/**
 * Get Tailwind color class name from color token
 *
 * @param colorName - The color token name (e.g., 'primary', 'noble-black')
 * @param shade - The color shade (e.g., 100, 500, 900)
 * @param type - The type of utility ('bg', 'text', 'border', 'ring')
 * @returns Tailwind CSS class name (e.g., 'bg-primary-600', 'text-noble-black-500')
 *
 * @example
 * ```tsx
 * // Instead of: className="bg-[#ff7500]"
 * // Use: className={getColorClass('primary', 600, 'bg')}
 * // Result: "bg-primary-600"
 * ```
 */
export function getColorClass(
  colorName: ColorToken,
  shade: ColorShade,
  type: 'bg' | 'text' | 'border' | 'ring' | 'outline' = 'bg'
): string {
  return `${type}-${colorName}-${shade}`;
}

/**
 * Get hex value from color token (for use in inline styles or non-Tailwind contexts)
 *
 * @param colorName - The color token name
 * @param shade - The color shade
 * @returns Hex color value
 *
 * @example
 * ```tsx
 * // For inline styles only (avoid if possible)
 * <div style={{ backgroundColor: getColorValue('primary', 600) }} />
 * ```
 */
export function getColorValue(colorName: ColorToken, shade: ColorShade): string {
  const colorGroup = colorTokens[colorName];
  if (typeof colorGroup === 'string') {
    return colorGroup;
  }
  return colorGroup[shade];
}

/**
 * Brand color class names using Tailwind utilities
 * These replace the hardcoded hex values in theme-utils.ts
 */
export const colorClasses = {
  // Primary brand orange - Uses Tailwind classes instead of hex
  primary: {
    bg: 'bg-primary-600',
    bgHover: 'hover:bg-primary-700',
    bgActive: 'active:bg-primary-800',
    text: 'text-primary-600',
    textHover: 'hover:text-primary-700',
    border: 'border-primary-600',
    borderHover: 'hover:border-primary-700',
    ring: 'ring-primary-600',
    light: 'bg-primary-50',
    dark: 'bg-primary-900',
  },

  // Noble black (text colors)
  text: {
    primary: 'text-noble-black-500',    // #363a3d
    secondary: 'text-noble-black-400',  // #686b6e
    muted: 'text-noble-black-300',      // #9b9c9e
    light: 'text-noble-black-200',      // #cdcecf
    inverse: 'text-white',
  },

  // Background colors
  background: {
    primary: 'bg-whitesmoke-100',       // #f9fafb
    secondary: 'bg-whitesmoke-200',     // #f4f6f8
    card: 'bg-white',
    overlay: 'bg-black/50',
    light: 'bg-noble-black-100',        // #e8e9e9
  },

  // Border colors
  border: {
    default: 'border-noble-black-200',  // #cdcecf
    light: 'border-noble-black-100',    // #e8e9e9
    primary: 'border-primary-600',      // #ff7500
  },

  // Semantic colors
  semantic: {
    success: {
      bg: 'bg-stem-green-600',
      text: 'text-stem-green-900',
      border: 'border-stem-green-600',
    },
    warning: {
      bg: 'bg-happy-orange-600',
      text: 'text-white',
      border: 'border-happy-orange-600',
    },
    error: {
      bg: 'bg-red-power-600',
      text: 'text-white',
      border: 'border-red-power-600',
    },
    info: {
      bg: 'bg-day-blue-500',
      text: 'text-white',
      border: 'border-day-blue-500',
    },
  },
} as const;

/**
 * State-based color utilities for interactive elements
 */
export const stateColors = {
  hover: {
    primary: 'hover:bg-primary-700',
    secondary: 'hover:bg-whitesmoke-200',
    ghost: 'hover:bg-whitesmoke-100',
  },
  active: {
    primary: 'active:bg-primary-800',
    secondary: 'active:bg-noble-black-200',
    ghost: 'active:bg-whitesmoke-200',
  },
  focus: {
    ring: 'focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
    outline: 'focus:outline-none',
  },
  disabled: {
    opacity: 'disabled:opacity-50',
    cursor: 'disabled:pointer-events-none',
  },
} as const;

/**
 * Generate complete button variant classes using design system colors
 *
 * @param variant - Button variant type
 * @returns Complete Tailwind class string
 */
export function getButtonVariantClasses(
  variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'success'
): string {
  const variants = {
    default: `${colorClasses.primary.bg} text-white ${colorClasses.primary.bgHover} ${colorClasses.primary.bgActive} shadow-sm hover:shadow-md`,
    secondary: `${colorClasses.background.secondary} ${colorClasses.text.primary} ${stateColors.hover.secondary} ${stateColors.active.secondary} ${colorClasses.border.default} border`,
    outline: `border ${colorClasses.border.default} bg-white ${colorClasses.text.primary} ${stateColors.hover.ghost} ${colorClasses.primary.borderHover} ${stateColors.active.ghost}`,
    ghost: `${colorClasses.text.primary} ${stateColors.hover.ghost} ${stateColors.active.ghost}`,
    link: `${colorClasses.primary.text} underline-offset-4 hover:underline ${colorClasses.primary.textHover} active:text-primary-800`,
    destructive: `${colorClasses.semantic.error.bg} ${colorClasses.semantic.error.text} hover:bg-red-power-700 active:bg-red-power-800 shadow-sm`,
    success: `${colorClasses.semantic.success.bg} ${colorClasses.semantic.success.text} hover:bg-stem-green-700 active:bg-stem-green-800 shadow-sm`,
  };

  return variants[variant] || variants.default;
}
