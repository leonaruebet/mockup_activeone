/**
 * Mobile Helper Utilities
 * Purpose: Utilities for mobile-specific functionality
 * Location: shared/ui/utils/mobile_helpers.ts
 *
 * Features:
 * - Viewport detection (mobile/tablet/desktop)
 * - Input type helpers for mobile keyboards
 * - Touch detection
 * - Safe area utilities
 */

/**
 * Viewport Breakpoints (matches Tailwind)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Check if current viewport is mobile
 * @returns true if viewport width < 768px
 */
export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < BREAKPOINTS.md
}

/**
 * Check if current viewport is tablet
 * @returns true if viewport width >= 768px and < 1024px
 */
export const isTabletViewport = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg
}

/**
 * Check if current viewport is desktop
 * @returns true if viewport width >= 1024px
 */
export const isDesktopViewport = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= BREAKPOINTS.lg
}

/**
 * Check if device supports touch
 * @returns true if touch is supported
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * Check if running on iOS
 * @returns true if iOS device
 */
export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * Check if running on Android
 * @returns true if Android device
 */
export const isAndroid = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

/**
 * Get optimal input type for mobile keyboard
 *
 * @param purpose - The purpose of the input field
 * @returns Optimal HTML input type
 *
 * Usage:
 * ```tsx
 * <input type={getInputType('email')} />
 * ```
 */
export const getInputType = (
  purpose: 'email' | 'phone' | 'number' | 'url' | 'search' | 'text'
): string => {
  return purpose
}

/**
 * Get optimal inputMode for mobile keyboard
 *
 * @param purpose - The purpose of the input field
 * @returns Optimal inputMode attribute
 *
 * Usage:
 * ```tsx
 * <input inputMode={getInputMode('phone')} />
 * ```
 */
export const getInputMode = (
  purpose: 'email' | 'phone' | 'number' | 'decimal' | 'url' | 'search' | 'text'
): 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url' => {
  const modes = {
    email: 'email',
    phone: 'tel',
    number: 'numeric',
    decimal: 'decimal',
    url: 'url',
    search: 'search',
    text: 'text',
  } as const

  return modes[purpose]
}

/**
 * Get autocomplete value for better mobile experience
 *
 * @param field - The field type
 * @returns Optimal autocomplete value
 */
export const getAutocomplete = (
  field: 'name' | 'email' | 'phone' | 'address' | 'postal-code' | 'country' | 'cc-number' | 'cc-exp' | 'cc-csc' | 'off'
): string => {
  return field
}

/**
 * Prevent zoom on input focus (iOS)
 *
 * Call this in useEffect to prevent iOS from zooming when focusing inputs
 *
 * Usage:
 * ```tsx
 * useEffect(() => {
 *   preventZoomOnFocus()
 * }, [])
 * ```
 */
export const preventZoomOnFocus = (): void => {
  if (!isIOS()) return

  const viewport = document.querySelector('meta[name=viewport]')
  if (viewport) {
    const originalContent = viewport.getAttribute('content')
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1'
    )

    // Restore on blur
    document.addEventListener('focusout', () => {
      if (originalContent) {
        viewport.setAttribute('content', originalContent)
      }
    })
  }
}

/**
 * Scroll element into view with mobile-friendly offset
 *
 * @param element - Element to scroll to
 * @param offset - Additional offset in pixels (default: 80 for mobile nav)
 */
export const scrollIntoViewMobile = (
  element: HTMLElement,
  offset: number = 80
): void => {
  const y = element.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({ top: y, behavior: 'smooth' })
}

/**
 * Get safe area insets (for iPhone notch)
 *
 * @returns Safe area insets in pixels
 */
export const getSafeAreaInsets = (): {
  top: number
  right: number
  bottom: number
  left: number
} => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const style = getComputedStyle(document.documentElement)

  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
  }
}

/**
 * React Hook: Use viewport detection
 *
 * @returns Current viewport info
 *
 * Usage:
 * ```tsx
 * const { isMobile, isTablet, isDesktop } = useViewport()
 * ```
 */
export const useViewport = () => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      width: 1024,
      height: 768,
    }
  }

  const [viewport, setViewport] = React.useState({
    isMobile: isMobileViewport(),
    isTablet: isTabletViewport(),
    isDesktop: isDesktopViewport(),
    width: window.innerWidth,
    height: window.innerHeight,
  })

  React.useEffect(() => {
    const handleResize = () => {
      setViewport({
        isMobile: isMobileViewport(),
        isTablet: isTabletViewport(),
        isDesktop: isDesktopViewport(),
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

// Import React for useEffect hook
import React from 'react'

/**
 * Input validation helpers for mobile
 */
export const validators = {
  /**
   * Validate email format
   */
  email: (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  },

  /**
   * Validate phone number (international format)
   */
  phone: (value: string): boolean => {
    return /^\+?[1-9]\d{1,14}$/.test(value.replace(/[\s()-]/g, ''))
  },

  /**
   * Validate URL
   */
  url: (value: string): boolean => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },
}

/**
 * Format phone number for display
 * @param phone - Raw phone number
 * @returns Formatted phone number
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX for 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  // Format as +X (XXX) XXX-XXXX for international
  if (cleaned.length > 10) {
    const countryCode = cleaned.slice(0, cleaned.length - 10)
    const rest = cleaned.slice(-10)
    return `+${countryCode} (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`
  }

  return phone
}
