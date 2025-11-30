"use client"

import { useEffect, useState } from "react"

// Mobile breakpoint constant - matches design system standard
const MOBILE_BREAKPOINT = 768;

/**
 * Enhanced mobile detection hook - Consolidated from multiple implementations
 * Provides consistent mobile breakpoint detection across all applications
 * 
 * @returns boolean indicating if screen width is below mobile breakpoint
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
} 